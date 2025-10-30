# Parts of this code related to general-purpose file reading, data cleaning, type-safe DataFrame processing, 
# and Supabase insert patterns were assisted or inspired by AI. All database schema, table mappings, and 
# application-specific logic were written independently.
from supabase import create_client, Client 
# supabase is a python package
    #create_client is a function within that package
    # Client is a class within that package

from dotenv import load_dotenv 
# dotenv is python library to help load enviroment variabes

from datetime import timezone

import os 
# this is a module that connects python to the operating system
    # it can use environment variables
    # it can read/write files
    # it can check directories

import pandas as pd
# pandas is a python library that helps work with structured data (sql tables, spreadsheets)
    # uses DataFrames which stores data in rows and columns

import numpy as np

from datetime import datetime

import uuid

import requests

from io import BytesIO


load_dotenv() 
# this function will load the variables from the .env file

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
# used the  os.getenv function instead of os.environ function
    # if value does not exist system won't crash, it will just return none 
    # (environ will crash if value doesn't exist)

# NEED TO CHANGE DATABASE CONNECTION DEPENDING ON USER VS ADMIN



supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
# : Client - type hint that says the variable supabase_client is an object instance 
# of class Client (a class from the supabase package we imported)


# dictionary to organize and map table columns to what they will be in the database
TABLE_COLUMN_MAPPINGS = {
    "courses": {
        "Course_ID": "course_id", 
        "Course_Code": "course_code", 
        "Course_Name": "course_name", 
        "Program/ Major": "program_major", 
        "Group": "group", 
        "Credits": "credits", 
        "Contact Hours": "contact_hours",
        "Program_Type": "program_type", 
        "Credential": "credential", 
        "Req_Elec": "req_elec", 
        "Delivery_Method": "delivery_method", 
        "Online hrs": "online_hrs",
        "Class hrs": "class_hrs",
        "AC_Name - Loading": "ac_name_loading", 
        "School": "school",
        "Exam_OTR": "exam_otr", 
        "Semester": "semester", 
        "Fall": "fall", 
        "Winter": "winter", 
        "Spring_Summer": "spring_summer", 
        "Notes": "notes",
        "Contact Hours": "contact_hours",
    },
    "instructors": {
        "Instructor_ID": "instructor_id",
        "Instructor_LastName": "instructor_lastname",
        "Instructor_Name": "instructor_name",
        "Contract_Type": "contract_type",
        "Instructor_Status": "instructor_status",
        "Salaried Begin Date": "salaried_begin_date",
        "Contract End": "contract_end",
        "Reporting_AC": "reporting_ac",
        "CCH Target AY2025": "cch_target_ay2025",
        "Primary Program": "primary_program",
        "Position #": "position_number",
        "Years as Temp": "years_as_temp",
        "Highest Education - TBC": "highest_education_tbc",
        "Skill Scope": "skill_scope",
        "Action Plan": "action_plan",
        "Notes/Plan": "notes_plan",
        "Full Name": "full_name",
    },
    "programs": {
        "Group": "group",
        "Acronym": "acronym",
        "Program": "program",
        "Academic Chair": "academic_chair",
        "Associate Dean": "associate_dean",
        "Credential": "credential",
        "Courses": "courses",
        "Intakes": "intakes",
        "Duration": "duration",
        "Starting Date": "starting_date",
        "Delivery": "delivery",
        "Status": "status",
    }
}


# dictionary used to validate which columns are allowed in each table by using the TABLE_COLUMN_MAPPINGS dictionary to get the values
TABLE_VALID_COLUMNS = {
    "courses": set(TABLE_COLUMN_MAPPINGS["courses"].values()),
    "instructors": set(TABLE_COLUMN_MAPPINGS["instructors"].values()),
    "programs": set(TABLE_COLUMN_MAPPINGS["programs"].values()),
    "otr_submissions": set(TABLE_COLUMN_MAPPINGS["otr_submissions"].values()),
}

# certain data not needed to be displayed back to user 
HIDDEN_COLUMNS = {
    "programs": ["program_id"],
    "courses": [], #just in case we need to add a hidden column to courses 
    "instructors": [] #just in case we need to add a hidden column to instructors 
}

# dictionary of primary keys in the database so that my logic can check if row data for a primary key exists (used to skip empty rows)
TABLE_PRIMARY_KEYS = {
    "courses" : "course_id",
    "instructors" : "instructor_id",
    "programs": "program_id",
    "otr_submissions": "otr_submission_id",
}

# CONNECTION TEST FUNCTION (will only work if courses table actually has data in it)
def test_connection():
    try:
        # Attempt to fetch 1 row from the "courses" table
        response = supabase_client.table("courses").select("*").limit(1).execute()
        
        # Check if data was returned
        if response.data:
            print("Supabase connected successfully!")

    except Exception as e:
        print("Supabase connection failed:", e)

# def read_file_safely(file):
#     filename = file if isinstance(file, str) else file.filename
#     extension = os.path.splitext(filename)[1].lower()

#     if extension in [".xlsx", ".xls"]:
#         return pd.read_excel(file)
    
#     encodings = ["utf-8", "cp1252", "latin-1"]
#     for enc in encodings:
#         try:
#             if hasattr(file, "seek"):


# data is formatted for JSON format and database upload 
#Created with help of AI - helped ensure all cases of Nan, None, and infinite numbers were accounted for
def formatted_data(df, table_name):

    # variable to store the primary key to check against later 
    primary_key =  TABLE_PRIMARY_KEYS.get(table_name)

    # Filter out unexpected columns
    valid_columns = TABLE_VALID_COLUMNS.get(table_name, set()) # get the current set of valid columns for the according table
    df = df[[col for col in df.columns if col in valid_columns]] # loops through the columns in the dataframe to see if they are in valid_columns, if not they are dropped

#CAN MAYBE TAKE THIS OUT BY USING BELOW FUNCTION
    # # Timestamp and datetime values are converted to y-m-d format
    # df = df.applymap(lambda x: x.strftime("%Y-%m-%d") if isinstance(x, (pd.Timestamp, datetime)) and pd.notna(x) else x)
    # # map() applies the lambda function to all the elements of the dataframe 
    # # the lambda function converts the value to strftime("%Y-%m-%d") if it is eitherpd.Timestamp or datetime
    # # if it isnt either, it is not changed

    def clean_data(x):
        if isinstance(x, (pd.Timestamp, datetime)) and pd.notna(x):
            return x.strftime("%Y-%m-%d")
        elif isinstance(x, float) and x.is_integer():
            return int(x)
        elif isinstance(x, str) and x.replace('.', '', 1).isdigit():
            return int(float(x))
        else:
            return x
    
    df = df.applymap(clean_data)

    # Replace invalid numeric values
    df = df.replace({np.nan: None, np.inf: None, -np.inf: None})
    df = df.where(pd.notnull(df), None)
    # this acts as a type of safety net using True/False condition (if False then replaced with None)

    if table_name == "instructors" and 'years_as_temp' in df.columns:
        # Convert to numeric, coercing invalid entries to NaN
        df['years_as_temp'] = pd.to_numeric(df['years_as_temp'], errors='coerce')
        
        # Round to 2 decimal places
        df['years_as_temp'] = df['years_as_temp'].round(2)
        
        # Replace NaN and infinities with None (JSON-safe)
        df['years_as_temp'] = df['years_as_temp'].replace([np.nan, np.inf, -np.inf], None)

    # Drop rows where the primary key is missing
    if primary_key and primary_key in df.columns:
        df = df[df[primary_key].notnull()]
    # checks if the value is a primary key in the dataframe column
    # if df[primary_key].notnull() returns true then the row is kept, if not it is skipped

    # UUID is created if table is missing primary key altogether (like program table)
    if primary_key and primary_key not in df.columns:
        df[primary_key] = [str(uuid.uuid4()) for _ in range(len(df))]
        # primary key created for each row of dataframe and converted to string 

    # Convert float to int for online_hrs and class_hrs
    if table_name == "courses":
        for col in ['online_hrs', 'class_hrs']:
            if col in df.columns:
                # Convert to numeric, coercing invalid entries to NaN
                df[col] = pd.to_numeric(df[col], errors='coerce')
                
                # Convert column to nullable integer type ('Int64')
                # This handles np.nan by converting it to pd.NA
                # It also converts 3.0 (float) to 3 (int)
                try:
                    df[col] = df[col].astype('Int64') 
                except (TypeError, ValueError):
                    # Fallback if casting fails
                    pass 

    # Final cleanup to ensure no NaN, pd.NA, or infinity values remain
    df = df.replace({np.nan: None, np.inf: None, -np.inf: None, pd.NA: None})
    df = df.where(pd.notnull(df), None)

    return df




# function to upload the file while using more data formatting 
#Created with help of AI - ensured proper data formatting for database insurtion 
def upload_file(file_or_path, table_name, column_standardization, uploaded_by):

    # get the file extension
    if hasattr(file_or_path, "filename"): # this is a FileStorage object
        filename = file_or_path.filename
        file_extension = filename.split(".")[-1].lower()
    elif isinstance(file_or_path, str): # this is a path string
        filename = os.path.basename(file_or_path)
        file_extension = os.path.spitext(filename)[1].lower().replace(".", "")
    else:
        raise ValueError("Unsupported file type. Must be a path or FileStorage object.")
    # NEED TO ADJUST COMMENTS FOR NEW METHOD
    # os.path.splittext gets the file path and separates the path from the extension
    # [1] is the index that points to the file extension rather than the path ([0])
    # lower() adjusts extension to lower case 
    
    # now we have to read it into the data frame
    if file_extension == "csv":
        df = pd.read_csv(file_or_path)
    elif file_extension in ["xls", "xlsx"]: 
        df = pd.read_excel(file_or_path)
    else:
        raise ValueError ("Unsupported file type. Please upload a CSV or XLSX file.")
    # df is a Pandas DataFrame object containing all data from the file


    df.columns = df.columns.str.strip() # this gets rid of white space before or after the column name
    df.columns = df.columns.str.replace('\xa0', ' ') # replaces the non-breaking space (\xa0) with regular space (non-breaking space doesnt work for data upload)
    df.columns = df.columns.str.replace(r'\s+', ' ', regex=True)  # collapse multiple spaces
    df.columns = df.columns.str.strip() # strip again just in case

    column_standardization = TABLE_COLUMN_MAPPINGS.get(table_name, {})
    df = df.rename(columns = column_standardization)
    # renames the columns in the dataframe to fit the standards of the database 


    df = formatted_data(df, table_name)
    # the data in the dataframe is formatted according to the formatted_data function

    df['uploaded_at'] = datetime.now().strftime("%Y-%m-%d @%H:%M") # converted to ISO format (standard string format) to be accepted into JSON 
    df['uploaded_by'] = uploaded_by
    # these metadata columns will be used across all uploaded tables
    
    data_asDictionaries = df.to_dict(orient = "records")
    # converts the data in the dataframe to a list of dictionaries (best structure for supabase)
    # orient = "records" best data orientation (row oriented) for supabase insert

    supabase_client.table(table_name).insert(data_asDictionaries).execute()
    # uploads the data to supabase
    # execute() is the function that actually sends this data through

    column_order = list(df.columns)
    return column_order



# Don't think we will need this functionality anymore
def backup_table(table_name):
    backup_table_name = f"{table_name}_backup"
    version_id = str(uuid.uuid4())

    try:
        response = supabase_client.table(table_name).select("*").execute()
        data = response.data

        if not data:
            print(f"No data found in {table_name}, skipping backup.")
            return
        
        backup_data = []
        for row in data:
            backup_row = row.copy()
            backup_row["backup_id"] = str(uuid.uuid4())
            backup_row["version_id"] = version_id
            backup_data.append(backup_row)

        supabase_client.table(backup_table_name).insert(backup_data).execute()
        print(f"Backup successful: {len(backup_data)} rows saved with version_id {version_id}")
    
    except Exception as e:
        print("Backup failed: ", e)

def link_courses_to_programs():
    """
    Links courses to programs by matching course.program_major to program.acronym.
    Returns a list of courses that couldn't be matched to any program.
    """
    try:
        # Fetch all programs
        programs_response = supabase_client.table("programs").select("program_id, acronym, program").execute()
        programs = programs_response.data or []
        
        # Fetch all courses
        courses_response = supabase_client.table("courses").select("course_id, course_code, course_name, program_major").execute()
        courses = courses_response.data or []
        
        if not programs:
            print("Warning: No programs found in database. Cannot link courses.")
            return [{"course_id": c["course_id"], "course_code": c.get("course_code"), "course_name": c.get("course_name"), "program_major": c.get("program_major")} for c in courses if c.get("program_major")]
        
        # Create a mapping of acronym (uppercase) to program_id
        acronym_to_program_id = {}
        for program in programs:
            if program.get("acronym"):
                acronym_to_program_id[program["acronym"].upper().strip()] = program["program_id"]
        
        unmatched_courses = []
        matched_count = 0
        
        # Match each course to a program
        for course in courses:
            program_major = course.get("program_major")
            
            if not program_major:
                # Skip courses without a program_major value
                continue
            
            # Try to match by acronym (case-insensitive)
            program_major_upper = program_major.upper().strip()
            matched_program_id = acronym_to_program_id.get(program_major_upper)
            
            if matched_program_id:
                # Update the course with the matched program_id
                supabase_client.table("courses").update({
                    "program_id": matched_program_id
                }).eq("course_id", course["course_id"]).execute()
                matched_count += 1
            else:
                # Add to unmatched list
                unmatched_courses.append({
                    "course_id": course["course_id"],
                    "course_code": course.get("course_code", ""),
                    "course_name": course.get("course_name", ""),
                    "program_major": program_major
                })
        
        print(f"Course linking complete: {matched_count} matched, {len(unmatched_courses)} unmatched")
        return unmatched_courses
        
    except Exception as e:
        print(f"Error linking courses to programs: {e}")
        return []


def save_uploaded_file(file, user_email, supabase, table_name, bucket_name="uploads"):
    try:
        print("Starting save_uploaded_file()...")  # DEBUG
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        unique_id = str(uuid.uuid4())
        storage_path = f"{timestamp}_{unique_id}_{file.filename}"
        print("Storage path:", storage_path)  # DEBUG

        # Read file safely
        file_bytes = file.read()
        print(f"Read {len(file_bytes)} bytes from file")  # DEBUG

        # Upload to Supabase Storage
        upload_response = supabase.storage.from_(bucket_name).upload(storage_path, file_bytes)
        print("Upload response:", upload_response)  # DEBUG

        # Reset stream pointer
        if hasattr(file, "stream"):
            file.stream.seek(0)
            print("Reset file stream")  # DEBUG
        else:
            print("No stream attribute found on file")  # DEBUG

        # Fetch version
        existing = supabase.table("uploaded_files") \
            .select("version") \
            .eq("original_name", file.filename) \
            .eq("table_name", table_name) \
            .execute()
        next_version = (max([r["version"] for r in existing.data], default=0) + 1)
        print("Next version:", next_version)  # DEBUG

        print(f"Clearing table '{table_name}' before upload...")
        clear_table_data(table_name)

        column_standardization = TABLE_COLUMN_MAPPINGS.get(table_name, {})
        column_order = upload_file(file, table_name, column_standardization, user_email) #THIS IS WHERE ERROR HAPPENS - go check upload file function
        print("Column order:", column_order)  # DEBUG

        supabase.table("uploaded_files").insert({
            "original_name": file.filename,
            "table_name": table_name,
            "storage_path": storage_path,
            "version": next_version,
            "uploaded_by": user_email,
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "column_order": column_order
        }).execute()

        print("File metadata inserted successfully")  # DEBUG
        
        # Link courses to programs after uploading courses or programs
        unmatched_courses = []
        if table_name in ["courses", "programs"]:
            print(f"Linking courses to programs after {table_name} upload...")
            unmatched_courses = link_courses_to_programs()
        
        return {
            "version": next_version,
            "storage_path": storage_path,
            "original_name": file.filename,
            "table_name": table_name,
            "column_order": column_order,
            "unmatched_courses": unmatched_courses
        }

    except Exception as e:
        print("Error inside save_uploaded_file():", e)
        raise

# created with help of AI - needed help understanding why filter was needed
def clear_table_data(table_name):
    primary_key = TABLE_PRIMARY_KEYS.get(table_name)
    # ensure table holds a primary key
    if not primary_key:
        raise ValueError(f"No primary key defined for table: {table_name}")
    
    # the supabase api needs a filter to perform delete() so this will filter in a way that gets all rows anyway
    # will filter for rows with empty primary key value since all table values will have a primary key value
    supabase_client.table(table_name).delete().not_.is_(primary_key, None).execute()
    print(f"Successfully deleted old data from table: {table_name}")

def upload_table(file, table_name, uploaded_by):
    print(f"Starting upload_table() for {table_name}...")
    if table_name not in TABLE_COLUMN_MAPPINGS:
        raise ValueError(f"Unsupported table: {table_name}")
    
    # backup_table(table_name)
    
    # check if database table is empty
    primary_key = TABLE_PRIMARY_KEYS.get(table_name)
    if not primary_key:
        raise ValueError(f"No primary key defined for table: {table_name}")
    
    response = supabase_client.table(table_name).select(primary_key).limit(1).execute() #limit(1) just checks first row
    
    # clear the old institutional data in database table if not empty
    if response.data:
        clear_table_data(table_name)
    
        
    column_standardization = TABLE_COLUMN_MAPPINGS[table_name]
    upload_file(file, table_name, column_standardization, uploaded_by)

    print(f"Data successfully uploaded to table: {table_name}")


# function to get the table data from the database
def fetch_table_data (table_name):
    if table_name not in TABLE_COLUMN_MAPPINGS:
        raise ValueError(f"Unsupported table: {table_name}")
    
    try:
        response = supabase_client.table(table_name).select("*").execute()
        data = response.data or []

        hidden_cols = HIDDEN_COLUMNS.get(table_name, [])

        meta_response = supabase_client.table("uploaded_files") \
                    .select("column_order") \
                    .eq("table_name", table_name) \
                    .order("uploaded_at", desc=True) \
                    .limit(1) \
                    .execute()
                    
        column_order = []
        if meta_response.data and len(meta_response.data) > 0:
            column_order = meta_response.data[0].get("column_order", list(data[0].keys()) if data else [])
        elif data:
            column_order = list(data[0].keys())

        if hidden_cols:
            for row in data:
                for col in hidden_cols:
                    row.pop(col, None)
            column_order = [col for col in column_order if col not in hidden_cols]

        return {"data": data, "column_order": column_order}
    except Exception as e:
        raise RuntimeError(f"Error fetching data from {table_name}: {e}")
    
def restore_file_from_url(file_url, table_name, uploaded_by):
    # download the data in the file
    response = requests.get(file_url)
    response.raise_for_status()

    # convert the data to a file_like object for upload_file()
    file_like = BytesIO(response.content)
    file_like.filename = file_url.split("/")[-1] # gives the filename an attribute

    upload_table(file_like, table_name, uploaded_by)

def get_user_info(id):
    try:
        print("Looking for user id:", id)
        response = supabase_client.table("users").select("first_name, last_name, role").eq("id", id).single().execute()
        print("Supabase response:", response)

        if response.data:
            user_data = response.data
            full_name = f"{user_data['first_name']} {user_data['last_name']}"
            role = user_data.get("role")
            return {"full_name": full_name, "role": role}
        else:
            return "None"
    
    except Exception as e:
        print("Error fetching user info", e)
        return None