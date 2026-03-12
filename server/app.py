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
    
    from routes.discovery_routes import discovery_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(trip_bp, url_prefix='/api/trips')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(location_bp, url_prefix='/api/location')
    app.register_blueprint(budget_bp, url_prefix='/api/budget')
    app.register_blueprint(collab_bp, url_prefix='/api/collab')
    app.register_blueprint(discovery_bp, url_prefix='/api/discovery')
    
    with app.app_context():
        db.create_all()
        seed_db()
        
    return app

def seed_db():
    from models import Product, TravelBuddyProfile, SafetyRating
    if Product.query.first():
        return
    
    # Seed Products
    products = [
        Product(name="Madhubani Painting", price="₹2,500", category="Handicrafts", rating=4.8, description="Traditional Bihar art."),
        Product(name="Pashmina Shawl", price="₹5,000", category="Handicrafts", rating=4.5, description="Authentic Kashmiri."),
        Product(name="Kerala Banana Chips", price="₹300", category="Local Food", rating=4.4, description="Crispy snacks.")
    ]
    db.session.add_all(products)
    
    # Seed Buddies
    buddies = [
        TravelBuddyProfile(name="John", destination="Goa", dates="2024-12-15 to 2024-12-20", interests="Sightseeing, Food", budget="₹60,000", preference="male"),
        TravelBuddyProfile(name="Jane", destination="Delhi", dates="2024-12-05 to 2024-12-10", interests="Food, Culture", budget="₹40,000", preference="female")
    ]
    db.session.add_all(buddies)
    
    # Seed Safety
    safety = [
        SafetyRating(district="Delhi", crimes=2500),
        SafetyRating(district="Goa", crimes=400),
        SafetyRating(district="Mumbai", crimes=1200)
    ]
    db.session.add_all(safety)
    
    # Seed Hotels
    from models import Hotel, Experience
    hotels = [
        Hotel(name="Grand Luxury Hotel", rating="4.5/5", price="₹8,000 per night", category="Luxury", image="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"),
        Hotel(name="Comfort Inn", rating="4.0/5", price="₹4,500 per night", category="Standard", image="https://images.unsplash.com/photo-1551882547-ff43c63faf7c?w=400"),
        Hotel(name="Budget Stay", rating="3.5/5", price="₹2,500 per night", category="Standard", image="https://images.unsplash.com/photo-1445013115605-120063974424?w=400")
    ]
    db.session.add_all(hotels)
    
    # Seed Experiences
    experiences = [
        Experience(title="Goa Beach Adventure", reviews="78", price="from ₹3,200", image="https://images.unsplash.com/photo-1512343802231-9162133823cd?w=400"),
        Experience(title="Jaipur Cultural Tour", reviews="45", price="from ₹1,500", image="https://images.unsplash.com/photo-1599661046289-e31897850029?w=400"),
        Experience(title="Mumbai Street Food", reviews="59", price="from ₹2,800", image="https://images.unsplash.com/photo-1528613094057-a1699d82d43d?w=400")
    ]
    db.session.add_all(experiences)
    
    # Seed Beach Destinations
    from models import BeachDestination, HomeRental
    beaches = [
        BeachDestination(title="Tulum, Mexico", image="https://images.unsplash.com/photo-1504730655501-24c39ac53f0e?w=400"),
        BeachDestination(title="Bora Bora", image="https://images.unsplash.com/photo-1506929193464-f3c743811820?w=400"),
        BeachDestination(title="Hawaii", image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400")
    ]
    db.session.add_all(beaches)
    
    # Seed Home Rentals
    rentals = [
        HomeRental(title="Rentals in Raichak", count="6 rentals", image="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400"),
        HomeRental(title="Rentals in Puri", count="13 rentals", image="https://images.unsplash.com/photo-1549294413-26f195200c16?w=400"),
        HomeRental(title="Rentals in Santiniketan", count="12 rentals", image="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400")
    ]
    db.session.add_all(rentals)
    
    db.session.commit()

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
