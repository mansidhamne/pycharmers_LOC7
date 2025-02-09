import json

# Your raw string
with open("../backend/summary.json", 'r') as f:
    data = json.load(f)
    summary = data.get("summary", """ """)

print(summary)
#raw_string = """ "{\n  \"bills\": {\n    \"BILL_ID\": {\n      \"extracted_bill_id\": \"INNO29490345596\",\n      \"bill_date\": \"31/01/2016\",\n      \"upload_date\": \"2023-04-12T07:45:21+05:30\",\n      \"time\": \"07:45 PM\",\n      \"location\": \"Hotel Imperial, Residency Road, Bargalore, Pixege\",\n      \"bill_amount\": 1115.70,\n      \"gst\": \"21%\",\n      \"currency\": \"INR\",\n      \"bill_details\": [\n        {\n          \"vendor\": \"Captan Hasaioar\",\n          \"location\": \"KOTN686.707710\",\n          \"phone\": \"N/A\",\n          \"invoice_number\": \"Table12\",\n          \"date\": \"31/01/2016\",\n          \"sub_total\": 425.00,\n          \"net_total\": 425.00,\n          \"grand_total\": 425.00,\n          \"items\": [\n            {\n              \"item\": \"CHICKENKABAB FUUL\",\n              \"quantity\": 1,\n              \"rate\": 65.00,\n              \"amount\": 65.00\n            },\n            {\n              \"item\": \"Ghee Rice\",\n              \"quantity\": 1,\n              \"rate\": 135.00,\n              \"amount\": 135.00\n            }\n          ]\n        }\n      ],\n      \"tags\": \"ShitNight\",\n      \"summary\": \"Chickens and Ghee Rice consumed at Hotel Imperial, Residency Road, Bargalore, Pixege on 31/01/2016 for a total of 1115.70 INR.\"\n    }\n  }\n" """

# Remove extra quotes at the beginning and end
# cleaned_string = raw_string.strip(' "')
# print(cleaned_string)

string_new = """
{
  "bills": {
    "BILL_ID": {
      "extracted_bill_id": "INNO29490345596",
      "bill_date": "31/01/2016",
      "upload_date": "2023-04-12T07:45:21+05:30",
      "time": "07:45 PM",
      "location": "Hotel Imperial, Residency Road, Bargalore, Pixege",
      "bill_amount": 1115.70,
      "gst": "21%",
      "currency": "INR",
      "bill_details": [
        {
          "vendor": "Captan Hasaioar",
          "location": "KOTN686.707710",
          "phone": "N/A",
          "invoice_number": "Table12",
          "date": "31/01/2016",
          "sub_total": 425.00,
          "net_total": 425.00,
          "grand_total": 425.00,
          "items": [
            {
              "item": "CHICKENKABAB FUUL",
              "quantity": 1,
              "rate": 65.00,
              "amount": 65.00
            },
            {
              "item": "Ghee Rice",
              "quantity": 1,
              "rate": 135.00,
              "amount": 135.00
            }
          ]
        }
      ],
      "tags": "ShitNight",
      "summary": "Chickens and Ghee Rice consumed at Hotel Imperial, Residency Road, Bargalore, Pixege on 31/01/2016 for a total of 1115.70 INR."
    }
  }
}
"""

# Convert to JSON
json_data = json.loads(summary)

# # Print JSON
print(json.dumps(json_data, indent=4))
print(json_data["bills"]["BILL_ID"]["extracted_bill_id"])

billData = json_data["bills"]["BILL_ID"]
print(billData)


