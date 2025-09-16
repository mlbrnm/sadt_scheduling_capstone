from flask import  jsonify, request
from werkzeug.utils import secure_filename
from database import upload_table
import os


UPLOAD_FOLDER = os.path.join(os.getcwd(), "temp_uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def register_admin_routes(app):

    @app.route("/admin/upload/<table_name>", methods=["POST"])
    def upload_table_route(table_name):
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        # Save file temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(temp_path)

        uploaded_by = request.headers.get("X-User-Email", "unknown")

        try:
            upload_table(temp_path, table_name, uploaded_by)
            return jsonify({"status": f"{table_name.capitalize()} uploaded successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)