import pandas as pd
import re
import random
from collections import defaultdict
import math

# STEP 1: Load Data from your 'Restaurant_Reviews.tsv' file
df = pd.read_csv('Restaurant_Reviews.tsv', sep='\t')

# STEP 2: Clean the text
def clean_text(text):
    text = re.sub(r'[^a-zA-Z]', ' ', text).lower().split()
    return text

df['Cleaned'] = df['Review'].apply(clean_text)

# STEP 3: Split data into train and test (80/20)
data = list(zip(df['Cleaned'], df['Liked']))  # Liked is the label (1 = positive, 0 = negative)
random.seed(42)
random.shuffle(data)

split_idx = int(0.8 * len(data))
train_data = data[:split_idx]
test_data = data[split_idx:]

# STEP 4: Training - Count words and classes
word_counts = {
    0: defaultdict(int),  # Negative
    1: defaultdict(int),  # Positive
}
class_counts = {0: 0, 1: 0}
total_words = {0: 0, 1: 0}

for words, label in train_data:
    class_counts[label] += 1
    for word in words:
        word_counts[label][word] += 1
        total_words[label] += 1

# STEP 5: Vocabulary
vocab = set(word for label in word_counts for word in word_counts[label])
vocab_size = len(vocab)

# STEP 6: Prediction function using Naive Bayes
def predict_naive_bayes(words):
    scores = {}
    total_docs = sum(class_counts.values())
    for label in [0, 1]:
        log_prob = math.log(class_counts[label] / total_docs)
        for word in words:
            word_freq = word_counts[label][word] + 1  # Laplace smoothing
            word_prob = word_freq / (total_words[label] + vocab_size)
            log_prob += math.log(word_prob)
        scores[label] = log_prob
    return 1 if scores[1] > scores[0] else 0

# STEP 7: Evaluate on test data
correct = 0
for words, true_label in test_data:
    pred = predict_naive_bayes(words)
    if pred == true_label:
        correct += 1

accuracy = correct / len(test_data)
print(f"Accuracy: {accuracy:.2f}")
