from flask import  jsonify, request
from werkzeug.utils import secure_filename
from database import upload_table
import os

# create a folder to temporarily store the file that will be uploaded
    # storing it in a folder takes up less space since it is not aved directly to memory 
    # this also gives you a clear space where the file will exist and can control it's deletion
UPLOAD_FOLDER = os.path.join(os.getcwd(), "temp_uploads") # interacts with OS to get current working directory and creates (through join()) a "temp_uploads" folder
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# makedirs() will create parent directories if needed
# mkdir() will only create directory 1 level deep (technically works now, but won't work later if I want to add more folders to save the upload file into)
# exist_ok= checks what to do if the folder already exists, True means it is ok if it exists (it will skip creation), False means it is not ok if folder already exists (it will raise an error)

# function to register all the admin routes to the Flask app (which it takes as the parameter)
def register_admin_routes(app):

    @app.route("/admin/upload/<table_name>", methods=["POST"]) # flask decorator telling flask what to do if a request comes in from this route
    def upload_table_route(table_name):
        # debug: ensure request is received for the right table
        print("Upload request received for table:", table_name)
        # check if there is actually a file in the HTTP request
        if "file" not in request.files: # request is a flask object that handles what is in the HTTP request
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        # file is a FileStorage object we can perform methods on

        
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