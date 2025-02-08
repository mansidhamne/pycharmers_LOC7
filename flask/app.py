from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/ml/predict", methods=["GET"])
def predict():
    return jsonify({"message": "ML Model Prediction Placeholder"})

if __name__ == "__main__":
    app.run(port=5001, debug=True)