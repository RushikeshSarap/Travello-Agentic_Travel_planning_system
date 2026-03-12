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
    
    prompt = f"Generate a {days}-day travel itinerary for {destination} with a budget of {budget}. Interests: {', '.join(interests)}. Format as day-wise breakdown with activities."
    
    try:
        openai.api_key = os.getenv("OPENAI_API_KEY")
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": "You are a helpful travel assistant."},
                      {"role": "user", "content": prompt}]
        )
        return jsonify({"itinerary": response.choices[0].message.content}), 200
    except Exception as e:
        # Fallback for demonstration if API key is missing
        return jsonify({"itinerary": f"AI Plan for {destination} ({days} days): Visit top landmarks, explore local food, and enjoy {', '.join(interests)}.", "note": "OpenAI key missing"}), 200
