from flask import jsonify, request
from supabase_client import supabase # this is the supabase client with the service role key
from database import get_user_name

def register_user_routes(app):

    @app.route("/user/name", methods=["GET"])
    def get_current_user():
        user_id = request.headers.get("X-User-Id")
        if not user_id:
            return jsonify({"error": "Missing user ID"}), 401
        
        full_name = get_user_name(user_id)
        if not full_name:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({"full_name": full_name}), 200

