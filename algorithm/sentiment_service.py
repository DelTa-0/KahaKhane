# sentiment_service.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import joblib

app = FastAPI()

# Load your joblib pipeline (TF-IDF + LogisticRegression saved as joblib)
# Make sure sentiment_model.joblib is in the same directory or provide full path
pipe = joblib.load("sentiment_model.joblib")

class PredictReq(BaseModel):
    text: str

class BatchReq(BaseModel):
    texts: List[str]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(req: PredictReq):
    proba = pipe.predict_proba([req.text])[0]
    return {"negative": float(proba[0]), "positive": float(proba[1]), "label": int(proba[1] >= 0.5)}

@app.post("/predict_batch")
def predict_batch(req: BatchReq):
    texts = req.texts or []
    if len(texts) == 0:
        return {"positive": []}
    probs = pipe.predict_proba(texts)
    positives = [float(p[1]) for p in probs]
    return {"positive": positives}
