from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import os
import json
from datetime import datetime

import requests

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/generate-itinerary', methods=['POST'])
# @jwt_required() - Commented out to allow planning without being logged in
def generate_itinerary():
    data = request.json
    destination = data.get('destination')
    days = data.get('days', 3)
    budget = data.get('budget', 'flexible')
    interests = data.get('interests', [])
    
    if not destination:
        return jsonify({"error": "Destination is required"}), 400
    
    prompt = (
        f"Generate a {days}-day travel itinerary for {destination} with a budget of {budget}. "
        f"Interests: {', '.join(interests) if interests else 'general sightseeing'}. "
        "Format the response as a valid JSON object with a key 'days' containing a list. "
        "Each day has 'day_number' (integer) and 'activities' (list). "
        "Each activity has 'time' (HH:MM format), 'location' (string), and 'description' (string). "
        "Respond ONLY with the raw JSON object, no markdown, no code blocks."
    )
    
    import time
    
    try:
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key:
            raise Exception("MISTRAL_API_KEY not set in environment")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "mistral-large-latest",
            "messages": [{"role": "user", "content": prompt}]
        }
        
        max_retries = 3
        base_delay = 2
        
        resp = None
        for attempt in range(max_retries):
            try:
                # Increased timeout for slow generations
                resp = requests.post("https://api.mistral.ai/v1/chat/completions", headers=headers, json=payload, timeout=60)
                
                # If rate limited, sleep and retry
                if resp.status_code == 429:
                    print(f"Rate limited by Mistral. Retrying in {base_delay}s... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(base_delay)
                    base_delay *= 2  # Exponential backoff
                    continue
                    
                resp.raise_for_status()
                break # Success! Break out of the retry loop
                
            except requests.exceptions.RequestException as e:
                # If it's the last attempt or not a rate limit, raise it
                if attempt == max_retries - 1 or (resp and resp.status_code != 429):
                    raise e
                print(f"Network error: {e}. Retrying...")
                time.sleep(base_delay)
                base_delay *= 2
        
        if not resp or resp.status_code != 200:
             raise Exception("Failed to get a successful response from Mistral after retries.")

        chat_response = resp.json()
        raw_content = chat_response["choices"][0]["message"]["content"].strip()

        # Strip markdown code fences if Mistral added them
        if raw_content.startswith("```"):
            lines = raw_content.splitlines()
            lines = [l for l in lines if not l.strip().startswith("```")]
            raw_content = "\n".join(lines).strip()

        # Validate it's actually JSON before returning
        parsed = json.loads(raw_content)
        return jsonify(parsed), 200

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e} — raw: {raw_content[:300]}")
        return jsonify({"error": f"AI returned invalid JSON: {str(e)}"}), 500
    except requests.exceptions.Timeout:
        return jsonify({"error": "The AI took too long to respond. Please try again or specify fewer days."}), 504
    except requests.exceptions.RequestException as e:
        print(f"Mistral API error: {e}")
        return jsonify({"error": f"Failed to reach AI service: {str(e)}\nResponse: {resp.text if resp else 'No response'}"}), 500
    except Exception as e:
        print(f"Itinerary generation error: {e}")
        return jsonify({"error": str(e)}), 500


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

@ai_bp.route('/ask-local', methods=['POST'])
def ask_local():
    data = request.json
    city = data.get('city', 'Unknown Location')
    question = data.get('question', '')
    
    if not question:
        return jsonify({"error": "No question provided"}), 400
        
    prompt = f"As a knowledgeable local of {city}, answer the following question in one short paragraph (max 3 lines) in English: '{question}'. Ensure your response reflects local customs, culture, and insights."
    
    import time

    try:
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key:
            raise Exception("MISTRAL_API_KEY not set in environment")
            
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "mistral-large-latest",
            "messages": [{"role": "user", "content": prompt}]
        }
        
        max_retries = 3
        base_delay = 2
        
        resp = None
        for attempt in range(max_retries):
            try:
                resp = requests.post("https://api.mistral.ai/v1/chat/completions", headers=headers, json=payload, timeout=30)
                
                # If rate limited, sleep and retry
                if resp.status_code == 429:
                    print(f"Rate limited by Mistral (Ask Local). Retrying in {base_delay}s... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(base_delay)
                    base_delay *= 2
                    continue
                    
                resp.raise_for_status()
                break # Success! Break out of the retry loop
                
            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1 or (resp and resp.status_code != 429):
                    raise e
                print(f"Network error (Ask Local): {e}. Retrying...")
                time.sleep(base_delay)
                base_delay *= 2
        
        if not resp or resp.status_code != 200:
             raise Exception("Failed to get a successful response from Mistral after retries.")
        
        chat_response = resp.json()
        content = chat_response["choices"][0]["message"]["content"].strip()
        return jsonify({"response": content})
    except requests.exceptions.Timeout:
        return jsonify({"error": "The AI took too long to respond. Please try again."}), 504
    except Exception as e:
        print(f"Ask Local error: {e}")
        return jsonify({"error": str(e)}), 500
