import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from models import db
from routes.auth_routes import auth_bp
from routes.trip_routes import trip_bp
from routes.ai_routes import ai_bp
from routes.location_routes import location_bp
from routes.budget_routes import budget_bp
from routes.collab_routes import collab_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///travel.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
    
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(trip_bp, url_prefix='/api/trips')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(location_bp, url_prefix='/api/location')
    app.register_blueprint(budget_bp, url_prefix='/api/budget')
    app.register_blueprint(collab_bp, url_prefix='/api/collab')
    
    with app.app_context():
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
