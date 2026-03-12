from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import openai
import os

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/generate-itinerary', methods=['POST'])
@jwt_required()
def generate_itinerary():
    data = request.get_json()
    destination = data.get('destination')
    days = data.get('days')
    budget = data.get('budget')
    interests = data.get('interests', [])
    
    prompt = (
        f"Generate a {days}-day travel itinerary for {destination} with a budget of {budget}. "
        f"Interests: {', '.join(interests)}. "
        "Format the response as a valid JSON object with a list of days, where each day has a day_number and a list of activities. "
        "Each activity should have 'time' (HH:MM), 'location', and 'description'. "
        "Respond ONLY with the JSON object."
    )
    
    try:
        openai.api_key = os.getenv("OPENAI_API_KEY")
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": "You are a professional travel planner that outputs only JSON."},
                      {"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content, 200, {'Content-Type': 'application/json'}
    except Exception as e:
        # Fallback dummy JSON for demonstration
        import json
        dummy = {
            "days": [
                {
                    "day_number": i+1,
                    "activities": [
                        {"time": "09:00", "location": f"Top Landmark in {destination}", "description": "General sightseeing"},
                        {"time": "13:00", "location": "Local Restaurant", "description": "Lunch"},
                    ]
                } for i in range(days)
            ]
        }
        return json.dumps(dummy), 200, {'Content-Type': 'application/json'}

@ai_bp.route('/apply-itinerary', methods=['POST'])
@jwt_required()
def apply_itinerary():
    from models import db, Itinerary, Activity
    data = request.get_json()
    trip_id = data.get('trip_id')
    days_data = data.get('days', [])
    
    try:
        # Clear existing itinerary for this trip
        existing_itineraries = Itinerary.query.filter_by(trip_id=trip_id).all()
        for it in existing_itineraries:
            db.session.delete(it)
        db.session.flush()
        
        for d in days_data:
            itinerary = Itinerary(trip_id=trip_id, day_number=d['day_number'])
            db.session.add(itinerary)
            db.session.flush()
            
            for act in d.get('activities', []):
                new_activity = Activity(
                    itinerary_id=itinerary.id,
                    time=datetime.strptime(act['time'], '%H:%M').time() if act.get('time') else None,
                    location=act['location'],
                    description=act.get('description'),
                    lat=act.get('lat'),
                    lng=act.get('lng')
                )
                db.session.add(new_activity)
        
        db.session.commit()
        return jsonify({"msg": "Itinerary applied successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
