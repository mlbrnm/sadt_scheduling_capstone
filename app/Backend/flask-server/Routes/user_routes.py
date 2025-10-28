from flask import jsonify, request
from supabase_client import supabase # this is the supabase client with the service role key
from database import get_user_info

def register_user_routes(app):

    @app.route("/user/info", methods=["GET"])
    def get_current_user():
        user_id = request.headers.get("X-User-Id")
        if not user_id:
            return jsonify({"error": "Missing user ID"}), 401
        
        user_data = get_user_info(user_id)
        if not user_data:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify(user_data), 200

