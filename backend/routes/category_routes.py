from flask import Blueprint, request, jsonify
from database import get_db
from auth import login_required

category_bp = Blueprint('categories', __name__)

@category_bp.route('', methods=['GET'])
def get_categories():
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT c.category_id, c.category_name, c.description, c.created_at,
                           COUNT(p.product_id) AS product_count
                    FROM categories c
                    LEFT JOIN products p ON c.category_id = p.category_id
                    GROUP BY c.category_id, c.category_name, c.description, c.created_at
                    ORDER BY c.category_name ASC
                """)
                categories = cursor.fetchall()
                return jsonify({"success": True, "data": categories})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@category_bp.route('', methods=['POST'])
@login_required
def create_category():
    data = request.get_json() or {}
    name = data.get('category_name', '').strip()
    description = data.get('description', '').strip()

    if not name:
        return jsonify({"success": False, "message": "Category name cannot be empty"}), 400

    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Check for duplicate
                cursor.execute("SELECT category_id FROM categories WHERE LOWER(category_name) = LOWER(%s)", (name,))
                if cursor.fetchone():
                    return jsonify({"success": False, "message": f"Category '{name}' already exists"}), 409

                cursor.execute(
                    "INSERT INTO categories (category_name, description) VALUES (%s, %s)",
                    (name, description)
                )
                category_id = cursor.lastrowid
                return jsonify({
                    "success": True,
                    "message": "Category created successfully",
                    "data": {"category_id": category_id, "category_name": name, "description": description}
                }), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@category_bp.route('/<int:category_id>', methods=['PUT'])
@login_required
def update_category(category_id):
    data = request.get_json() or {}
    name = data.get('category_name', '').strip()
    description = data.get('description', '').strip()

    if not name:
        return jsonify({"success": False, "message": "Category name cannot be empty"}), 400

    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Check duplicate with different ID
                cursor.execute("SELECT category_id FROM categories WHERE LOWER(category_name) = LOWER(%s) AND category_id != %s", (name, category_id))
                if cursor.fetchone():
                    return jsonify({"success": False, "message": f"Another category with name '{name}' already exists"}), 409

                cursor.execute(
                    "UPDATE categories SET category_name = %s, description = %s WHERE category_id = %s",
                    (name, description, category_id)
                )
                if cursor.rowcount == 0:
                    return jsonify({"success": False, "message": "Category not found"}), 404
                return jsonify({"success": True, "message": "Category updated successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@category_bp.route('/<int:category_id>', methods=['DELETE'])
@login_required
def delete_category(category_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Check if products exist in category
                cursor.execute("SELECT COUNT(*) as count FROM products WHERE category_id = %s", (category_id,))
                res = cursor.fetchone()
                if res and res['count'] > 0:
                    return jsonify({
                        "success": False,
                        "message": f"Cannot delete category: {res['count']} products are linked to it. Please reassign or delete them first."
                    }), 400

                cursor.execute("DELETE FROM categories WHERE category_id = %s", (category_id,))
                if cursor.rowcount == 0:
                    return jsonify({"success": False, "message": "Category not found"}), 404
                return jsonify({"success": True, "message": "Category deleted successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
