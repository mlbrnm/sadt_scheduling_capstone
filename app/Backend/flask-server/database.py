from supabase import create_client, Client 
# supabase is a python package
    #create_client is a function within that package
    # Client is a class within that package

from dotenv import load_dotenv 
# dotenv is python library to help load enviroment variabes

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

# CONNECTION TEST FUNCTION
def test_connection():
    try:
        # Attempt to fetch 1 row from the "courses" table
        response = supabase_client.table("courses").select("*").limit(1).execute()
        
        # Check if data was returned
        if response.data:
            print("Supabase connected successfully!")

    except Exception as e:
        print("Supabase connection failed:", e)




# GENERIC HELPER FUNCTION
def upload_file(file_path, table_name, column_standardization, uploaded_by):
    file_extension = os.path.splitext(file_path)[1].lower()
    # os.path.splittext gets the file path and separates the path from the extension
    # [1] is the index that points to the file extension rather than the path ([0])
    # lower() adjusts extension to lower case 
    
    if file_extension == "csv":
        df = pd.read_csv(file_path)
    elif file_extension in [".xls", ".xlsx"]: 
        df = pd.read_excel(file_path)
    else:
        raise ValueError ("Unsupported file type. Please upload a CSV or XLSX file.")
    # df is a Pandas DataFrame object containing all data from the file

    df = df.rename(columns = column_standardization)
    # uses the standardization performed in the table-specific functions

    df = df.rename(columns=column_standardization)
    df = df.replace({np.nan: None, np.inf: None, -np.inf: None})

    df['uploaded_at'] = datetime.now().isoformat()
    df['uploaded_by'] = uploaded_by
    # these metadata columns will be used across all uploaded tables
    
    data_asDictionaries = df.to_dict(orient = "records")
    # converts the data in the dataframe to a list of dictionaries (best structure for supabase)
    # orient = "records" best data orientation (row oriented) for supabase insert


    supabase_client.table(table_name).insert(data_asDictionaries).execute()
    # uploads the data to supabase
    # execute() is the function that actually sends this data through


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
    }

}


def upload_table(file_path, table_name, uploaded_by):
    if table_name not in TABLE_COLUMN_MAPPINGS:
        raise ValueError(f"Unsupported table: {table_name}")
    
    column_standardization = TABLE_COLUMN_MAPPINGS[table_name]
    upload_file(file_path, table_name, column_standardization, uploaded_by)