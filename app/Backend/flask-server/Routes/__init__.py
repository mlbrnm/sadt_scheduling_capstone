# this __init__.py file turns the Routes directory into a package that can be imported directly (which makes it simpler importing the routes into the server.py file)
from .health_routes import register_health_routes
from .admin_routes import register_admin_routes
from .schedule_routes import register_schedule_routes
from .user_routes import register_user_routes
from .data_routes import register_data_routes

def register_all_routes(app):
    register_health_routes(app)
    register_admin_routes(app)
    register_schedule_routes(app)
    register_user_routes(app)
    
    register_data_routes(app)
