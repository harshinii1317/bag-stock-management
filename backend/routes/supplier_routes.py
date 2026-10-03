from flask import Blueprint, request, jsonify
from database import get_db
from auth import login_required

supplier_bp = Blueprint('suppliers', __name__)

@supplier_bp.route('', methods=['GET'])
def get_suppliers():
    search = request.args.get('search', '').strip()
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                if search:
                    cursor.execute("""
                        SELECT s.*, COUNT(p.product_id) AS products_supplied
                        FROM suppliers s
                        LEFT JOIN products p ON s.supplier_id = p.supplier_id
                        WHERE s.supplier_name LIKE %s OR s.phone LIKE %s OR s.email LIKE %s
                        GROUP BY s.supplier_id
                        ORDER BY s.supplier_name ASC
                    """, (f"%{search}%", f"%{search}%", f"%{search}%"))
                else:
                    cursor.execute("""
                        SELECT s.*, COUNT(p.product_id) AS products_supplied
                        FROM suppliers s
                        LEFT JOIN products p ON s.supplier_id = p.supplier_id
                        GROUP BY s.supplier_id
                        ORDER BY s.supplier_name ASC
                    """)
                return jsonify({"success": True, "data": cursor.fetchall()})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@supplier_bp.route('/<int:supplier_id>', methods=['GET'])
def get_supplier(supplier_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM suppliers WHERE supplier_id = %s", (supplier_id,))
                supplier = cursor.fetchone()
                if not supplier:
                    return jsonify({"success": False, "message": "Supplier not found"}), 404
                
                # Fetch products supplied
                cursor.execute("""
                    SELECT product_id, product_name, price, current_stock, minimum_stock
                    FROM products WHERE supplier_id = %s
                """, (supplier_id,))
                supplier['products'] = cursor.fetchall()
                return jsonify({"success": True, "data": supplier})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@supplier_bp.route('', methods=['POST'])
@login_required
def create_supplier():
    data = request.get_json() or {}
    name = data.get('supplier_name', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip()
    address = data.get('address', '').strip()

    if not name or not phone:
        return jsonify({"success": False, "message": "Supplier name and phone are required"}), 400

    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO suppliers (supplier_name, phone, email, address) VALUES (%s, %s, %s, %s)",
                    (name, phone, email, address)
                )
                supplier_id = cursor.lastrowid
                return jsonify({
                    "success": True,
                    "message": "Supplier registered successfully",
                    "data": {"supplier_id": supplier_id, "supplier_name": name}
                }), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@supplier_bp.route('/<int:supplier_id>', methods=['PUT'])
@login_required
def update_supplier(supplier_id):
    data = request.get_json() or {}
    name = data.get('supplier_name', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip()
    address = data.get('address', '').strip()

    if not name or not phone:
        return jsonify({"success": False, "message": "Supplier name and phone are required"}), 400

    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE suppliers 
                    SET supplier_name = %s, phone = %s, email = %s, address = %s 
                    WHERE supplier_id = %s
                """, (name, phone, email, address, supplier_id))
                if cursor.rowcount == 0:
                    return jsonify({"success": False, "message": "Supplier not found"}), 404
                return jsonify({"success": True, "message": "Supplier updated successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@supplier_bp.route('/<int:supplier_id>', methods=['DELETE'])
@login_required
def delete_supplier(supplier_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM suppliers WHERE supplier_id = %s", (supplier_id,))
                if cursor.rowcount == 0:
                    return jsonify({"success": False, "message": "Supplier not found"}), 404
                return jsonify({"success": True, "message": "Supplier deleted successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
