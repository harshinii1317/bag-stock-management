from flask import Blueprint, request, jsonify
from database import get_db

report_bp = Blueprint('reports', __name__)

@report_bp.route('/inventory', methods=['GET'])
def inventory_report():
    category_id = request.args.get('category_id')
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                query = """
                    SELECT p.product_id, p.product_name, p.sku, p.price, p.current_stock, p.minimum_stock,
                           (p.current_stock * p.price) AS total_value,
                           c.category_name, s.supplier_name
                    FROM products p
                    JOIN categories c ON p.category_id = c.category_id
                    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
                    WHERE 1=1
                """
                params = []
                if category_id:
                    query += " AND p.category_id = %s"
                    params.append(category_id)

                query += " ORDER BY c.category_name, p.product_name"
                cursor.execute(query, tuple(params))
                items = cursor.fetchall()

                total_units = sum(i['current_stock'] for i in items)
                total_val = sum(float(i['total_value']) for i in items)
                for i in items:
                    i['price'] = float(i['price'])
                    i['total_value'] = float(i['total_value'])

                return jsonify({
                    "success": True,
                    "summary": {
                        "total_items": len(items),
                        "total_units": total_units,
                        "total_valuation": round(total_val, 2)
                    },
                    "data": items
                })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@report_bp.route('/sales', methods=['GET'])
def sales_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                query = """
                    SELECT s.sale_id, s.sale_date, s.total_amount, s.payment_method,
                           c.customer_name,
                           COUNT(si.sale_item_id) as items_count,
                           SUM(si.quantity) as units_sold
                    FROM sales s
                    JOIN customers c ON s.customer_id = c.customer_id
                    JOIN sale_items si ON s.sale_id = si.sale_id
                    WHERE 1=1
                """
                params = []
                if start_date:
                    query += " AND DATE(s.sale_date) >= %s"
                    params.append(start_date)
                if end_date:
                    query += " AND DATE(s.sale_date) <= %s"
                    params.append(end_date)

                query += " GROUP BY s.sale_id ORDER BY s.sale_date DESC"
                cursor.execute(query, tuple(params))
                sales = cursor.fetchall()

                total_revenue = sum(float(s['total_amount']) for s in sales)
                total_units = sum(int(s['units_sold'] or 0) for s in sales)
                for s in sales:
                    s['total_amount'] = float(s['total_amount'])

                return jsonify({
                    "success": True,
                    "summary": {
                        "total_transactions": len(sales),
                        "total_revenue": round(total_revenue, 2),
                        "total_units_sold": total_units
                    },
                    "data": sales
                })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@report_bp.route('/customers', methods=['GET'])
def customer_report():
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT c.customer_id, c.customer_name, c.phone, c.email,
                           COUNT(s.sale_id) AS total_orders,
                           COALESCE(SUM(s.total_amount), 0) AS total_revenue,
                           MAX(s.sale_date) AS last_purchase_date
                    FROM customers c
                    LEFT JOIN sales s ON c.customer_id = s.customer_id
                    GROUP BY c.customer_id
                    ORDER BY total_revenue DESC
                """)
                custs = cursor.fetchall()
                for c in custs:
                    c['total_revenue'] = float(c['total_revenue'])
                return jsonify({"success": True, "data": custs})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@report_bp.route('/transactions', methods=['GET'])
def transaction_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    trans_type = request.args.get('type')
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                query = """
                    SELECT st.*, p.product_name, c.category_name
                    FROM stock_transactions st
                    JOIN products p ON st.product_id = p.product_id
                    JOIN categories c ON p.category_id = c.category_id
                    WHERE 1=1
                """
                params = []
                if start_date:
                    query += " AND DATE(st.transaction_date) >= %s"
                    params.append(start_date)
                if end_date:
                    query += " AND DATE(st.transaction_date) <= %s"
                    params.append(end_date)
                if trans_type:
                    query += " AND st.transaction_type = %s"
                    params.append(trans_type)

                query += " ORDER BY st.transaction_date DESC LIMIT 500"
                cursor.execute(query, tuple(params))
                return jsonify({"success": True, "data": cursor.fetchall()})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
