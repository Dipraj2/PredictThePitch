from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from xgboost import XGBClassifier, XGBRegressor
import joblib
import pandas as pd
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

outcome_model = XGBClassifier()
outcome_model.load_model('outcome_model.json')
home_model = XGBRegressor()
home_model.load_model('home_model.json')
away_model = XGBRegressor()
away_model.load_model('away_model.json')
team_stats = joblib.load('team_stats.joblib')
teams_df = pd.read_csv('teams_df.csv', index_col='name')

class MatchRequest(BaseModel):
    team_a: str
    team_b: str

def get_raw_prediction(home_team, away_team):
    home_matches = teams_df[teams_df.index.str.contains(home_team, case=False, na=False)]
    away_matches = teams_df[teams_df.index.str.contains(away_team, case=False, na=False)]
    
    if home_matches.empty or away_matches.empty:
        return None
        
    home_id = int(home_matches['id'].iloc[0])
    away_id = int(away_matches['id'].iloc[0])
    
    h_stats = team_stats.get(home_id, {'avg_scored': 1.0, 'avg_conceded': 1.0, 'goal_diff': 0.0, 'win_rate': 0.33})
    a_stats = team_stats.get(away_id, {'avg_scored': 1.0, 'avg_conceded': 1.0, 'goal_diff': 0.0, 'win_rate': 0.33})

    match_stats = pd.DataFrame({
        'home_team_id': [home_id], 'away_team_id': [away_id],
        'home_avg_scored': [h_stats['avg_scored']], 'home_avg_conceded': [h_stats['avg_conceded']],
        'home_goal_diff': [h_stats['goal_diff']], 'home_win_rate': [h_stats['win_rate']],
        'away_avg_scored': [a_stats['avg_scored']], 'away_avg_conceded': [a_stats['avg_conceded']],
        'away_goal_diff': [a_stats['goal_diff']], 'away_win_rate': [a_stats['win_rate']]
    })
    
    home_xg = float(home_model.predict(match_stats)[0])
    away_xg = float(away_model.predict(match_stats)[0])
    probs = outcome_model.predict_proba(match_stats)[0]
    
    return {
        "home_xg": home_xg, "away_xg": away_xg,
        "away_prob": float(probs[0] * 100), "draw_prob": float(probs[1] * 100), "home_prob": float(probs[2] * 100)
    }

def enforce_hierarchy(home_xg, away_xg, home_prob, draw_prob, away_prob):
    h_goals = int(round(home_xg))
    a_goals = int(round(away_xg))
    
    if home_prob > away_prob and home_prob > draw_prob:
        if h_goals <= a_goals: h_goals = a_goals + 1
    elif away_prob > home_prob and away_prob > draw_prob:
        if a_goals <= h_goals: a_goals = h_goals + 1
    else:
        if h_goals != a_goals:
            avg = (h_goals + a_goals) // 2
            h_goals, a_goals = avg, avg
            
    return h_goals, a_goals

@app.post("/predict_single")
def predict_single(req: MatchRequest):
    raw = get_raw_prediction(req.team_a, req.team_b)
    if not raw: return {"error": "Team not found"}
    h_goals, a_goals = enforce_hierarchy(raw['home_xg'], raw['away_xg'], raw['home_prob'], raw['draw_prob'], raw['away_prob'])
    
    confidence = max(raw['home_prob'], raw['draw_prob'], raw['away_prob'])
    
    return {
        "home_team": req.team_a, "away_team": req.team_b, 
        "home_goals": h_goals, "away_goals": a_goals, 
        "home_xg": round(raw['home_xg'], 2), "away_xg": round(raw['away_xg'], 2),
        "home_win_prob": raw['home_prob'], "draw_prob": raw['draw_prob'], "away_win_prob": raw['away_prob'],
        "confidence": round(confidence, 1)
    }

@app.post("/predict_two_leg")
def predict_two_leg(req: MatchRequest):
    leg1 = get_raw_prediction(req.team_a, req.team_b)
    leg2 = get_raw_prediction(req.team_b, req.team_a)
    if not leg1 or not leg2: return {"error": "Team not found"}
    
    l1_h, l1_a = enforce_hierarchy(leg1['home_xg'], leg1['away_xg'], leg1['home_prob'], leg1['draw_prob'], leg1['away_prob'])
    l2_h, l2_a = enforce_hierarchy(leg2['home_xg'], leg2['away_xg'], leg2['home_prob'], leg2['draw_prob'], leg2['away_prob'])
    
    agg_a = l1_h + l2_a
    agg_b = l1_a + l2_h
    
    winner = req.team_a if agg_a > agg_b else req.team_b
    penalties = False
    
    avg_a_prob = (leg1['home_prob'] + leg2['away_prob']) / 2
    avg_b_prob = (leg1['away_prob'] + leg2['home_prob']) / 2
    
    if agg_a == agg_b:
        penalties = True
        winner = req.team_a if avg_a_prob > avg_b_prob else req.team_b

    confidence = (max(leg1['home_prob'], leg1['draw_prob'], leg1['away_prob']) + max(leg2['home_prob'], leg2['draw_prob'], leg2['away_prob'])) / 2

    return {
        "team_a": req.team_a, "team_b": req.team_b,
        "leg1_score": f"{l1_h}-{l1_a}", "leg2_score": f"{l2_a}-{l2_h}",
        "leg1_team_a_xg": round(leg1['home_xg'], 2), "leg1_team_b_xg": round(leg1['away_xg'], 2),
        "leg2_team_a_xg": round(leg2['away_xg'], 2), "leg2_team_b_xg": round(leg2['home_xg'], 2),
        "aggregate": f"{agg_a}-{agg_b}",
        "advancing_team": winner,
        "won_on_penalties": penalties,
        "confidence": round(confidence, 1)
    }

@app.post("/predict_neutral")
def predict_neutral(req: MatchRequest):
    sim1 = get_raw_prediction(req.team_a, req.team_b)
    sim2 = get_raw_prediction(req.team_b, req.team_a)
    if not sim1 or not sim2: return {"error": "Team not found"}
    
    avg_a_xg = (sim1['home_xg'] + sim2['away_xg']) / 2
    avg_b_xg = (sim1['away_xg'] + sim2['home_xg']) / 2
    avg_a_prob = (sim1['home_prob'] + sim2['away_prob']) / 2
    avg_b_prob = (sim1['away_prob'] + sim2['home_prob']) / 2
    avg_draw_prob = (sim1['draw_prob'] + sim2['draw_prob']) / 2
    
    goals_a, goals_b = enforce_hierarchy(avg_a_xg, avg_b_xg, avg_a_prob, avg_draw_prob, avg_b_prob)
    
    winner = req.team_a if goals_a > goals_b else req.team_b
    penalties = False
    if goals_a == goals_b:
        penalties = True
        winner = req.team_a if avg_a_prob > avg_b_prob else req.team_b

    confidence = max(avg_a_prob, avg_draw_prob, avg_b_prob)

    return {
        "team_a": req.team_a, "team_b": req.team_b,
        "team_a_goals": goals_a, "team_b_goals": goals_b,
        "team_a_xg": round(avg_a_xg, 2), "team_b_xg": round(avg_b_xg, 2),
        "team_a_win_prob": avg_a_prob, "draw_prob": avg_draw_prob, "team_b_win_prob": avg_b_prob,
        "champion": winner,
        "won_on_penalties": penalties,
        "confidence": round(confidence, 1)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)