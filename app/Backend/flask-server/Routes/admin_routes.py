from flask import  jsonify, request
from werkzeug.utils import secure_filename # shouldn't need this if not using temp folder structure
from database import upload_table, fetch_table_data, save_uploaded_file, supabase_client, restore_file_from_url
import os
import io

#CHANGING STRUCTURE TO NOT HAVE TEMP FOLDER
# create a folder to temporarily store the file that will be uploaded
    # storing it in a folder takes up less space since it is not aved directly to memory 
    # this also gives you a clear space where the file will exist and can control it's deletion
# UPLOAD_FOLDER = os.path.join(os.getcwd(), "temp_uploads") # interacts with OS to get current working directory and creates (through join()) a "temp_uploads" folder
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# makedirs() will create parent directories if needed
# mkdir() will only create directory 1 level deep (technically works now, but won't work later if I want to add more folders to save the upload file into)
# exist_ok= checks what to do if the folder already exists, True means it is ok if it exists (it will skip creation), False means it is not ok if folder already exists (it will raise an error)

# function to register all the admin routes to the Flask app (which it takes as the parameter)
def register_admin_routes(app):

    @app.route("/admin/upload/<table_name>", methods=["POST"])
    def upload_table_route(table_name):
        print("Upload request received for table:", table_name)

        # check if a file is included in the request
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        uploaded_by = request.headers.get("X-User-Email", "unknown")

        try:
            # upload to Supabase storage
            storage_result = save_uploaded_file(
                file, 
                uploaded_by, 
                supabase_client, 
                table_name = table_name,
                bucket_name="uploads")

            # upload to database
            upload_table(file, table_name, uploaded_by)

            return jsonify({
                "status": f"{table_name.capitalize()} uploaded successfully",
                "file_storage": storage_result
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    
    # create route to GET data from database
    @app.route("/admin/data/<table_name>", methods=["GET"])
    def get_table_data(table_name):
        try:
            data = fetch_table_data(table_name)
            return jsonify({"data": data}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    # list the past uploads (table specific)
    @app.route("/admin/uploads/list/<table_name>", methods = ["GET"])
    def list_uploads(table_name):
        try:
            response = supabase_client.table("uploaded_files") \
                .select("*") \
                .eq("table_name", table_name) \
                .order("uploaded_at", desc = True) \
                .execute()
            # this queries and filters the data in the database table uploaded_files
            
            files = response.data

            return jsonify({"uploads": files}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    # download an old file (STILL NEED TO IMPLEMENT IN FRONTEND)
    @app.route("/admin/uploads/download/<storage_path>", methods = ["GET"])
    def download_past_upload(storage_path):
        try:
            url = supabase_client.storage.from_("uploads").get_public_url(storage_path)
            return jsonify({"download_url": url}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    # restore a past file
    @app.route("/admin/uploads/restore/<table_name>/<storage_path>", methods = ["POST"])
    def restore_upload(table_name, storage_path):
        try:

            uploaded_by = request.headers.get("X-User-Email", "unknown")

            file_url = f"https://meyjrnnoyfxxvsqzvhlu.supabase.co/storage/v1/object/public/uploads/{storage_path}"

            restore_file_from_url(file_url, table_name, uploaded_by)

            data = fetch_table_data(table_name)

            return jsonify({"status": f"{table_name} restored successfully from {storage_path}", 
                            "data": data }),200
        except Exception as e:
            return jsonify ({"error": str(e)}), 500