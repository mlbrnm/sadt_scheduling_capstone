from flask import Flask, request, render_template, jsonify
import pandas as pd
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from flask_cors import CORS
import numpy as np
import re
import math
from datetime import datetime, date, timezone

app = Flask(__name__)
CORS(app)

# Load variables from .env.local
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
dotenv_path = os.path.join(project_root, ".env.local")
load_dotenv(dotenv_path=dotenv_path)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

print("SUPABASE_URL:", SUPABASE_URL)
print("SUPABASE_KEY:", "Loaded" if SUPABASE_KEY else "Missing")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def clean_record(record: dict) -> dict:
    cleaned = {}
    for key, value in record.items():
        # Clean column names
        clean_key = key.strip().lower()
        clean_key = re.sub(r"[ /]", "_", clean_key)
        clean_key = re.sub(r"[()]", "", clean_key)

        # Clean values
        if isinstance(value, str):
            value = value.strip()
            if value == "":
                value = None
        elif isinstance(value, float):
            if math.isnan(value) or math.isinf(value):
                value = None
            elif value.is_integer():
                value = int(value)
        elif isinstance(value, (datetime, date)):
            # Convert datetime/date to ISO string
            value = value.isoformat()
        cleaned[clean_key] = value
    return cleaned




def clean_records(records: list[dict], table: str, primary_keys: dict) -> list[dict]:
    cleaned_list = []
    pk = primary_keys.get(table)

    for idx, r in enumerate(records, start=1):
        cleaned = clean_record(r)

        # If the table has a required PK (everything except programs)
        if table != "programs" and pk:
            pk_val = cleaned.get(pk)

            # Skip if missing, empty, or NaN
            if pk_val is None:
                print(f"[SKIP row {idx}] Missing PK '{pk}' → {pk_val}")
                continue
            if isinstance(pk_val, str) and pk_val.strip() == "":
                print(f"[SKIP row {idx}] Empty string PK '{pk}'")
                continue
            if isinstance(pk_val, float) and pd.isna(pk_val):
                print(f"[SKIP row {idx}] NaN PK '{pk}'")
                continue

        cleaned_list.append(cleaned)

    return cleaned_list

@app.route('/')
def index():
    return render_template('upload.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    table = request.form.get("table")
    allowed_tables = ["programs", "courses", "instructors", "instructor_course_history", "instructor_skills"]
    
    if table not in allowed_tables:
        return jsonify({"success": False, "error": "Invalid table"}), 400

    if 'file' not in request.files or request.files['file'].filename == '':
        return jsonify({"success": False, "error": "No file selected"}), 400

    file = request.files['file']

    # Read CSV or XLSX
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(file)
        else:
            return jsonify({"success": False, "error": "Unsupported file type"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Error reading file: {str(e)}"}), 500
    


    primary_keys = {
    "programs": "program_id",
    "courses": "course_id",
    "instructors": "instructor_id",
}

    # Convert to list of dicts and clean
    records = df.to_dict("records")
    cleaned_records = clean_records(records, table, primary_keys)

    # Define table columns
    table_columns = {
        "programs": [
            "program_id",
            "group",
            "acronym",
            "program",
            "academic_chair",
            "associate_dean",
            "credential",
            "courses",
            "intakes",
            "duration",
            "starting_date",
            "uploaded_at",
            "uploaded_by"
        ],
        "courses": [
            "course_id", 
            "course_code", 
            "course_name", 
            "program_major", 
            "group_name", 
            "credits", 
            "course_hours",
            "modality", 
            "program_type", 
            "credential", 
            "req_elec", 
            "delivery_method", 
            "ac_name", 
            "school",
            "exam_otr", 
            "semester", 
            "fall", 
            "winter", 
            "spring_summer", 
            "order", 
            "duration_days", 
            "notes",
            "uploaded_at",
            "uploaded_by"
        ],
        "instructors": [
            "instructor_id",
            "instructor_lastname",
            "instructor_name",
            "contract_type",
            "instructor_status",
            "start_date",
            "end_date",
            "time_off",
            "id_manager",
            "name_manager",
            "comments",
            "id_position",
            "uploaded_by",
            "uploaded_at"
        ],
        "instructor_course_history": [
            "instructor_id", "course_catalog_id", "last_taught_term_id", "preference_level", "uploaded_by"
        ],
        "instructor_skills": [
            "id", "instructor_id", "skill", "technology", "qualification_level", "date_acquired"
        ]
    }

    defaults = {"uploaded_by": None}

    # Filter out rows without primary key, except for programs
    if table == "programs":
        valid_records = cleaned_records
    else:
        pk = primary_keys[table]
        valid_records = [
            r for r in cleaned_records if r.get(pk) not in (None, "", np.nan)
        ]

    if not valid_records:
        return jsonify({
            "success": False,
            "error": "No valid records to insert. Check that the primary key column is filled."
        }), 400

    if not valid_records:
        return jsonify({
            "success": False,
            "error": "No valid records to insert. Check that the primary key column is filled."
        }), 400

    # Map cleaned records to table columns & add uploaded_at / uploaded_by
    now_iso = datetime.now(timezone.utc).isoformat()
    records_to_insert = []
    for row in valid_records:
        record = {}
        for col in table_columns[table]:
            if table == "programs" and col == "program_id":
                continue  # Skip primary key for programs
            if col == "uploaded_at":
                record[col] = now_iso
            elif col == "uploaded_by":
                record[col] = defaults.get(col)
            else:
                record[col] = row.get(col)
        records_to_insert.append(record)

    # Insert into Supabase
    try:
        response = supabase.table(table).insert(records_to_insert).execute()
        return jsonify({
            "success": True,
            "message": f"File '{file.filename}' uploaded and inserted into {table} successfully!",
            "data": response.data,
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": f"Error inserting into Supabase: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)