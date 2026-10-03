from flask import Blueprint, request, jsonify
from database import get_db
from auth import login_required

sales_bp = Blueprint('sales', __name__)

@sales_bp.route('', methods=['GET'])
def get_sales():
    customer_id = request.args.get('customer_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    query = """
        SELECT s.sale_id, s.sale_date, s.total_amount, s.payment_method, s.notes,
               c.customer_id, c.customer_name, c.phone as customer_phone,
               GROUP_CONCAT(CONCAT(p.product_name, ' (x', si.quantity, ')') SEPARATOR ', ') AS items_summary,
               SUM(si.quantity) as total_items_sold
        FROM sales s
        JOIN customers c ON s.customer_id = c.customer_id
        JOIN sale_items si ON s.sale_id = si.sale_id
        JOIN products p ON si.product_id = p.product_id
        WHERE 1=1
    """
    params = []

    if customer_id:
        query += " AND s.customer_id = %s"
        params.append(customer_id)

    if start_date:
        query += " AND DATE(s.sale_date) >= %s"
        params.append(start_date)

    if end_date:
        query += " AND DATE(s.sale_date) <= %s"
        params.append(end_date)

    query += " GROUP BY s.sale_id ORDER BY s.sale_date DESC"

    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, tuple(params))
                sales = cursor.fetchall()
                for s in sales:
                    s['total_amount'] = float(s['total_amount'])
                return jsonify({"success": True, "data": sales})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@sales_bp.route('/<int:sale_id>', methods=['GET'])
def get_sale_detail(sale_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT s.sale_id, s.sale_date, s.total_amount, s.payment_method, s.notes,
                           c.customer_id, c.customer_name, c.phone, c.email, c.address
                    FROM sales s
                    JOIN customers c ON s.customer_id = c.customer_id
                    WHERE s.sale_id = %s
                """, (sale_id,))
                sale = cursor.fetchone()
                if not sale:
                    return jsonify({"success": False, "message": "Sale transaction not found"}), 404
                sale['total_amount'] = float(sale['total_amount'])

                cursor.execute("""
                    SELECT si.sale_item_id, si.product_id, p.product_name, p.sku,
                           si.quantity, si.unit_price, si.subtotal
                    FROM sale_items si
                    JOIN products p ON si.product_id = p.product_id
                    WHERE si.sale_id = %s
                """, (sale_id,))
                items = cursor.fetchall()
                for it in items:
                    it['unit_price'] = float(it['unit_price'])
                    it['subtotal'] = float(it['subtotal'])
                sale['items'] = items

                return jsonify({"success": True, "data": sale})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@sales_bp.route('', methods=['POST'])
@login_required
def create_sale():
    """
    Transactional sale creation:
    1. Validate customer & items
    2. Check stock availability for all products (FOR UPDATE)
    3. Calculate subtotals and total_amount
    4. Insert into sales
    5. Insert into sale_items
    6. Decrement product stock
    7. Insert STOCK_OUT stock_transactions
    8. Commit transaction (automatic with get_db context manager; rolls back on error)
    """
    data = request.get_json() or {}
    customer_id = data.get('customer_id')
    payment_method = data.get('payment_method', 'Cash')
    notes = data.get('notes', '').strip()
    items = data.get('items', [])

    # If single product sale shortcut provided:
    if not items and data.get('product_id'):
        items = [{
            'product_id': data.get('product_id'),
            'quantity': data.get('quantity')
        }]

    if not customer_id:
        return jsonify({"success": False, "message": "Customer is required"}), 400
    if not items or len(items) == 0:
        return jsonify({"success": False, "message": "Sale must contain at least one item"}), 400

    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # 1. Validate customer exists
                cursor.execute("SELECT customer_id, customer_name FROM customers WHERE customer_id = %s", (customer_id,))
                cust = cursor.fetchone()
                if not cust:
                    return jsonify({"success": False, "message": "Customer not found"}), 404

                total_amount = 0.0
                processed_items = []

                # 2. Check each product stock & price
                for item in items:
                    pid = item.get('product_id')
                    try:
                        qty = int(item.get('quantity', 0))
                    except (ValueError, TypeError):
                        return jsonify({"success": False, "message": "Invalid item quantity"}), 400

                    if qty <= 0:
                        return jsonify({"success": False, "message": "Quantity must be greater than zero"}), 400

                    cursor.execute("SELECT product_id, product_name, price, current_stock FROM products WHERE product_id = %s FOR UPDATE", (pid,))
                    product = cursor.fetchone()

                    if not product:
                        return jsonify({"success": False, "message": f"Product ID {pid} not found"}), 404

                    if qty > product['current_stock']:
                        return jsonify({
                            "success": False,
                            "message": f"Insufficient stock available for '{product['product_name']}'. Requested: {qty}, Available: {product['current_stock']}"
                        }), 400

                    unit_price = float(product['price'])
                    subtotal = round(unit_price * qty, 2)
                    total_amount += subtotal

                    processed_items.append({
                        "product_id": pid,
                        "product_name": product['product_name'],
                        "quantity": qty,
                        "unit_price": unit_price,
                        "subtotal": subtotal,
                        "current_stock": product['current_stock']
                    })

                total_amount = round(total_amount, 2)

                # 3. Create sale header
                cursor.execute("""
                    INSERT INTO sales (customer_id, total_amount, payment_method, notes)
                    VALUES (%s, %s, %s, %s)
                """, (customer_id, total_amount, payment_method, notes))
                sale_id = cursor.lastrowid

                # 4. Insert items, update inventory, record stock transactions
                for pitem in processed_items:
                    cursor.execute("""
                        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (sale_id, pitem['product_id'], pitem['quantity'], pitem['unit_price'], pitem['subtotal']))

                    cursor.execute("""
                        UPDATE products
                        SET current_stock = current_stock - %s
                        WHERE product_id = %s
                    """, (pitem['quantity'], pitem['product_id']))

                    cursor.execute("""
                        INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_id, notes)
                        VALUES (%s, 'STOCK_OUT', %s, %s, %s)
                    """, (pitem['product_id'], pitem['quantity'], f"SALE-{sale_id}", f"Sold to {cust['customer_name']} (Sale #{sale_id})"))

                return jsonify({
                    "success": True,
                    "message": f"Sale #{sale_id} processed successfully! Stock deducted.",
                    "data": {
                        "sale_id": sale_id,
                        "total_amount": total_amount,
                        "items_count": len(processed_items)
                    }
                }), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
