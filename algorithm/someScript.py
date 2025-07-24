import pickle
import json

# Load the pickle file
with open('model_params.pkl', 'rb') as f:
    model_params = pickle.load(f)

# Convert the model to a JSON-friendly format
model_params_dict = {
    "word_counts": {
        "0": dict(model_params[0][0]),  # Negative word counts
        "1": dict(model_params[0][1]),  # Positive word counts
    },
    "class_counts": model_params[1],
    "total_words": model_params[2],
    "vocab_size": model_params[3]
}

# Save as JSON
with open('model_params.json', 'w') as f:
    json.dump(model_params_dict, f)

print("✅ Model parameters saved to model_params.json")
