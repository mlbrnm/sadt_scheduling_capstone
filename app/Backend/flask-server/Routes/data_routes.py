from flask import jsonify
from database import supabase_client

def register_data_routes(app):
    
    @app.route("/api/courses", methods=["GET"])
    def get_courses():
        """
        Fetch all courses from the courses table.
        Returns course data needed for the NewSchedule page.
        """
        try:
            response = supabase_client.table("courses").select("*").execute()
            
            if not response.data:
                return jsonify([]), 200
            
            return jsonify(response.data), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route("/api/instructors", methods=["GET"])
    def get_instructors():
        """
        Fetch all instructors from the instructors table.
        Returns instructor data needed for the NewSchedule page.
        """
        try:
            response = supabase_client.table("instructors").select("*").execute()
            
            if not response.data:
                return jsonify([]), 200
            
            return jsonify(response.data), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
