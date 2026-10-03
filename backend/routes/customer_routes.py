from flask import Blueprint, request, jsonify
from database import get_db
from auth import login_required

customer_bp = Blueprint('customers', __name__)

@customer_bp.route('', methods=['GET'])
def get_customers():
    search = request.args.get('search', '').strip()
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                if search:
                    cursor.execute("""
                        SELECT c.*, 
                               COUNT(s.sale_id) AS total_orders,
                               COALESCE(SUM(s.total_amount), 0) AS total_spent
                        FROM customers c
                        LEFT JOIN sales s ON c.customer_id = s.customer_id
                        WHERE c.customer_name LIKE %s OR c.phone LIKE %s OR c.email LIKE %s
                        GROUP BY c.customer_id
                        ORDER BY c.customer_name ASC
                    """, (f"%{search}%", f"%{search}%", f"%{search}%"))
                else:
                    cursor.execute("""
                        SELECT c.*, 
                               COUNT(s.sale_id) AS total_orders,
                               COALESCE(SUM(s.total_amount), 0) AS total_spent
                        FROM customers c
                        LEFT JOIN sales s ON c.customer_id = s.customer_id
                        GROUP BY c.customer_id
                        ORDER BY c.customer_name ASC
                    """)
                return jsonify({"success": True, "data": cursor.fetchall()})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@customer_bp.route('/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM customers WHERE customer_id = %s", (customer_id,))
                customer = cursor.fetchone()
                if not customer:
                    return jsonify({"success": False, "message": "Customer not found"}), 404
                return jsonify({"success": True, "data": customer})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@customer_bp.route('/<int:customer_id>/purchase-history', methods=['GET'])
def get_customer_purchase_history(customer_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Customer check
                cursor.execute("SELECT customer_name FROM customers WHERE customer_id = %s", (customer_id,))
                cust = cursor.fetchone()
                if not cust:
                    return jsonify({"success": False, "message": "Customer not found"}), 404

                cursor.execute("""
                    SELECT s.sale_id, s.sale_date, s.total_amount, s.payment_method,
                           si.sale_item_id, si.product_id, p.product_name, si.quantity, si.unit_price, si.subtotal
                    FROM sales s
                    JOIN sale_items si ON s.sale_id = si.sale_id
                    JOIN products p ON si.product_id = p.product_id
                    WHERE s.customer_id = %s
                    ORDER BY s.sale_date DESC
                """, (customer_id,))
                rows = cursor.fetchall()

                # Group by sale_id
                sales_dict = {}
                for row in rows:
                    sid = row['sale_id']
                    if sid not in sales_dict:
                        sales_dict[sid] = {
                            "sale_id": sid,
                            "sale_date": row['sale_date'],
                            "total_amount": float(row['total_amount']),
                            "payment_method": row['payment_method'],
                            "items": []
                        }
                    sales_dict[sid]["items"].append({
                        "product_name": row['product_name'],
                        "quantity": row['quantity'],
                        "unit_price": float(row['unit_price']),
                        "subtotal": float(row['subtotal'])
                    })

                return jsonify({
                    "success": True,
                    "customer_name": cust['customer_name'],
                    "data": list(sales_dict.values())
                })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@customer_bp.route('', methods=['POST'])
@login_required
def create_customer():
    data = request.get_json() or {}
    name = data.get('customer_name', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip()
    address = data.get('address', '').strip()

    if not name or not phone:
        return jsonify({"success": False, "message": "Customer name and phone are required"}), 400

    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO customers (customer_name, phone, email, address) VALUES (%s, %s, %s, %s)",
                    (name, phone, email, address)
                )
                customer_id = cursor.lastrowid
                return jsonify({
                    "success": True,
                    "message": "Customer added successfully",
                    "data": {"customer_id": customer_id, "customer_name": name}
                }), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@customer_bp.route('/<int:customer_id>', methods=['PUT'])
@login_required
def update_customer(customer_id):
    data = request.get_json() or {}
    name = data.get('customer_name', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip()
    address = data.get('address', '').strip()

    if not name or not phone:
        return jsonify({"success": False, "message": "Customer name and phone are required"}), 400

    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE customers 
                    SET customer_name = %s, phone = %s, email = %s, address = %s 
                    WHERE customer_id = %s
                """, (name, phone, email, address, customer_id))
                if cursor.rowcount == 0:
                    return jsonify({"success": False, "message": "Customer not found"}), 404
                return jsonify({"success": True, "message": "Customer details updated successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@customer_bp.route('/<int:customer_id>', methods=['DELETE'])
@login_required
def delete_customer(customer_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Check if customer has sales
                cursor.execute("SELECT COUNT(*) as count FROM sales WHERE customer_id = %s", (customer_id,))
                res = cursor.fetchone()
                if res and res['count'] > 0:
                    return jsonify({
                        "success": False,
                        "message": f"Cannot delete customer: they have {res['count']} registered sales records."
                    }), 400

                cursor.execute("DELETE FROM customers WHERE customer_id = %s", (customer_id,))
                if cursor.rowcount == 0:
                    return jsonify({"success": False, "message": "Customer not found"}), 404
                return jsonify({"success": True, "message": "Customer deleted successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
