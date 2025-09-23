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

import pandas as pd

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
        "Modality": "modality", 
        "Program_Type": "program_type", 
        "Credential": "credential", 
        "Req_Elec": "req_elec", 
        "Delivery_Method": "delivery_method", 
        "AC_Name": "ac_name", 
        "School": "school",
        "Exam_OTR": "exam_otr", 
        "Semester": "semester", 
        "Fall": "fall", 
        "Winter": "winter", 
        "Spring_Summer": "spring_summer", 
        "Order": "order", 
        "Duration (days)": "duration_days", 
        "Notes": "notes",
    },
    "courses_backup": {
        "Backup_ID": "backup_id",
        "Version_ID": "version_id",
        "Course_ID": "course_id", 
        "Course_Code": "course_code", 
        "Course_Name": "course_name", 
        "Program/ Major": "program_major", 
        "Group": "group", 
        "Credits": "credits", 
        "Contact Hours": "contact_hours",
        "Modality": "modality", 
        "Program_Type": "program_type", 
        "Credential": "credential", 
        "Req_Elec": "req_elec", 
        "Delivery_Method": "delivery_method", 
        "AC_Name": "ac_name", 
        "School": "school",
        "Exam_OTR": "exam_otr", 
        "Semester": "semester", 
        "Fall": "fall", 
        "Winter": "winter", 
        "Spring_Summer": "spring_summer", 
        "Order": "order", 
        "Duration (days)": "duration_days", 
        "Notes": "notes",
        "Uploaded_At": "uploaded_at",
        "Uploaded_By": "uploaded_by",
    },
    "instructors": {
        "Instructor_ID": "instructor_id",
        "Instructor_LastName": "instructor_lastname",
        "Instructor_Name": "instructor_name",
        "Contract_Type": "contract_type",
        "Instructor_Status": "instructor_status",
        "Start Date": "start_date",
        "End Date": "end_date",
        "Time off": "time_off",
        "ID_Manager": "id_manager",
        "Name_Manager": "name_manager",
        "Comments": "comments",
        "ID_Position": "id_position",
    },
    "instructors_backup": {
        "Backup_ID": "backup_id",
        "Version_ID": "version_id",
        "Instructor_ID": "instructor_id",
        "Instructor_LastName": "instructor_lastname",
        "Instructor_Name": "instructor_name",
        "Contract_Type": "contract_type",
        "Instructor_Status": "instructor_status",
        "Start Date": "start_date",
        "End Date": "end_date",
        "Time off": "time_off",
        "ID_Manager": "id_manager",
        "Name_Manager": "name_manager",
        "Comments": "comments",
        "ID_Position": "id_position",
        "Uploaded_At": "uploaded_at",
        "Uploaded_By": "uploaded_by",
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
    },
    "programs_backup": {
        "Backup ID": "backup_id",
        "Version ID": "version_id",
        "Program ID": "program_id",
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
        "Uploaded At": "uploaded_at",
        "Uploaded By": "uploaded_by",
    }
}


# dictionary used to validate which columns are allowed in each table by using the other dictionary to get the values
TABLE_VALID_COLUMNS = {
    "courses": set(TABLE_COLUMN_MAPPINGS["courses"].values()),
    "courses_backup": set(TABLE_COLUMN_MAPPINGS["courses_backup"].values()),
    "instructors": set(TABLE_COLUMN_MAPPINGS["instructors"].values()),
    "instructors_backup": set(TABLE_COLUMN_MAPPINGS["instructors_backup"].values()),
    "programs": set(TABLE_COLUMN_MAPPINGS["programs"].values()),
    "programs_backup": set(TABLE_COLUMN_MAPPINGS["programs_backup"].values())
}

# dictionary of primary keys in the database so that my logic can check if row data for a primary key exists (used to skip empty rows)
TABLE_PRIMARY_KEYS = {
    "courses" : "course_id",
    "courses_backup": "backup_id",
    "instructors" : "instructor_id",
    "instructors_backup": "backup_id",
    "programs": "program_id",
    "programs_backup": "backup_id"
}

# data is formatted for JSON format and database upload 
def formatted_data(df, table_name):

    # variable to store the primary key to check against later 
    primary_key =  TABLE_PRIMARY_KEYS.get(table_name)

    # Filter unexpected columns
    valid_columns = TABLE_VALID_COLUMNS.get(table_name, set()) # get the current set of valid columns for the according table
    df = df[[col for col in df.columns if col in valid_columns]] # loops through the columns in the dataframe to see if they are in valid_columns, if not they are dropped

    # Timestamp and datetime values are converted to ISO format
    df = df.applymap(lambda x: x.isoformat() if isinstance(x, (pd.Timestamp, datetime)) else x)
    # map() applies the lambda function to all the elements of the dataframe 
    # the lambda function converts the value to ISO if it is eitherpd.Timestamp or datetime
    # if it isnt either, it is not changed

    # Replace invalid numeric values
    df = df.replace({np.nan: None, np.inf: None, -np.inf: None})
    df = df.where(pd.notnull(df), None)
    # this acts as a type of safety net using True/False condition (if False then replaced with None)

    # Drop rows where the primary key is missing
    if primary_key and primary_key in df.columns:
        df = df[df[primary_key].notnull()]
    # checks if the value is a primary key in the dataframe column
    # if df[primary_key].notnull() returns true then the row is kept, if not it is skipped

    # UUID is created if table is missing primary key altogether (like program table)
    if primary_key and primary_key not in df.columns:
        df[primary_key] = [str(uuid.uuid4()) for _ in range(len(df))] # _ is a throwaway variable (we don't need it's value)
        # primary key created for each row of dataframe and converted to string 
    return df


# function to upload the file while using more data formatting 
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

    df = df.rename(columns = column_standardization)
    # renames the columns in the dataframe to fit the standards of the database 


    df = formatted_data(df, table_name)
    # the data in the dataframe is formatted according to the formatted_data function

    df['uploaded_at'] = datetime.now().isoformat() # converted to ISO format (standard string format) to be accepted into JSON 
    df['uploaded_by'] = uploaded_by
    # these metadata columns will be used across all uploaded tables
    
    data_asDictionaries = df.to_dict(orient = "records")
    # converts the data in the dataframe to a list of dictionaries (best structure for supabase)
    # orient = "records" best data orientation (row oriented) for supabase insert

    supabase_client.table(table_name).insert(data_asDictionaries).execute()
    # uploads the data to supabase
    # execute() is the function that actually sends this data through

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

def save_uploaded_file(file, user_email, supabase, table_name, bucket_name="uploads"):

    # Generate unique file name (timestamp + uuid + original name)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())
    storage_path = f"{timestamp}_{unique_id}_{file.filename}"

    # upload the file to supabase bucket
    supabase.storage.from_(bucket_name).upload(storage_path, file.read())

    # rewind the pointer so that the file can be read again (like for database table upload)
    file.stream.seek(0)

    # get most recent version for this file name (AI Generated)
    existing = supabase.table("uploaded_files") \
        .select("version") \
        .eq("original_name", file.filename) \
        .eq("table_name", table_name) \
        .execute()
    next_version = (max([r["version"] for r in existing.data], default = 0) + 1)

    # insert the metadata into upload_files table
    supabase.table("uploaded_files").insert({
        "original_name": file.filename,
        "table_name": table_name,
        "storage_path": storage_path,
        "version": next_version,
        "uploaded_by": user_email,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }).execute()

    return {
        "version": next_version,
        "storage_path": storage_path,
        "original_name": file.filename,
        "table_name": table_name
    }


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

        return response.data
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