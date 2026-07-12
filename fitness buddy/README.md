# ⚡ Fitness Buddy AI

> **Your AI-powered personal fitness coach — Built with IBM Granite AI and IBM watsonx.ai**

![Fitness Buddy AI Banner](assets/images/banner.png)

[![IBM Granite](https://img.shields.io/badge/IBM-Granite%20AI-054ADA?style=for-the-badge&logo=ibm)](https://www.ibm.com/watsonx)
[![watsonx.ai](https://img.shields.io/badge/IBM-watsonx.ai-054ADA?style=for-the-badge&logo=ibm)](https://www.ibm.com/watsonx)
[![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=for-the-badge&logo=python)](https://flask.palletsprojects.com)
[![Render Ready](https://img.shields.io/badge/Render-Deploy%20Ready-46E3B7?style=for-the-badge&logo=render)](https://render.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 📖 Project Overview

**Fitness Buddy AI** is a complete, production-ready AI-powered web application that solves the modern fitness challenge: most people lack personalized guidance, consistent motivation, smart nutrition planning, and access to professional fitness coaching.

Fitness Buddy AI bridges this gap by acting as a **virtual personal trainer and nutritionist** — available 24/7, personalized to each user's unique profile, and powered by **IBM Granite** through **IBM watsonx.ai** on IBM Cloud Lite.

**Problem Solved:**
- ❌ No more generic, one-size-fits-all workout plans
- ❌ No more confusing, impersonalized nutrition advice  
- ❌ No more lost motivation with nobody to guide you
- ❌ No more expensive personal trainers for basic guidance

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Landing Page** | Glassmorphism hero with animated fitness illustration, dark/light mode |
| 👤 **User Profile** | 9-field profile (name, age, gender, height, weight, goal, activity, diet, workout time) |
| 🏋️ **AI Workout Plan** | Full weekly workout schedule with warm-up, main workout, cool-down, home/gym options |
| 🥗 **Nutrition Assistant** | Breakfast, lunch, dinner, snacks, macros, water/protein intake — personalized |
| 🌟 **Daily Motivation** | AI-generated motivational quote, fitness tip, habit suggestion, mindset shift |
| ✅ **Habit Tracker** | Mark workout, water, sleep, meal habits with animated progress ring |
| ⚖️ **BMI Calculator** | BMI calculation with animated gauge, category, health advice, recommended range |
| 💬 **AI Chat Coach** | Full conversational fitness assistant with conversation history and quick suggestions |
| 📊 **Dashboard** | Real-time BMI, calorie target, water intake, protein, progress, goal overview |
| 🌙 **Dark / Light Mode** | Persistent theme switching with smooth transitions |
| 📱 **Responsive Design** | Pixel-perfect on desktop, tablet, and mobile |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 | Semantic markup, accessibility |
| CSS3 | Glassmorphism, animations, responsive grid |
| Vanilla JavaScript (ES6+) | All interactivity, API calls, state management |
| Google Fonts (Inter + Space Grotesk) | Premium typography |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.9+ | Runtime |
| Flask 3.x | Web framework, REST API |
| Flask-CORS | Cross-origin resource sharing |
| python-dotenv | Environment variable management |
| Gunicorn | Production WSGI server |

### AI / IBM Cloud
| Technology | Purpose |
|---|---|
| IBM Granite 13B Instruct v2 | Core language model for all AI features |
| IBM watsonx.ai | Model inference platform |
| IBM Cloud Lite | Free-tier IBM Cloud services |
| IBM IAM Authentication | Secure API key authentication |

### Deployment
| Platform | Purpose |
|---|---|
| GitHub | Source control, CI/CD |
| Render | Free production deployment |

---

## 📸 Screenshots

> Add screenshots to `assets/images/` and reference them here.

| Landing Page | Dashboard |
|---|---|
| ![Landing](assets/images/screenshot-landing.png) | ![Dashboard](assets/images/screenshot-dashboard.png) |

| AI Chat | BMI Calculator |
|---|---|
| ![Chat](assets/images/screenshot-chat.png) | ![BMI](assets/images/screenshot-bmi.png) |

---

## 🔧 IBM Cloud Setup

### Step 1: Create IBM Cloud Account
1. Go to [https://cloud.ibm.com/registration](https://cloud.ibm.com/registration)
2. Sign up for a **free Lite account** (no credit card required)
3. Verify your email address

### Step 2: Get IBM Cloud API Key
1. Log in to [https://cloud.ibm.com](https://cloud.ibm.com)
2. Click your **profile icon** (top right) → **"IBM Cloud API keys"**
3. Click **"Create an IBM Cloud API key"**
4. Give it a name like `fitness-buddy-ai-key`
5. **Copy and save the key** (shown only once!)

### Step 3: Create watsonx.ai Project
1. Go to [https://dataplatform.cloud.ibm.com](https://dataplatform.cloud.ibm.com)
2. Click **"New project"** → **"Create an empty project"**
3. Enter a project name (e.g., `fitness-buddy-ai`)
4. Click **"Create"**
5. Go to project **Settings** → **General**
6. Copy your **Project ID**

### Step 4: Verify IBM Granite Access
1. In your watsonx.ai project, go to **"Assets"** → **"New asset"** → **"Work with models"**
2. Search for **"Granite"** — you should see `ibm/granite-13b-instruct-v2`
3. If not available on Lite tier, use `ibm/granite-3b-code-instruct`

---

## 🤖 IBM Granite Integration

The application uses IBM Granite through the `ibm-watsonx-ai` Python SDK:

```python
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference

credentials = Credentials(
    api_key=IBM_API_KEY,
    url="https://us-south.ml.cloud.ibm.com"
)

model = ModelInference(
    model_id="ibm/granite-13b-instruct-v2",
    credentials=credentials,
    project_id=IBM_PROJECT_ID,
    params={
        "max_new_tokens": 900,
        "temperature": 0.7,
        "top_p": 0.9,
    }
)

response = model.generate_text(prompt="Your prompt here")
```

### API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `GET /` | GET | Serve the frontend |
| `GET /health` | GET | Health check |
| `POST /api/workout` | POST | Generate workout plan |
| `POST /api/nutrition` | POST | Generate nutrition plan |
| `POST /api/motivation` | POST | Generate daily motivation |
| `POST /api/bmi` | POST | Calculate BMI + AI advice |
| `POST /api/chat` | POST | AI chat response |
| `POST /api/habits/tip` | POST | Habit tracker AI tip |
| `POST /api/dashboard` | POST | Dashboard metrics |

---

## 🚀 Installation Guide (Local)

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)
- Git
- IBM Cloud account with watsonx.ai access

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/fitness-buddy-ai.git
cd fitness-buddy-ai

### Step 2: Create Virtual Environment
```bash
# Create
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual IBM Cloud credentials
```

Open `.env` and fill in:
```env
IBM_API_KEY=your_actual_ibm_api_key_here
IBM_PROJECT_ID=your_actual_project_id_here
IBM_URL=https://us-south.ml.cloud.ibm.com
GRANITE_MODEL=ibm/granite-13b-instruct-v2
```

### Step 5: Run the Application
```bash
python app.py
```

Open your browser at **http://localhost:5000**

---

## ☁️ Render Deployment Guide

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Fitness Buddy AI"
git remote add origin https://github.com/YOUR_USERNAME/fitness-buddy-ai.git
git push -u origin main
```

> **Important:** Make sure `.env` is in your `.gitignore` — never push real credentials!

### Step 2: Create Render Account
1. Go to [https://render.com](https://render.com)
2. Sign up with your GitHub account

### Step 3: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `fitness-buddy-ai` |
| **Environment** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app --bind 0.0.0.0:$PORT` |
| **Instance Type** | Free |

### Step 4: Add Environment Variables
In Render → Your Service → **"Environment"** tab, add:

| Key | Value |
|---|---|
| `IBM_API_KEY` | Your IBM Cloud API key |
| `IBM_PROJECT_ID` | Your watsonx.ai Project ID |
| `IBM_URL` | `https://us-south.ml.cloud.ibm.com` |
| `GRANITE_MODEL` | `ibm/granite-13b-instruct-v2` |

### Step 5: Deploy
Click **"Create Web Service"** — Render will automatically build and deploy.

Your app will be live at: `https://fitness-buddy-ai.onrender.com`

---

## 📁 Project Structure

```
fitness-buddy-ai/
│
├── app.py              # Flask backend + IBM Granite API routes
├── index.html          # Complete frontend (all sections)
├── style.css           # Glassmorphism CSS, dark/light mode, responsive
├── script.js           # All JavaScript logic and API integration
├── config.js           # Frontend configuration (safe to commit)
│
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variable template
├── .gitignore          # Git ignore rules
├── README.md           # This file
│
└── assets/
    ├── images/         # Screenshots, banners
    └── icons/          # App icons
```

---

## 🔒 Security Best Practices

- ✅ API keys are **never hardcoded** — always loaded from environment variables
- ✅ `.env` file is gitignored — never committed
- ✅ IBM IAM token-based authentication used
- ✅ Flask-CORS properly configured
- ✅ Input validation on all API endpoints
- ✅ Error handling prevents credential leakage in responses

---

## 🔮 Future Scope

| Feature | Description |
|---|---|
| 🗄️ **Database Integration** | PostgreSQL for user accounts and persistent data |
| 🔐 **User Authentication** | JWT-based login/signup system |
| 📈 **Progress Tracking** | Weight, strength, and body measurement graphs over time |
| 📱 **PWA Support** | Installable as a mobile app with offline support |
| 🎥 **Exercise Video Library** | Embedded exercise demonstration videos |
| 🍎 **Food Scanner** | Camera-based calorie tracking using ML |
| ⌚ **Wearable Integration** | Sync with Fitbit, Apple Watch, Garmin |
| 👥 **Community Features** | Challenges, leaderboards, buddy system |
| 🌍 **Multi-language** | Internationalization support |
| 📧 **Email Reports** | Weekly progress reports via SendGrid |
| 🤖 **Voice Interface** | Voice commands using IBM Watson Speech-to-Text |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- **IBM Granite** — For the powerful and accessible AI model
- **IBM watsonx.ai** — For the enterprise-grade AI platform
- **IBM Cloud Lite** — For free-tier cloud services
- **Flask** — For the elegant Python web framework
- **Render** — For the free deployment platform

---

<div align="center">
  <strong>⚡ Built with IBM Granite AI × IBM watsonx.ai</strong><br/>
  <em>Your health journey, powered by enterprise AI — available to everyone.</em>
</div>
