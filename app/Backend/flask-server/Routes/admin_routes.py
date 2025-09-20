from flask import  jsonify, request
from werkzeug.utils import secure_filename
from database import upload_table, fetch_table_data, save_uploaded_file, supabase_client
import os

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

        # save file temporarily
        # filename = secure_filename(file.filename)
        # temp_path = os.path.join(UPLOAD_FOLDER, filename)
        # file.save(temp_path)

        uploaded_by = request.headers.get("X-User-Email", "unknown")

        try:
            # upload to Supabase storage
            storage_result = save_uploaded_file(file, uploaded_by, supabase_client, bucket_name="uploads")

            # upload to database
            upload_table(file, table_name, uploaded_by)

            return jsonify({
                "status": f"{table_name.capitalize()} uploaded successfully",
                "file_storage": storage_result
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        # finally:
        #     # cleanup temp file
        #     if os.path.exists(temp_path):
        #         os.remove(temp_path)

    
    # create route to GET data from database
    @app.route("/admin/data/<table_name>", methods=["GET"])
    def get_table_data(table_name):
        try:
            data = fetch_table_data(table_name)
            return jsonify({"data": data}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500