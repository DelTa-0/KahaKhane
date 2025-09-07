from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

# Load your trained model
model = joblib.load("sentiment_model.joblib")

class Texts(BaseModel):
    texts: list[str]

@app.post("/predict_batch")
def predict_batch(payload: Texts):
    texts = payload.texts
    if not texts:
        return {"positive": []}

    probs = model.predict_proba(texts)[:, 1]  # probability of positive
    return {"positive": probs.tolist()}
