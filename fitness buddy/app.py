import os
import json
import re
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference

load_dotenv()

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

# ── IBM watsonx.ai configuration ──────────────────────────────────────────────
IBM_API_KEY   = os.getenv("IBM_API_KEY", "")
IBM_PROJECT_ID = os.getenv("IBM_PROJECT_ID", "")
IBM_URL        = os.getenv("IBM_URL", "https://us-south.ml.cloud.ibm.com")
GRANITE_MODEL  = os.getenv("GRANITE_MODEL", "ibm/granite-13b-instruct-v2")


def get_model() -> ModelInference:
    """Return a configured IBM Granite ModelInference instance."""
    credentials = Credentials(api_key=IBM_API_KEY, url=IBM_URL)
    return ModelInference(
        model_id=GRANITE_MODEL,
        credentials=credentials,
        project_id=IBM_PROJECT_ID,
        params={
            "max_new_tokens": 900,
            "min_new_tokens": 60,
            "temperature": 0.7,
            "top_p": 0.9,
            "repetition_penalty": 1.1,
        },
    )


def ask_granite(prompt: str) -> str:
    """Send a prompt to IBM Granite and return the text response."""
    try:
        model = get_model()
        response = model.generate_text(prompt=prompt)
        return response.strip() if isinstance(response, str) else str(response).strip()
    except Exception as exc:
        app.logger.error("Granite error: %s", exc)
        return f"[AI Unavailable] {exc}"


# ── Helper: build profile string ──────────────────────────────────────────────
def profile_summary(p: dict) -> str:
    return (
        f"Name: {p.get('name','User')}, Age: {p.get('age','?')}, "
        f"Gender: {p.get('gender','?')}, Height: {p.get('height','?')} cm, "
        f"Weight: {p.get('weight','?')} kg, Goal: {p.get('goal','General Fitness')}, "
        f"Activity Level: {p.get('activity','Moderate')}, "
        f"Dietary Preference: {p.get('diet','No preference')}, "
        f"Available Workout Time: {p.get('workout_time','30')} minutes/day."
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/health")
def health():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})


# ── 1. Workout Plan ───────────────────────────────────────────────────────────
@app.route("/api/workout", methods=["POST"])
def workout():
    data    = request.get_json(force=True)
    profile = data.get("profile", {})
    prompt  = f"""You are an expert certified personal trainer.
Create a detailed, structured weekly workout plan for the following person:
{profile_summary(profile)}

Include:
1. Weekly schedule (Monday–Sunday)
2. Warm-up routine (5–10 min)
3. Main workout (exercises, sets, reps, rest)
4. Cool-down & stretching (5 min)
5. Home and gym alternatives where applicable
6. Safety tips for their goal

Format clearly with headings and bullet points."""
    return jsonify({"result": ask_granite(prompt)})


# ── 2. Nutrition Plan ─────────────────────────────────────────────────────────
@app.route("/api/nutrition", methods=["POST"])
def nutrition():
    data    = request.get_json(force=True)
    profile = data.get("profile", {})
    prompt  = f"""You are a certified nutritionist and dietitian.
Create a detailed daily nutrition plan for:
{profile_summary(profile)}

Include:
1. Estimated daily caloric target (with calculation explanation)
2. Macronutrient breakdown (protein, carbs, fats in grams)
3. Breakfast options (3 choices)
4. Lunch options (3 choices)
5. Dinner options (3 choices)
6. Healthy snack ideas (3–4 options)
7. Daily water intake recommendation
8. Daily protein intake recommendation
9. Key supplements to consider (optional)
10. Foods to avoid based on their goal and diet preference

Format clearly with headings and bullet points."""
    return jsonify({"result": ask_granite(prompt)})


# ── 3. Daily Motivation ───────────────────────────────────────────────────────
@app.route("/api/motivation", methods=["POST"])
def motivation():
    data    = request.get_json(force=True)
    profile = data.get("profile", {})
    name    = profile.get("name", "Champion")
    goal    = profile.get("goal", "General Fitness")
    prompt  = f"""You are an elite fitness motivational coach.
Generate a personalized daily motivation package for {name} who is working toward: {goal}.

Include:
1. A powerful motivational quote (original, not cliché)
2. A specific fitness tip for today relevant to their goal
3. A daily healthy habit suggestion
4. A short motivational message (2–3 sentences) addressing them by name
5. One mindset shift tip for staying consistent

Keep the tone energetic, positive, and personal."""
    return jsonify({"result": ask_granite(prompt)})


# ── 4. BMI Calculator ─────────────────────────────────────────────────────────
@app.route("/api/bmi", methods=["POST"])
def bmi():
    data   = request.get_json(force=True)
    weight = float(data.get("weight", 70))
    height = float(data.get("height", 170)) / 100  # cm → m
    age    = int(data.get("age", 25))
    gender = data.get("gender", "Other")
    goal   = data.get("goal", "General Fitness")

    bmi_value = round(weight / (height ** 2), 1)

    if bmi_value < 18.5:
        category = "Underweight"
    elif bmi_value < 25:
        category = "Normal weight"
    elif bmi_value < 30:
        category = "Overweight"
    else:
        category = "Obese"

    # Recommended weight range for normal BMI (18.5–24.9)
    h2 = height ** 2
    min_w = round(18.5 * h2, 1)
    max_w = round(24.9 * h2, 1)

    prompt = f"""You are a certified health advisor.
A {age}-year-old {gender} has a BMI of {bmi_value} ({category}).
Their fitness goal is: {goal}.

Provide:
1. Interpretation of their BMI in plain language
2. Health risks associated with their current BMI category
3. Specific actionable health advice tailored to their goal
4. Recommended healthy weight range for their height
5. Three realistic first steps they can take this week

Keep the tone supportive, non-judgmental, and practical."""

    return jsonify({
        "bmi": bmi_value,
        "category": category,
        "min_weight": min_w,
        "max_weight": max_w,
        "advice": ask_granite(prompt),
    })


# ── 5. AI Chat ────────────────────────────────────────────────────────────────
@app.route("/api/chat", methods=["POST"])
def chat():
    data    = request.get_json(force=True)
    message = data.get("message", "")
    profile = data.get("profile", {})
    history = data.get("history", [])

    history_text = ""
    if history:
        history_text = "\n".join(
            f"{'User' if h['role']=='user' else 'Assistant'}: {h['content']}"
            for h in history[-6:]  # last 3 turns
        )
        history_text = f"\nConversation history:\n{history_text}\n"

    profile_text = profile_summary(profile) if profile else "No profile provided."

    prompt = f"""You are Fitness Buddy AI, a friendly and knowledgeable fitness and nutrition assistant powered by IBM Granite.
User profile: {profile_text}
{history_text}
User: {message}

Respond as a supportive fitness coach. Be specific, practical, and encouraging. 
If the user mentions a limitation (no gym, injury, no equipment), adapt your advice accordingly.
Keep responses concise but complete (under 250 words)."""

    return jsonify({"response": ask_granite(prompt)})


# ── 6. Habit Tracker Summary ──────────────────────────────────────────────────
@app.route("/api/habits/tip", methods=["POST"])
def habit_tip():
    data    = request.get_json(force=True)
    habits  = data.get("habits", {})
    profile = data.get("profile", {})

    completed = [k for k, v in habits.items() if v]
    missed    = [k for k, v in habits.items() if not v]

    prompt = f"""You are a wellness coach.
Based on today's habit tracking for {profile.get('name', 'the user')}:
- Completed habits: {', '.join(completed) if completed else 'None yet'}
- Pending habits: {', '.join(missed) if missed else 'All done!'}
- Fitness goal: {profile.get('goal', 'General Fitness')}

Provide:
1. A brief positive acknowledgment of what they completed
2. Gentle encouragement for what's pending
3. One specific tip to make tomorrow even better

Keep it short (3–4 sentences), warm, and motivating."""

    return jsonify({"tip": ask_granite(prompt)})


# ── 7. Dashboard Summary ──────────────────────────────────────────────────────
@app.route("/api/dashboard", methods=["POST"])
def dashboard():
    data    = request.get_json(force=True)
    profile = data.get("profile", {})
    habits  = data.get("habits", {})

    weight   = float(profile.get("weight", 70))
    height_m = float(profile.get("height", 170)) / 100
    bmi_val  = round(weight / (height_m ** 2), 1)

    age    = int(profile.get("age", 25))
    gender = profile.get("gender", "Other")
    weight_kg = weight

    # Harris-Benedict BMR
    if gender.lower() in ["male", "man"]:
        bmr = 88.362 + (13.397 * weight_kg) + (4.799 * height_m * 100) - (5.677 * age)
    else:
        bmr = 447.593 + (9.247 * weight_kg) + (3.098 * height_m * 100) - (4.330 * age)

    activity_map = {
        "Sedentary": 1.2, "Light": 1.375, "Moderate": 1.55,
        "Active": 1.725, "Very Active": 1.9,
    }
    activity_factor = activity_map.get(profile.get("activity", "Moderate"), 1.55)
    tdee = round(bmr * activity_factor)

    goal = profile.get("goal", "General Fitness")
    if "Loss" in goal:
        cal_target = tdee - 500
    elif "Gain" in goal or "Muscle" in goal:
        cal_target = tdee + 300
    else:
        cal_target = tdee

    water_ml = round(weight_kg * 35)
    protein_g = round(weight_kg * 1.6 if "Muscle" in goal else weight_kg * 1.2)

    habits_done  = sum(1 for v in habits.values() if v)
    habits_total = len(habits) if habits else 4
    progress_pct = round((habits_done / habits_total) * 100) if habits_total else 0

    return jsonify({
        "bmi": bmi_val,
        "calories_target": cal_target,
        "tdee": tdee,
        "water_ml": water_ml,
        "protein_g": protein_g,
        "habits_done": habits_done,
        "habits_total": habits_total,
        "progress_pct": progress_pct,
        "date": datetime.now().strftime("%A, %B %d %Y"),
    })


# ── Entry Point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
