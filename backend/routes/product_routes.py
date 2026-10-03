from flask import Blueprint, request, jsonify
from database import get_db
from auth import login_required

product_bp = Blueprint('products', __name__)

@product_bp.route('', methods=['GET'])
def get_products():
    search = request.args.get('search', '').strip()
    category_id = request.args.get('category_id')
    supplier_id = request.args.get('supplier_id')
    stock_status = request.args.get('stock_status')  # 'low', 'in_stock', 'out_of_stock'

    query = """
        SELECT p.*, 
               c.category_name, 
               s.supplier_name,
               CASE 
                   WHEN p.current_stock = 0 THEN 'Out of Stock'
                   WHEN p.current_stock <= p.minimum_stock THEN 'Low Stock'
                   ELSE 'In Stock'
               END AS stock_status
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
        WHERE 1=1
    """
    params = []

    if search:
        query += " AND (p.product_name LIKE %s OR p.sku LIKE %s OR c.category_name LIKE %s OR s.supplier_name LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%", f"%{search}%"])

    if category_id:
        query += " AND p.category_id = %s"
        params.append(category_id)

    if supplier_id:
        query += " AND p.supplier_id = %s"
        params.append(supplier_id)

    if stock_status == 'low':
        query += " AND p.current_stock <= p.minimum_stock AND p.current_stock > 0"
    elif stock_status == 'out_of_stock':
        query += " AND p.current_stock = 0"
    elif stock_status == 'in_stock':
        query += " AND p.current_stock > p.minimum_stock"

    query += " ORDER BY p.product_id DESC"

    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, tuple(params))
                products = cursor.fetchall()
                # Format decimal to float for clean JSON
                for p in products:
                    p['price'] = float(p['price'])
                return jsonify({"success": True, "data": products})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT p.*, c.category_name, s.supplier_name
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.category_id
                    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
                    WHERE p.product_id = %s
                """, (product_id,))
                product = cursor.fetchone()
                if not product:
                    return jsonify({"success": False, "message": "Product not found"}), 404
                product['price'] = float(product['price'])
                return jsonify({"success": True, "data": product})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@product_bp.route('', methods=['POST'])
@login_required
def create_product():
    data = request.get_json() or {}
    name = data.get('product_name', '').strip()
    category_id = data.get('category_id')
    supplier_id = data.get('supplier_id') or None
    sku = data.get('sku', '').strip() or None
    price = data.get('price')
    current_stock = data.get('current_stock', 0)
    minimum_stock = data.get('minimum_stock', 5)
    description = data.get('description', '').strip()

    # Validations
    if not name:
        return jsonify({"success": False, "message": "Product name is required"}), 400
    if not category_id:
        return jsonify({"success": False, "message": "Category is required"}), 400

    try:
        price = float(price)
        current_stock = int(current_stock)
        minimum_stock = int(minimum_stock)
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid numeric values for price or stock"}), 400

    if price < 0 or current_stock < 0 or minimum_stock < 0:
        return jsonify({"success": False, "message": "Price and stock levels must be non-negative"}), 400

    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Verify category exists
                cursor.execute("SELECT category_id FROM categories WHERE category_id = %s", (category_id,))
                if not cursor.fetchone():
                    return jsonify({"success": False, "message": "Selected category does not exist"}), 400

                # Verify supplier if provided
                if supplier_id:
                    cursor.execute("SELECT supplier_id FROM suppliers WHERE supplier_id = %s", (supplier_id,))
                    if not cursor.fetchone():
                        return jsonify({"success": False, "message": "Selected supplier does not exist"}), 400

                cursor.execute("""
                    INSERT INTO products (product_name, category_id, supplier_id, sku, price, current_stock, minimum_stock, description)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (name, category_id, supplier_id, sku, price, current_stock, minimum_stock, description))
                product_id = cursor.lastrowid

                # If initial stock > 0, log STOCK_IN transaction
                if current_stock > 0:
                    cursor.execute("""
                        INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_id, notes)
                        VALUES (%s, 'STOCK_IN', %s, %s, 'Initial inventory setup')
                    """, (product_id, current_stock, f"INIT-{product_id}"))

                return jsonify({
                    "success": True,
                    "message": "Product created successfully",
                    "data": {"product_id": product_id, "product_name": name}
                }), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@product_bp.route('/<int:product_id>', methods=['PUT'])
@login_required
def update_product(product_id):
    data = request.get_json() or {}
    name = data.get('product_name', '').strip()
    category_id = data.get('category_id')
    supplier_id = data.get('supplier_id') or None
    sku = data.get('sku', '').strip() or None
    price = data.get('price')
    minimum_stock = data.get('minimum_stock')
    description = data.get('description', '').strip()

    if not name or not category_id:
        return jsonify({"success": False, "message": "Product name and category are required"}), 400

    try:
        price = float(price)
        minimum_stock = int(minimum_stock)
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Price and minimum stock must be valid numbers"}), 400

    if price < 0 or minimum_stock < 0:
        return jsonify({"success": False, "message": "Price and minimum stock must be non-negative"}), 400

    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE products
                    SET product_name = %s, category_id = %s, supplier_id = %s, sku = %s, price = %s, minimum_stock = %s, description = %s
                    WHERE product_id = %s
                """, (name, category_id, supplier_id, sku, price, minimum_stock, description, product_id))
                if cursor.rowcount == 0:
                    return jsonify({"success": False, "message": "Product not found"}), 404
                return jsonify({"success": True, "message": "Product updated successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@product_bp.route('/<int:product_id>', methods=['DELETE'])
@login_required
def delete_product(product_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Check for sale items
                cursor.execute("SELECT COUNT(*) as count FROM sale_items WHERE product_id = %s", (product_id,))
                res = cursor.fetchone()
                if res and res['count'] > 0:
                    return jsonify({
                        "success": False,
                        "message": f"Cannot delete product: it is referenced in {res['count']} sales transactions."
                    }), 400

                cursor.execute("DELETE FROM products WHERE product_id = %s", (product_id,))
                if cursor.rowcount == 0:
                    return jsonify({"success": False, "message": "Product not found"}), 404
                return jsonify({"success": True, "message": "Product deleted successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
