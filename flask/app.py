from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/ml/predict", methods=["GET"])
def predict():
    return jsonify({"message": "ML Model Prediction Placeholder"})

from flask import Flask, request, jsonify
from transformers import pipeline
import numpy as np
import pandas as pd

app = Flask(__name__)

# Load LLM-based insight generator
insight_generator = pipeline("text-generation", model="facebook/opt-1.3b")

# Simulated AI function for fraud detection & insights
def generate_insights(expense_data):
    df = pd.DataFrame(expense_data)
    
    # Detect anomalies (simple statistical outliers for now)
    threshold = df['amount'].mean() + 2 * df['amount'].std()
    flagged_expenses = df[df['amount'] > threshold]
    
    # Generate insights using LLM
    summary_prompt = f"Analyze company expenses: {df[['category', 'amount']].to_dict()}"
    insight_text = insight_generator(summary_prompt, max_length=100, do_sample=True)[0]['generated_text']
    
    return {
        "flagged_expenses": flagged_expenses.to_dict(orient='records'),
        "ai_insights": insight_text
    }

@app.route("/generate-insights", methods=["POST"])
def generate_audit_report():
    expense_data = request.json.get("expenses", [])
    if not expense_data:
        return jsonify({"error": "No expense data provided"}), 400
    
    insights = generate_insights(expense_data)
    return jsonify(insights)


if __name__ == "__main__":
    app.run(port=5001, debug=True)