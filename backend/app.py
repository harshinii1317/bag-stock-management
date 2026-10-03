import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import Config

# Import blueprints
from routes.auth_routes import auth_bp
from routes.category_routes import category_bp
from routes.product_routes import product_bp
from routes.supplier_routes import supplier_bp
from routes.customer_routes import customer_bp
from routes.sales_routes import sales_bp
from routes.stock_routes import stock_bp
from routes.dashboard_routes import dashboard_bp
from routes.report_routes import report_bp

def create_app():
    app = Flask(__name__, static_folder='../static', template_folder='../templates')
    app.config.from_object(Config)

    # Enable CORS for frontend integration
    CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5000"])

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(category_bp, url_prefix='/api/categories')
    app.register_blueprint(product_bp, url_prefix='/api/products')
    app.register_blueprint(supplier_bp, url_prefix='/api/suppliers')
    app.register_blueprint(customer_bp, url_prefix='/api/customers')
    app.register_blueprint(sales_bp, url_prefix='/api/sales')
    app.register_blueprint(stock_bp, url_prefix='/api/stock')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(report_bp, url_prefix='/api/reports')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "Bag Stock Management API",
            "database": "MySQL (bag_management)"
        })

    # Error Handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"success": False, "message": "Internal server error occurred"}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Starting Bag Company Stock Management System backend on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
