from flask import Flask
from flask_cors import CORS
from Routes import register_all_routes
import database

app = Flask(__name__)
# app is the variable name given to the Flask server application
# Flask is a class that takes __name__ as a parameter in it's constructor
# __name__ lets flask know where the application lives (in this case it lives in a file called server.py)

CORS(app)
# enable Cross Origin Resource Sharing across flask app
# can specify which origins to grant access to later on

# call the function from __init__.py to register all routes 
register_all_routes(app)

database.test_connection() # only works if there is something in the "course" table

if __name__ == '__main__': # server will only start when running the file directly (python server.py), not if imported
    app.run(debug=True)