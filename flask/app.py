from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from tamper import detect_tampering
from datetime import datetime
from ocr import ocr_main
from chat import *
import requests
import google.generativeai as genai
import dotenv
# from phase1 import combined

app = Flask(__name__)
CORS(app)  # Allow frontend to communicate with backend

ACCESS_TOKEN = "kbOQu2mx2R689ucldB48CyiygnCx"

genai.configure(api_key=GEMINI_API_KEY_2)

UPLOAD_FOLDER = "uploads"
#PLOAD_FOLDER_2 = "uploads_ocr"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    form_data = request.form
    description = form_data.get("description", "")
    date = form_data.get("date", datetime.now().strftime("%Y-%m-%d"))
    status = form_data.get("status", "Pending")
    
    files = request.files.getlist('file')  # Get multiple files

    if not files or all(file.filename == '' for file in files):
        return jsonify({"error": "No selected file"}), 400

    saved_files = []
    for file in files:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        #file_path_2 = os.path.join(UPLOAD_FOLDER_2, file.filename)
        file.save(file_path)
        #file.save(file_path_2)
        saved_files.append(file.filename)

    return jsonify({
        "message": "Files uploaded successfully!",
        "filenames": saved_files,
        "description": description,
        "date": date,
        "status": status
    })

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

@app.route("/save_llm_outout", methods=["POST"])
def save_llm_output():
    data = request.get_json()
    summaryData = data.get("summaryData")
    if not summaryData:
        return jsonify({"error": "No summary data provided"}), 400

    response = requests.post("http://localhost:3002/save_summary", json={"summary": summaryData["summary"]})
    if response.status_code != 200:
        return jsonify({"error": "Failed to save summary"}), response.status_code
    
    print(response)
    os.makedirs(f"./output_reports", exist_ok=True)
    with open(f"./output_reports/extracted_llm_text.txt", 'w') as f:
        f.write(response)

    return jsonify({"message": "Output saved successfully!"})

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

# @app.route("/flags", methods=["GET"])
# def check_flags():
#     user_details = {
#       "user_id": "EMP099"
#     }
#     bill_id_index = {
#         "common_list":['BC8T5P41XU', 'WBJJ0EG5XV', 'TX6432I0KV', 'APYEKEIU7A', 'LE0S1CD1GJ', 'KKEXXCGMM6',
#         '5VO4HZAWZY', '75D8RHA657', 'Z19X6FR6DA', '4Q0B5KU3VM', '8CDS0T4XG8', 'DN5B73V13T',
#         'CHRC77U9JZ', 'BEM2YX3A5Z', 'QHLKPW0VAP', 'X67RIL47C2', 'BE1Z4K9RPI', 'T2FG08DEFS',
#         'RJHCJ8LW3S', 'KQ9HKSCJX1', '4DK8FXOTHL', 'ZWP3Q6MR5I', '7LSAA43265', 'O0XWHQ9WX3',
#         'OH5LWVK9MX', '774RYSG92F', '5JV8DDEDJD', 'PBVEIRWAPK', 'S9AYPBULFD', 'DMHQZBBI4G',
#         'NUEIX394KI', 'WL8FOG9LNO', '1CGMMPITQ5', 'O2GTDDJJ24', 'A0L3ZHIL8X', 'CBIWL2Z0EX',
#         'SH5OFRQA5G', 'WT256JFMSG', 'E6AN3EWK4E', 'N9JOZA2CRV', 'XLUE3Q0PX9', '0PHZ866QUR',
#         'YJIB4C6N18', '5CMLGLGS4G', 'O4WMBAWI3X', 'V1UIH1VMGZ', 'FZBOKDSSX8', 'VX7PK9DCHD',
#         'WTQ66A83ZF', 'MCAPOQ4ZAL', '2Q557CFRV1', 'WJOZNMNQHV', '1X94IMIU2G', 'W8V0QH2STK',
#         'FC6OC5OIL7', 'OUIKSG8MLA', 'LSZ2TLP8K5', 'MKN2CO01K8', 'YJK3NK7DCN', '8BSZQ07CKZ',
#         'RC4HZJWS00', 'OOS0SGR3GZ', '4RTWS5AW0W', 'QQFVUAPHAR', 'RT1TSO6DT8', 'J0JASXTL2Y',
#         '9TFWPBVCWM', 'BD51LY0YAJ', 'Z8ZFVZAFXB', '0RLWE9MDIQ', 'FUAQN6FAIM', 'UJT2XWM680',
#         'DFWRGVLEKA', 'O4KG4Q32IQ', 'EM3LWQRBRB', 'H6N37FSU2C', 'HI5CVVWQCB', 'X8D5XV12EW',
#         'F19YN8GJTY', '0Q3IJM2NQO', 'XE7IFLLY3K', 'D6L5MVQ2KZ', 'QWZ6UADQRW', 'BHDSPJN333',
#         '25CIU6889S', 'IB9KUDWBLR', 'L5W7LB3U6U', 'R75CX49U8H', 'JFAR32Y9NH', 'C8110SZ2N7',
#         'APW0R68OUO', '2KTXCC21Q9', '2EMMB5XFFV', 'J8PD9DOG6Q', '1J230OIRR2', 'UJCM123DTX',
#         'M74Y7P9O4P', '3KGDHF2DLD', 'XM2W66A08D', 'BVPL8P2LUA'],
#         "E101": {
#             "bill_id": ['BC8T5P41XU', 'WBJJ0EG5XV', 'TX6432I0KV']
#         },
#         "E102": {
#             "bill_id": ['APYEKEIU7A', 'LE0S1CD1GJ']
#         },
#         "E103": {
#             "bill_id": ['KKEXXCGMM6', '5VO4HZAWZY', '75D8RHA657', 'Z19X6FR6DA']
#         },
#         "E104": {
#             "bill_id": ['4Q0B5KU3VM', '8CDS0T4XG8']
#         },
#         "E105": {
#             "bill_id": ['DN5B73V13T', 'CHRC77U9JZ', 'BEM2YX3A5Z']
#         },
#         "E106": {
#             "bill_id": ['QHLKPW0VAP', 'X67RIL47C2']
#         },
#         "E107": {
#             "bill_id": ['BE1Z4K9RPI', 'T2FG08DEFS', 'RJHCJ8LW3S']
#         },
#         "E108": {
#             "bill_id": ['KQ9HKSCJX1', '4DK8FXOTHL']
#         },
#         "E109": {
#             "bill_id": ['ZWP3Q6MR5I', '7LSAA43265', 'O0XWHQ9WX3']
#         },
#         "E110": {
#             "bill_id": ['OH5LWVK9MX', '774RYSG92F', '5JV8DDEDJD']
#         },
#         "E111": {
#             "bill_id": ['PBVEIRWAPK', 'S9AYPBULFD']
#         },
#         "E112": {
#             "bill_id": ['DMHQZBBI4G', 'NUEIX394KI', 'WL8FOG9LNO']
#         },
#         "E113": {
#             "bill_id": ['1CGMMPITQ5', 'O2GTDDJJ24']
#         },
#         "E114": {
#             "bill_id": ['A0L3ZHIL8X', 'CBIWL2Z0EX']
#         },
#         "E115": {
#             "bill_id": ['SH5OFRQA5G', 'WT256JFMSG', 'E6AN3EWK4E']
#         },
#         "E116": {
#             "bill_id": ['N9JOZA2CRV', 'XLUE3Q0PX9']
#         },
#         "E117": {
#             "bill_id": ['0PHZ866QUR', 'YJIB4C6N18']
#         },
#         "E118": {
#             "bill_id": ['5CMLGLGS4G', 'O4WMBAWI3X']
#         },
#         "E119": {
#             "bill_id": ['V1UIH1VMGZ', 'FZBOKDSSX8', 'VX7PK9DCHD']
#         },
#         "E120": {
#             "bill_id": ['WTQ66A83ZF', 'MCAPOQ4ZAL']
#         }
#     }
#     policies={
#         'submission_period': 30,
#         'Employee': {
#             'expense_limit':{
#                 'Domestic': {
#                     'Duration': 5, #unless pre-approved
#                     'Travel (Transport, Accommodation)': 40000,  # per trip
#                     'Meals': 2500,  # per day
#                     'Office_Supplies': 8000,  # per month
#                     'Communication': 4000,  # per month
#                     'Gifts': 4000,  # per occasion
#                     'Events': 40000,  # per event
#                     'Training': 80000,  # per year
#             },
#             'International': {
#                 'Duration': 10,
#                 'Travel (Transport, Accommodation)': 100000,  # per trip
#                 'Meals': 5000,  # per day
#                 'Events': 100000,  # per event
#                 'Training': 200000,  # per year
#             }
#             }

#         },
#         'Team Lead': {
#             'expense_limit':{
#                 'Domestic': {
#                     'Duration': 5, #unless pre-approved
#                     'Travel (Transport, Accommodation)': 80000,  # per trip
#                     'Meals': 4000,  # per day
#                     'Office_Supplies': 16000,  # per month
#                     'Communication': 8000,  # per month
#                     'Gifts': 8000,  # per occasion
#                     'Events': 80000,  # per event
#                     'Training': 160000,  # per year
#             },
#             'International': {
#                 'Duration':10,
#                 'Travel (Transport, Accommodation)': 200000,  # per trip
#                 'Meals': 10000,  # per day
#                 'Events': 200000,  # per event
#                 'Training': 400000,  # per year
#             }
#             }

#         },
#         'Manager': {
#             'expense_limit':{
#                 'Domestic': {
#                     'Duration': 5, #unless pre-approved
#                     'Travel (Transport, Accommodation)': 160000,  # per trip
#                     'Meals': 8000,  # per day
#                     'Office_Supplies': 40000,  # per month
#                     'Communication': 16000,  # per month
#                     'Gifts': 40000,  # per occasion
#                     'Events': 400000,  # per event
#                     'Training': 400000,  # per year
#             },
#             'International': {
#                 'Duration':10,
#                 'Travel (Transport, Accommodation)': 400000,  # per trip
#                 'Meals': 20000,  # per day
#                 'Events': 1000000,  # per event
#                 'Training': 1000000,  # per year
#             }
#             }

#         },
#         'Dept Head': {
#             'expense_limit':{
#                 'Domestic': {
#                     'Duration': 5, #unless pre-approved
#                     'Travel (Transport, Accommodation)': 400000,  # per trip
#                     'Meals': 16000,  # per day
#                     'Office_Supplies': 80000,  # per month
#                     'Communication': 40000,  # per month
#                     'Gifts': 80000,  # per occasion
#                     'Events': 800000,  # per event
#                     'Training': 800000,  # per year
#             },
#             'International': {
#                 'Duration':10,
#                 'Travel (Transport, Accommodation)': 1000000,  # per trip
#                 'Meals': 40000,  # per day
#                 'Events': 2000000,  # per event
#                 'Training': 2000000,  # per year
#             }
#             }

#         },
#         'CEO': {
#             'expense_limit':{
#             'Domestic': 'No cap (as required)',
#             'International': 'No cap (as required)'
#             }
#         }
#     }
#     user_details={
#         103: {
#             "user_name": "Amit Singh",
#             "user_dept": "Finance",
#             "user_role": "Employee",
#             "office_city": "Hyderabad"
#         },
#         108: {
#             "user_name": "Mansi Dhamne",
#             "user_dept": "HR",
#             "user_role": "Manager",
#             "office_city": "Mumbai"
#         }
#     }
#     user_expense={
#       'user_list':[],
#       "user_id": {
#           "bill_count":0,
#           "BILL_ID": {
#             "extracted_bill_id": "HTLVKU28VU",
#             "bill_date": "Oct 11, 2017",
#             "upload_date": "Oct 11, 2017",
#             "time": "03:53 PM",
#             "location": "2532, Street No 11, Chuna Mandi, Paharganj, New Delhi, ND-110055",
#             "bill_amount": 1889,
#             "currency": "INR",
#             "bill_details": [
#               {
#                 "vendor": "Goibibo",
#                 "location": "Sai Miracle (goStays Certified)",
#                 "phone": "01147056969, 8510852299",
#                 "invoice_number": "HTLVKU28VU",
#                 "date": "Oct 11, 2017",
#                 "sub_total": 1889,
#                 "net_total": 1889,
#                 "grand_total": 1889,
#                 "items": [
#                   {
#                     "item": "Deluxe Room",
#                     "quantity": 1,
#                     "rate": 1889,
#                     "amount": 1889
#                   }
#                 ]
#               }
#             ],
#             "summary": "Sambhav Jain stayed at Sai Miracle (goStays Certified) from Oct 11 to Oct 12, 2017, paying a total of Rs.1889 for a Deluxe Room.",
#             "tags": "Hotel, Room, Deluxe Room, Goibibo"
#         }
#     }
#     }
#     combined(bill_id_index,policies,user_details,user_expense,103,temp_bill)



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3002, debug=True)
