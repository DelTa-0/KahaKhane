import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib

# === Load your reviews dataset ===
df = pd.read_csv("yelp_reviews.csv")  # Rating, ReviewText

# Label mapping: 4–5 = positive (1), 1–2 = negative (0), drop 3
df["label"] = df["Rating"].apply(lambda r: 1 if r >= 4 else 0 if r <= 2 else None)
df = df.dropna(subset=["label"])

X = df["ReviewText"].astype(str)
y = df["label"]

# === Train/test split ===
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# === Pipeline: TF-IDF + Logistic Regression ===
pipe = Pipeline([
    ("tfidf", TfidfVectorizer(
        ngram_range=(1,2),     # unigrams + bigrams
        min_df=2, max_df=0.95,
        lowercase=True,
        token_pattern=r"[A-Za-z0-9]+"
    )),
    ("clf", LogisticRegression(
        max_iter=2000,
        class_weight="balanced",
        solver="liblinear"
    ))
])

# === Train ===
pipe.fit(X_train, y_train)

# === Evaluate ===
print(classification_report(y_test, pipe.predict(X_test)))

# === Save model ===
joblib.dump(pipe, "sentiment_model.joblib")
print("✅ Model saved as sentiment_model.joblib")
