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
