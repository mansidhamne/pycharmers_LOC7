from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from tamper import detect_tampering
from datetime import datetime
from ocr import ocr_main
from chat import *
import requests
import google.generativeai as genai

app = Flask(__name__)
CORS(app)  # Allow frontend to communicate with backend

ACCESS_TOKEN = "kbOQu2mx2R689ucldB48CyiygnCx"
GEMINI_API_KEY_2 = "AIzaSyBICHgplwdgfcYVWIFUFLJtcXHXI9dfKpM"

genai.configure(api_key=GEMINI_API_KEY_2)

UPLOAD_FOLDER = "uploads"
UPLOAD_FOLDER_2 = "uploads_ocr"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    files = request.files.getlist('file')  # Get multiple files

    if not files or all(file.filename == '' for file in files):
        return jsonify({"error": "No selected file"}), 400

    saved_files = []
    for file in files:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file_path_2 = os.path.join(UPLOAD_FOLDER_2, file.filename)
        file.save(file_path)
        file.save(file_path_2)
        saved_files.append(file.filename)

    return jsonify({"message": "Files uploaded successfully!", "filenames": saved_files})

STATUSES = ["Pending", "Flagged", "Approved", "Rejected"]

def get_mock_bills():
    bill_files = os.listdir(UPLOAD_FOLDER)
    bills = []
    
    for index, filename in enumerate(bill_files):
        bills.append({
            "id": str(index + 1),
            "filename": filename,
            "status": STATUSES[0],  # Random status for now
            "description": request.form.get('description', ''),  # Mock description
            "date": datetime.now().strftime("%Y-%m-%d")
        })
    
    return bills

@app.route('/bills', methods=['GET'])
def get_bills():
    return jsonify(get_mock_bills())

@app.route('/detect_tampering', methods=['POST'])
def detect_tampering_main():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    # Detect tampering
    tampered = detect_tampering(file_path)
    if tampered:
        return jsonify({"tampered": True})
    else:
        return jsonify({"tampered": False})
    
@app.route('/get_ocr', methods=['POST'])
def get_ocr_main():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    user_id = "EMP099"  # Mock user ID
    # Perform OCR on the saved file
    ocr_folder = ocr_main()
    text = ""
    # with open("./output_reports/EMP099/extracted_text_page.txt", 'r') as f:
    #     text+= f.read() + "\n"

    for txt_file in os.listdir(f"./output_reports/{user_id}"):
        if txt_file.endswith(".txt"):
            with open(os.path.join(f"./output_reports/{user_id}", txt_file), 'r') as f:
                text += f.read() + "\n"

    return jsonify({"text": text})

@app.route("/ask", methods=["POST"])
def ask_question():
    data = request.get_json()
    question = data.get("question")
    context = process_contest("./uploads_policy/policy.md")
    print(context)
    #context = data.get("context")

    if not question or not context:
        return jsonify({"error": "Question or context missing"}), 400

    result = nlp({"question": question, "context": context})
    return jsonify({"answer": result["answer"]})

CITIES = {
    "United Kingdom - London": "LON",
    "France - Paris": "PAR",
    "Germany - Berlin": "BER",
    "Spain - Madrid": "MAD",
    "Italy - Rome": "ROM",
    "Netherlands - Amsterdam": "AMS",
    "Switzerland - Zurich": "ZRH",
    "Belgium - Brussels": "BRU",
    "Portugal - Lisbon": "LIS",
    "Austria - Vienna": "VIE",
}

def get_hotel_offers(city_code, ratings):
    """Fetch hotel offers using Amadeus API."""
    url = "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city"
    
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    
    params = {
        "cityCode": city_code,
        "ratings": ratings  # Example: "3,4,5"
    }
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to fetch hotel offers"}

def process_hotel_data(hotel_data):
    """Extract structured hotel data using Gemini API."""
    prompt = f"""
    Based on rating and location, assign a price and extract the cheapest 5 hotels.
    Data: {hotel_data}

    Required output:
    - Hotel Name
    - City
    - Rating
    - Price (INR)
    - Comment (e.g., 'Budget-friendly, close to airport')
    """
    
    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content(prompt)
    
    return response.text  # Assuming this returns JSON-like data

@app.route("/get-hotels", methods=["GET"])
def get_hotels():
    city = request.args.get("city")
    ratings = request.args.get("ratings")

    hotel_offers = get_hotel_offers(city, ratings)
    
    if "error" in hotel_offers:
        return jsonify({"error": hotel_offers["error"]})

    structured_data = process_hotel_data(hotel_offers)
    return jsonify({"hotels": structured_data})


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3002, debug=True)
