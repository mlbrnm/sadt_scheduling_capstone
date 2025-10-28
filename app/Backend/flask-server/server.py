from flask import Flask
from flask_cors import CORS
from Routes import register_all_routes
import database

app = Flask(__name__)
# app is the variable name given to the Flask server application
# Flask is a class that takes __name__ as a parameter in it's constructor
# __name__ lets flask know where the application lives (in this case it lives in a file called server.py)

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "X-User-Email", "X-User-Id"]
    }
})
# enable Cross Origin Resource Sharing across flask app
# allow requests from our React frontend running on localhost:3000

# call the function from __init__.py to register all routes 
register_all_routes(app)

database.test_connection() # only works if there is something in the "course" table

if __name__ == '__main__': # server will only start when running the file directly (python server.py), not if imported
    app.run(debug=True)
