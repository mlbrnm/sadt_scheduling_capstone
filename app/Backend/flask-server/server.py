from flask import Flask
from Routes import register_all_routes
import database

app = Flask(__name__)
# app is the variable name given to the Flask server application
# Flask is a class that takes __name__ as a parameter in it's constructor
# __name__ lets flask know where the application lives (in this case it lives in a file called server.py)

# call the function from __init__.py to register all routes 
register_all_routes(app)

database.test_connection()

if __name__ == '__main__': # server will only start when running the file directly (python server.py), not if imported
    app.run(debug=True)