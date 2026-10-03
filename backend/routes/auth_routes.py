from flask import Blueprint, request, jsonify, session
from database import get_db
from auth import verify_password, login_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    if not username or not password:
        return jsonify({"success": False, "message": "Username and password are required"}), 400
        
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT user_id, username, email, password_hash, full_name, role FROM users WHERE username = %s OR email = %s",
                    (username, username)
                )
                user = cursor.fetchone()
                
                if user and verify_password(password, user['password_hash']):
                    session.clear()
                    session['user_id'] = user['user_id']
                    session['username'] = user['username']
                    session['role'] = user['role']
                    session['full_name'] = user['full_name']
                    
                    return jsonify({
                        "success": True,
                        "message": "Login successful",
                        "data": {
                            "user_id": user['user_id'],
                            "username": user['username'],
                            "full_name": user['full_name'],
                            "role": user['role']
                        }
                    })
                else:
                    return jsonify({"success": False, "message": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"success": False, "message": f"Database error: {str(e)}"}), 500

@auth_bp.route('/login-pin', methods=['POST'])
def login_pin():
    data = request.get_json() or {}
    pin = data.get('pin', '').strip()
    
    if not pin:
        return jsonify({"success": False, "message": "Security PIN is required"}), 400
        
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT user_id, username, email, full_name, role FROM users WHERE pin_code = %s",
                    (pin,)
                )
                user = cursor.fetchone()
                
                if user:
                    session.clear()
                    session['user_id'] = user['user_id']
                    session['username'] = user['username']
                    session['role'] = user['role']
                    session['full_name'] = user['full_name']
                    
                    return jsonify({
                        "success": True,
                        "message": f"Welcome back, {user['full_name']}! Quick PIN authenticated.",
                        "data": {
                            "user_id": user['user_id'],
                            "username": user['username'],
                            "full_name": user['full_name'],
                            "role": user['role']
                        }
                    })
                else:
                    return jsonify({"success": False, "message": "Invalid POS Security PIN"}), 401
    except Exception as e:
        return jsonify({"success": False, "message": f"Database error: {str(e)}"}), 500

@auth_bp.route('/login-badge', methods=['POST'])
def login_badge():
    data = request.get_json() or {}
    badge_id = data.get('badge_id', '').strip()
    
    if not badge_id:
        return jsonify({"success": False, "message": "Badge or Key ID is required"}), 400
        
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT user_id, username, email, full_name, role FROM users WHERE badge_id = %s",
                    (badge_id,)
                )
                user = cursor.fetchone()
                
                if user:
                    session.clear()
                    session['user_id'] = user['user_id']
                    session['username'] = user['username']
                    session['role'] = user['role']
                    session['full_name'] = user['full_name']
                    
                    return jsonify({
                        "success": True,
                        "message": f"Store Badge detected! Logged in as {user['full_name']}",
                        "data": {
                            "user_id": user['user_id'],
                            "username": user['username'],
                            "full_name": user['full_name'],
                            "role": user['role']
                        }
                    })
                else:
                    return jsonify({"success": False, "message": "Unrecognized Store Badge ID"}), 401
    except Exception as e:
        return jsonify({"success": False, "message": f"Database error: {str(e)}"}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"})

@auth_bp.route('/session', methods=['GET'])
def get_session():
    if 'user_id' in session:
        return jsonify({
            "success": True,
            "data": {
                "user_id": session['user_id'],
                "username": session['username'],
                "full_name": session.get('full_name', session['username']),
                "role": session.get('role', 'Owner')
            }
        })
    return jsonify({"success": False, "message": "No active session"}), 401
