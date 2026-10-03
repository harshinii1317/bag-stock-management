from flask import Blueprint, jsonify
from database import get_db

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('', methods=['GET'])
def get_dashboard_summary():
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                # 1. Total Products & Total Stock
                cursor.execute("""
                    SELECT 
                        COUNT(product_id) AS total_products,
                        COALESCE(SUM(current_stock), 0) AS total_stock,
                        COALESCE(SUM(current_stock * price), 0) AS total_inventory_value
                    FROM products
                """)
                prod_stats = cursor.fetchone()

                # 2. Total Customers
                cursor.execute("SELECT COUNT(customer_id) AS total_customers FROM customers")
                cust_stats = cursor.fetchone()

                # 3. Total Suppliers
                cursor.execute("SELECT COUNT(supplier_id) AS total_suppliers FROM suppliers")
                supp_stats = cursor.fetchone()

                # 4. Total Sales & Revenue
                cursor.execute("""
                    SELECT 
                        COUNT(sale_id) AS total_sales_count,
                        COALESCE(SUM(total_amount), 0) AS total_sales_revenue
                    FROM sales
                """)
                sales_stats = cursor.fetchone()

                # 5. Low Stock Count
                cursor.execute("""
                    SELECT COUNT(product_id) AS low_stock_count
                    FROM products
                    WHERE current_stock <= minimum_stock
                """)
                low_stock_stats = cursor.fetchone()

                # 6. Recent Sales (Latest 5)
                cursor.execute("""
                    SELECT s.sale_id, s.sale_date, s.total_amount, s.payment_method,
                           c.customer_name,
                           GROUP_CONCAT(CONCAT(p.product_name, ' (', si.quantity, ')') SEPARATOR ', ') AS items_summary
                    FROM sales s
                    JOIN customers c ON s.customer_id = c.customer_id
                    JOIN sale_items si ON s.sale_id = si.sale_id
                    JOIN products p ON si.product_id = p.product_id
                    GROUP BY s.sale_id
                    ORDER BY s.sale_date DESC
                    LIMIT 6
                """)
                recent_sales = cursor.fetchall()
                for rs in recent_sales:
                    rs['total_amount'] = float(rs['total_amount'])

                # 7. Recent Stock Transactions (Latest 6)
                cursor.execute("""
                    SELECT st.transaction_id, st.transaction_type, st.quantity, st.transaction_date, st.notes,
                           p.product_name, c.category_name
                    FROM stock_transactions st
                    JOIN products p ON st.product_id = p.product_id
                    JOIN categories c ON p.category_id = c.category_id
                    ORDER BY st.transaction_date DESC
                    LIMIT 6
                """)
                recent_transactions = cursor.fetchall()

                # 8. Immediate Low Stock Items (top 5 critical)
                cursor.execute("""
                    SELECT p.product_id, p.product_name, p.current_stock, p.minimum_stock,
                           c.category_name, s.supplier_name,
                           CASE WHEN p.current_stock = 0 THEN 'Out of Stock' ELSE 'Low Stock' END as status
                    FROM products p
                    JOIN categories c ON p.category_id = c.category_id
                    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
                    WHERE p.current_stock <= p.minimum_stock
                    ORDER BY p.current_stock ASC
                    LIMIT 6
                """)
                low_stock_items = cursor.fetchall()

                return jsonify({
                    "success": True,
                    "data": {
                        "statistics": {
                            "total_products": prod_stats['total_products'],
                            "total_stock": int(prod_stats['total_stock']),
                            "total_inventory_value": float(prod_stats['total_inventory_value']),
                            "total_customers": cust_stats['total_customers'],
                            "total_suppliers": supp_stats['total_suppliers'],
                            "total_sales_count": sales_stats['total_sales_count'],
                            "total_sales_revenue": float(sales_stats['total_sales_revenue']),
                            "low_stock_count": low_stock_stats['low_stock_count']
                        },
                        "recent_sales": recent_sales,
                        "recent_transactions": recent_transactions,
                        "low_stock_products": low_stock_items
                    }
                })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
