from flask import jsonify

def register_health_routes(app):
    @app.route('/') # This created route ('/') acts as the base of the Flask server (almost like a landing page but just isn't user facing)
    def health_check(): # this is the function called when this route is visited (this route will be visited any time the server is running since it is the base route)
        return jsonify({"Status" : "IMS Flask backend is running"}) 
    # this is a health check, if the server is running this message will display
    # jsonify ensures returned text is in a consistent JSON format 