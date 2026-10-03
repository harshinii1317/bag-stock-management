from flask import Blueprint, request, jsonify
from database import get_db
from auth import login_required

stock_bp = Blueprint('stock', __name__)

@stock_bp.route('/low', methods=['GET'])
def get_low_stock():
    """
    Returns products where current_stock <= minimum_stock.
    Dynamically calculated from products and categories.
    """
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT p.product_id, p.product_name, p.sku, p.price,
                           p.current_stock, p.minimum_stock,
                           (p.minimum_stock - p.current_stock) AS deficit_quantity,
                           c.category_name,
                           s.supplier_name, s.phone as supplier_phone,
                           CASE
                               WHEN p.current_stock = 0 THEN 'Out of Stock'
                               ELSE 'Low Stock'
                           END AS status
                    FROM products p
                    JOIN categories c ON p.category_id = c.category_id
                    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
                    WHERE p.current_stock <= p.minimum_stock
                    ORDER BY p.current_stock ASC, (p.minimum_stock - p.current_stock) DESC
                """)
                low_stock = cursor.fetchall()
                for item in low_stock:
                    item['price'] = float(item['price'])
                return jsonify({"success": True, "data": low_stock})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@stock_bp.route('/<int:product_id>', methods=['GET'])
def get_product_stock(product_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT p.product_id, p.product_name, p.price, p.current_stock, p.minimum_stock,
                           c.category_name, s.supplier_name
                    FROM products p
                    JOIN categories c ON p.category_id = c.category_id
                    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
                    WHERE p.product_id = %s
                """, (product_id,))
                p = cursor.fetchone()
                if not p:
                    return jsonify({"success": False, "message": "Product not found"}), 404
                p['price'] = float(p['price'])
                return jsonify({"success": True, "data": p})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@stock_bp.route('/restock', methods=['POST'])
@login_required
def restock_product():
    """
    Adds incoming inventory:
    1. Validate product_id & added_quantity
    2. Retrieve current stock
    3. Update product stock = current_stock + added_quantity
    4. Record STOCK_IN in stock_transactions
    5. Commit
    """
    data = request.get_json() or {}
    product_id = data.get('product_id')
    try:
        quantity = int(data.get('quantity', 0))
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Quantity must be a valid integer"}), 400

    notes = data.get('notes', 'Manual Restock').strip()
    reference_id = data.get('reference_id', '').strip() or None

    if not product_id:
        return jsonify({"success": False, "message": "Product ID is required"}), 400
    if quantity <= 0:
        return jsonify({"success": False, "message": "Quantity to restock must be greater than zero"}), 400

    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT product_id, product_name, current_stock, minimum_stock FROM products WHERE product_id = %s FOR UPDATE", (product_id,))
                product = cursor.fetchone()
                if not product:
                    return jsonify({"success": False, "message": "Product not found"}), 404

                prev_stock = product['current_stock']
                new_stock = prev_stock + quantity

                # Update product stock
                cursor.execute("""
                    UPDATE products
                    SET current_stock = %s
                    WHERE product_id = %s
                """, (new_stock, product_id))

                # Insert transaction log
                cursor.execute("""
                    INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_id, notes)
                    VALUES (%s, 'STOCK_IN', %s, %s, %s)
                """, (product_id, quantity, reference_id, notes))

                return jsonify({
                    "success": True,
                    "message": f"Successfully restocked {quantity} units of '{product['product_name']}'. New stock: {new_stock}",
                    "data": {
                        "product_id": product_id,
                        "product_name": product['product_name'],
                        "previous_stock": prev_stock,
                        "added_quantity": quantity,
                        "new_stock": new_stock
                    }
                })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@stock_bp.route('/transactions', methods=['GET'])
def get_transactions():
    product_id = request.args.get('product_id')
    transaction_type = request.args.get('type')  # STOCK_IN, STOCK_OUT
    limit = int(request.args.get('limit', 100))

    query = """
        SELECT st.*, p.product_name, p.sku, c.category_name
        FROM stock_transactions st
        JOIN products p ON st.product_id = p.product_id
        JOIN categories c ON p.category_id = c.category_id
        WHERE 1=1
    """
    params = []

    if product_id:
        query += " AND st.product_id = %s"
        params.append(product_id)

    if transaction_type in ['STOCK_IN', 'STOCK_OUT']:
        query += " AND st.transaction_type = %s"
        params.append(transaction_type)

    query += " ORDER BY st.transaction_date DESC LIMIT %s"
    params.append(limit)

    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, tuple(params))
                return jsonify({"success": True, "data": cursor.fetchall()})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
