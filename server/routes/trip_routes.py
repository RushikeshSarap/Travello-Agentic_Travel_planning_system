from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Trip, User, Itinerary, Activity, BudgetTrack, Comment
from datetime import datetime

trip_bp = Blueprint('trips', __name__)

@trip_bp.route('', methods=['POST'])
@jwt_required()
def create_trip():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    new_trip = Trip(
        name=data['name'],
        destination=data['destination'],
        start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
        end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
        budget=data.get('budget', 0.0),
        creator_id=user_id
    )
    db.session.add(new_trip)
    db.session.commit()
    return jsonify({"msg": "Trip created", "id": new_trip.id}), 201

@trip_bp.route('', methods=['GET'])
@jwt_required()
def get_trips():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    trips = Trip.query.filter((Trip.creator_id == user_id) | (Trip.collaborators.contains(user))).all()
    
    return jsonify([{
        "id": t.id,
        "name": t.name,
        "destination": t.destination,
        "start_date": t.start_date.isoformat(),
        "end_date": t.end_date.isoformat(),
        "budget": t.budget
    } for t in trips])

@trip_bp.route('/<int:trip_id>/invite', methods=['POST'])
@jwt_required()
def invite_friend():
    data = request.get_json()
    trip_id = data.get('trip_id')
    username = data.get('username')
    
    trip = Trip.query.get(trip_id)
    user = User.query.filter_by(username=username).first()
    
    if trip and user:
        trip.collaborators.append(user)
        db.session.commit()
        return jsonify({"msg": "Friend invited"}), 200
    return jsonify({"msg": "Trip or User not found"}), 404

@trip_bp.route('/<int:trip_id>', methods=['GET'])
@jwt_required()
def get_trip_details(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    
    return jsonify({
        "id": trip.id,
        "name": trip.name,
        "destination": trip.destination,
        "start_date": trip.start_date.isoformat(),
        "end_date": trip.end_date.isoformat(),
        "budget": trip.budget,
        "itineraries": [{
            "id": i.id,
            "day_number": i.day_number,
            "activities": [{
                "id": a.id,
                "time": a.time.strftime('%H:%M') if a.time else None,
                "location": a.location,
                "description": a.description,
                "lat": a.lat,
                "lng": a.lng
            } for a in i.activities]
        } for i in sorted(trip.itineraries, key=lambda x: x.day_number)]
    })

@trip_bp.route('/<int:trip_id>/activity', methods=['POST'])
@jwt_required()
def add_activity(trip_id):
    data = request.get_json()
    day_number = data.get('day_number', 1)
    
    # Get or create itinerary for this day
    itinerary = Itinerary.query.filter_by(trip_id=trip_id, day_number=day_number).first()
    if not itinerary:
        itinerary = Itinerary(trip_id=trip_id, day_number=day_number)
        db.session.add(itinerary)
        db.session.flush()
    
    new_activity = Activity(
        itinerary_id=itinerary.id,
        time=datetime.strptime(data['time'], '%H:%M').time() if data.get('time') else None,
        location=data['location'],
        description=data.get('description'),
        lat=data.get('lat'),
        lng=data.get('lng')
    )
    db.session.add(new_activity)
    db.session.commit()
    return jsonify({"msg": "Activity added"}), 201
