# Parts of this code related to general-purpose Flask route structure, error handling, and basic file 
# upload/download patterns were assisted or inspired by AI. All Supabase-specific logic, database schema, 
# table mappings, and application-specific workflow were written independently.
from flask import  jsonify, request
from werkzeug.utils import secure_filename
from database import upload_table, fetch_table_data, save_uploaded_file, supabase_client, restore_file_from_url
import os
import io
from supabase_client import supabase

# function to check user authorization and get authorized user's email
# def authorize_user(supabase):
#     authorization_header = request.headers.get("Authorization")
#     if not authorization_header or not authorization_header.startswith("Bearer "):
#         raise ValueError("Invalid authorization header.")

#     token = authorization_header.split(" ")[1]
#     user_response = supabase.auth.get_user(token)

#     if user_response.user is None:
#         raise ValueError("Invalid or expired token.")
    
#     return user_response.user.email


# function to register all the admin routes to the Flask app (which it takes as the parameter)
def register_admin_routes(app):

    @app.route("/admin/upload/<table_name>", methods=["POST"])
    def upload_table_route(table_name):
        print("Upload request received for table:", table_name)

        # authorization_header = request.headers.get("Authorization")
        # if not authorization_header or not authorization_header.startswith("Bearer "):
        #     return jsonify({"error": "Invalid authorization header."}), 401
        
        # token = authorization_header.split(" ")[1]
        # user_response = supabase.auth.get_user(token)

        # if user_response.user is None:
        #     return jsonify({"error": "Invalid or expired token"}), 401
        
        # user_email = user_response.user.email
        # print("Verified user:", user_email)

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

        # uploaded_by = user_email

        try:
            uploaded_by = request.headers.get("X-User-Email")
            if not uploaded_by:
                return jsonify({"error": "Missing user email"}), 400
            
            # upload to Supabase storage and database
            # Note: save_uploaded_file() handles both storage AND database upload
            storage_result = save_uploaded_file(
                file, 
                uploaded_by, 
                supabase, 
                table_name = table_name,
                bucket_name="uploads")
            
            # Fetch the newly uploaded data
            data = fetch_table_data(table_name)

            return jsonify({
                "status": f"{table_name.capitalize()} uploaded successfully",
                "data": data,
                "file_storage": storage_result,
                "unmatched_courses": storage_result.get("unmatched_courses", [])
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
    
    # list the past uploads (table specific)
    @app.route("/admin/uploads/list/<table_name>", methods = ["GET"])
    def list_uploads(table_name):
        try:
            response = supabase_client.table("uploaded_files") \
                .select("*") \
                .eq("table_name", table_name) \
                .order("uploaded_at", desc = True) \
                .execute()
            
            files = response.data
            return jsonify({"uploads": files}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    # download an old file
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
            

            uploaded_by = request.headers.get("X-User-Email")
            if not uploaded_by:
                        return jsonify({"error": "Missing user email"}), 400
            file_url = f"https://meyjrnnoyfxxvsqzvhlu.supabase.co/storage/v1/object/public/uploads/{storage_path}"

            restore_file_from_url(file_url, table_name, uploaded_by)

            data = fetch_table_data(table_name)

            return jsonify({"status": f"{table_name} restored successfully from {storage_path}", 
                            "data": data }),200
        except Exception as e:
            return jsonify ({"error": str(e)}), 500
