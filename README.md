# Predict the Pitch

A high-performance football prediction engine utilizing Extreme Gradient Boosting to calculate Expected Goals (xG) and match probabilities across European competitions.

* [Live Application](https://predict-the-pitch.vercel.app/)
* [Model Training & Data Pipeline (Google Colab)](https://colab.research.google.com/drive/196y-nJi2nGKwuWfoKYxCHYP_WlZRwnEq?usp=sharing)

## Project Overview

Predicting football matches is inherently chaotic. This project solves the problem of conflicting statistical models by deploying a hierarchical machine learning system that understands team form, goal difference, and win rates, rather than relying on static team names. 

The engine specifically supports complex tournament structures, seamlessly handling formats like two-legged Champions League ties and neutral-venue finals.

## Machine Learning Architecture

The system relies on a dual-model approach to generate robust, logically consistent predictions.

### Expected Goals (xG) Engine
The first layer consists of two independent XGBoost Regressors. These models are trained specifically to calculate the exact number of goals the home and away teams are mathematically expected to score based on historical offensive and defensive power.

### Probability Engine
The second layer acts as a reality check. A separate XGBoost Classifier ignores the scorelines entirely and focuses strictly on calculating the precise percentage chance of a Home Win, a Draw, or an Away Win.

### Hierarchy Enforcement Algorithm
In statistical modeling, regressors and classifiers occasionally disagree. If the Regressors predict a 1-1 draw based on expected goals, but the Classifier highly favors the away team with a 60 percent win probability, a custom Python algorithm intervenes. The system treats the Classifier as the ultimate authority, forcing the final goal prediction to logically align with the highest probability outcome. This ensures that every prediction presented to the user is mathematically sound.

### Accuracy
Through rigorous backtesting on hidden data, this XGBoost architecture consistently achieves a Win/Draw/Loss accuracy of over 55.55 percent. This places the engine squarely in the same performance tier as professional sports analytics and sports betting models.

## The Tech Stack

* Frontend: React, Tailwind CSS, Vercel
* Backend API: FastAPI, Uvicorn, Python
* Machine Learning: XGBoost, Pandas, Scikit-learn, Numpy

## Installation and Local Setup

To run Predict the Pitch locally, you will need to start both the Python backend and the React frontend.

1. Clone the repository and navigate into the project folder:
```bash
git clone https://github.com/yourusername/predict-the-pitch.git
cd predict-the-pitch
```

2. Start the Backend API:
Navigate into the API directory, install dependencies, and run the server.
```bash
cd api_FOR_ai_match_predictor
pip install -r requirements.txt
uvicorn main:app --reload
```
The FastAPI backend will now be running on `http://localhost:8000`.

3. Start the Frontend Client:
Open a new terminal window, return to the project root, install Node dependencies, and start React.
```bash
cd predict-the-pitch
npm install
npm run dev
```
The application will now be running on `http://localhost:5173`.

## System Architecture (v3)

The diagram below illustrates the full data flow from external APIs through the prediction engine to the authenticated user's browser.

```mermaid
flowchart LR
    subgraph External["External APIs"]
        FD["⚽ football-data.org\nUCL Fixture Schedule"]
        OAI["🤖 OpenAI GPT-4o-mini\nNarrative Generation\n(optional)"]
    end

    subgraph Auth["Supabase Auth & DB"]
        SUPA_AUTH["Auth Service\nEmail/Password JWT"]
        SUPA_DB[("PostgreSQL\nsimulations table")]
    end

    subgraph Middleware["Node.js Middleware\nserver/ · port 3001"]
        FC["fixturesController.js\nLive schedule + normalisation"]
        SC["simulateController.js\nTeam validation · ML routing\nLLM narrative · DB save"]
        AUTH_MW["requireAuth.js\nJWT verification"]
    end

    subgraph Python["Python ML API\nFastAPI · HuggingFace / local :8000"]
        XGB["XGBoost Models\n• home_model.json\n• away_model.json\n• outcome_model.json"]
        EXP["Feature Importance\nExplainability Engine"]
    end

    subgraph Frontend["React Frontend\nVite + Tailwind v4 · :5173"]
        AUTH_UI["AuthModal / AuthButton\nSupabase Auth Client"]
        HOOK["useBracketPredictions\nLive → Static fallback"]
        MODAL["PredictionModal\n• ConfidenceMeter · TeamStatRadar\n• ExplainabilityPanel"]
        SANDBOX["SimulatePage\n• TeamSelector (194 teams)\n• SimulationResult\n• NarrativeCard (typewriter)"]
    end

    subgraph Deploy["Vercel"]
        CDN["predict-the-pitch.vercel.app"]
    end

    %% Auth flow
    AUTH_UI -->|"email + password"| SUPA_AUTH
    SUPA_AUTH -->|"JWT"| AUTH_UI
    AUTH_UI -->|"Bearer JWT"| AUTH_MW

    %% Fixtures flow
    FD -->|"GET /v4/competitions/CL/matches"| FC
    FC -->|"POST /predict_two_leg\nPOST /predict_neutral"| XGB

    %% Simulation flow
    SANDBOX -->|"POST /api/simulate + JWT"| AUTH_MW
    AUTH_MW --> SC
    SC -->|"POST /predict_single"| XGB
    XGB --> EXP
    SC -->|"prompt + ML stats"| OAI
    OAI -->|"narrative text"| SC
    SC -->|"{ prediction + narrative }"| SANDBOX
    SC -->|"save result"| SUPA_DB

    %% Bracket flow
    EXP -->|"{ predictions + explanations }"| HOOK
    HOOK --> MODAL

    %% Deploy
    Frontend -->|"deploy"| CDN

    style External fill:#0f172a,stroke:#334155,color:#94a3b8
    style Auth fill:#0c1a0c,stroke:#16a34a,color:#86efac
    style Middleware fill:#1e1b4b,stroke:#4338ca,color:#a5b4fc
    style Python fill:#064e3b,stroke:#059669,color:#6ee7b7
    style Frontend fill:#0c1a2e,stroke:#0284c7,color:#7dd3fc
    style Deploy fill:#0c0a09,stroke:#d97706,color:#fbbf24
```

### Data Flow Summary (v3)

| Step | Source → Destination | Protocol | Auth Required |
|------|---------------------|----------|---------------|
| 1 | User → Supabase Auth | HTTPS / JWT | — |
| 2 | football-data.org → Node.js Middleware | REST GET | No |
| 3 | Node.js Middleware → Python FastAPI | REST POST | No |
| 4 | Frontend → `/api/simulate` | REST POST + JWT | Yes (when configured) |
| 5 | Node.js → OpenAI GPT-4o-mini | REST POST | API Key |
| 6 | Node.js → Supabase DB | PostgreSQL | Service Role |
| 7 | React Frontend → Vercel CDN | Static deploy | — |
