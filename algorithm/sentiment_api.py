from flask import Flask, request, jsonify
import re, math
from collections import defaultdict

app = Flask(__name__)

# === Load your trained word_counts, class_counts, total_words from your notebook ===
# For brevity, assume they are already available:
# word_counts = {0: defaultdict(int), 1: defaultdict(int)}
# class_counts = {0: int, 1: int}
# total_words = {0: int, 1: int}
# vocabulary = set(...)  # optional for smoothing

def clean_text(text):
    return re.sub(r'[^a-zA-Z]', ' ', text).lower().split()

def predict_sentiment(text):
    words = clean_text(text)
    classes = [0,1]
    class_probs = {}
    total_docs = sum(class_counts.values())
    vocab_size = sum(total_words.values())  # or len(vocabulary)
    for c in classes:
        # Prior
        log_prob = math.log(class_counts[c] / total_docs)
        for w in words:
            word_count = word_counts[c][w]
            # Laplace smoothing
            log_prob += math.log((word_count + 1) / (total_words[c] + vocab_size))
        class_probs[c] = log_prob
    # pick class with highest probability
    sentiment = max(class_probs, key=class_probs.get)
    return sentiment

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get('text', '')
    sentiment = predict_sentiment(text)
    label = 'positive' if sentiment == 1 else 'negative'
    return jsonify({'label': label, 'score': 1 if sentiment == 1 else -1})

if __name__ == '__main__':
    app.run(port=5000)
