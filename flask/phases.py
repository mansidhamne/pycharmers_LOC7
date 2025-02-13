# -*- coding: utf-8 -*-
"""LOC4.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1vR3yADw9N9t_r38mwkI53s6B6MxnZ-KL

# PHASE 1
"""

import json
import dataclasses
from pinecone.grpc import PineconeGRPC as Pinecone
import time
import googleapiclient
from sentence_transformers import SentenceTransformer
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import numpy as np
from scipy.spatial.distance import cosine
from typing import List, Dict
from datetime import datetime, timedelta
import tensorflow as tf
from tensorflow.keras import layers, models
import os
from pinecone import ServerlessSpec
from sentence_transformers import SentenceTransformer, util
model = SentenceTransformer("jinaai/jina-embeddings-v2-small-en", trust_remote_code=True)


"""## DATA"""

user_details={
    103: {
        "user_name": "Amit Singh",
        "user_dept": "Finance",
        "user_role": "Employee",
        "office_city": "Hyderabad"
    }
}

categories=['Travel (Transport, Accommodation)','Meals','Office_Supplies','Communication','Gifts','Events','Training']

bill_id_index = {
    "common_list":['BC8T5P41XU', 'WBJJ0EG5XV', 'TX6432I0KV', 'APYEKEIU7A', 'LE0S1CD1GJ', 'KKEXXCGMM6',
    '5VO4HZAWZY', '75D8RHA657', 'Z19X6FR6DA', '4Q0B5KU3VM', '8CDS0T4XG8', 'DN5B73V13T',
    'CHRC77U9JZ', 'BEM2YX3A5Z', 'QHLKPW0VAP', 'X67RIL47C2', 'BE1Z4K9RPI', 'T2FG08DEFS',
    'RJHCJ8LW3S', 'KQ9HKSCJX1', '4DK8FXOTHL', 'ZWP3Q6MR5I', '7LSAA43265', 'O0XWHQ9WX3',
    'OH5LWVK9MX', '774RYSG92F', '5JV8DDEDJD', 'PBVEIRWAPK', 'S9AYPBULFD', 'DMHQZBBI4G',
    'NUEIX394KI', 'WL8FOG9LNO', '1CGMMPITQ5', 'O2GTDDJJ24', 'A0L3ZHIL8X', 'CBIWL2Z0EX',
    'SH5OFRQA5G', 'WT256JFMSG', 'E6AN3EWK4E', 'N9JOZA2CRV', 'XLUE3Q0PX9', '0PHZ866QUR',
    'YJIB4C6N18', '5CMLGLGS4G', 'O4WMBAWI3X', 'V1UIH1VMGZ', 'FZBOKDSSX8', 'VX7PK9DCHD',
    'WTQ66A83ZF', 'MCAPOQ4ZAL', '2Q557CFRV1', 'WJOZNMNQHV', '1X94IMIU2G', 'W8V0QH2STK',
    'FC6OC5OIL7', 'OUIKSG8MLA', 'LSZ2TLP8K5', 'MKN2CO01K8', 'YJK3NK7DCN', '8BSZQ07CKZ',
    'RC4HZJWS00', 'OOS0SGR3GZ', '4RTWS5AW0W', 'QQFVUAPHAR', 'RT1TSO6DT8', 'J0JASXTL2Y',
    '9TFWPBVCWM', 'BD51LY0YAJ', 'Z8ZFVZAFXB', '0RLWE9MDIQ', 'FUAQN6FAIM', 'UJT2XWM680',
    'DFWRGVLEKA', 'O4KG4Q32IQ', 'EM3LWQRBRB', 'H6N37FSU2C', 'HI5CVVWQCB', 'X8D5XV12EW',
    'F19YN8GJTY', '0Q3IJM2NQO', 'XE7IFLLY3K', 'D6L5MVQ2KZ', 'QWZ6UADQRW', 'BHDSPJN333',
    '25CIU6889S', 'IB9KUDWBLR', 'L5W7LB3U6U', 'R75CX49U8H', 'JFAR32Y9NH', 'C8110SZ2N7',
    'APW0R68OUO', '2KTXCC21Q9', '2EMMB5XFFV', 'J8PD9DOG6Q', '1J230OIRR2', 'UJCM123DTX',
    'M74Y7P9O4P', '3KGDHF2DLD', 'XM2W66A08D', 'BVPL8P2LUA'],
    "E101": {
        "bill_id": ['BC8T5P41XU', 'WBJJ0EG5XV', 'TX6432I0KV']
    },
    "E102": {
        "bill_id": ['APYEKEIU7A', 'LE0S1CD1GJ']
    },
    "E103": {
        "bill_id": ['KKEXXCGMM6', '5VO4HZAWZY', '75D8RHA657', 'Z19X6FR6DA']
    },
    "E104": {
        "bill_id": ['4Q0B5KU3VM', '8CDS0T4XG8']
    },
    "E105": {
        "bill_id": ['DN5B73V13T', 'CHRC77U9JZ', 'BEM2YX3A5Z']
    },
    "E106": {
        "bill_id": ['QHLKPW0VAP', 'X67RIL47C2']
    },
    "E107": {
        "bill_id": ['BE1Z4K9RPI', 'T2FG08DEFS', 'RJHCJ8LW3S']
    },
    "E108": {
        "bill_id": ['KQ9HKSCJX1', '4DK8FXOTHL']
    },
    "E109": {
        "bill_id": ['ZWP3Q6MR5I', '7LSAA43265', 'O0XWHQ9WX3']
    },
    "E110": {
        "bill_id": ['OH5LWVK9MX', '774RYSG92F', '5JV8DDEDJD']
    },
    "E111": {
        "bill_id": ['PBVEIRWAPK', 'S9AYPBULFD']
    },
    "E112": {
        "bill_id": ['DMHQZBBI4G', 'NUEIX394KI', 'WL8FOG9LNO']
    },
    "E113": {
        "bill_id": ['1CGMMPITQ5', 'O2GTDDJJ24']
    },
    "E114": {
        "bill_id": ['A0L3ZHIL8X', 'CBIWL2Z0EX']
    },
    "E115": {
        "bill_id": ['SH5OFRQA5G', 'WT256JFMSG', 'E6AN3EWK4E']
    },
    "E116": {
        "bill_id": ['N9JOZA2CRV', 'XLUE3Q0PX9']
    },
    "E117": {
        "bill_id": ['0PHZ866QUR', 'YJIB4C6N18']
    },
    "E118": {
        "bill_id": ['5CMLGLGS4G', 'O4WMBAWI3X']
    },
    "E119": {
        "bill_id": ['V1UIH1VMGZ', 'FZBOKDSSX8', 'VX7PK9DCHD']
    },
    "E120": {
        "bill_id": ['WTQ66A83ZF', 'MCAPOQ4ZAL']
    }
}

'''
Stores all the flagged employess for the month along with the reason for which they were flagged
'''
flag_list={
    "emp_id":[],
    # "E101":{
    #     'all_flags':[False],#value for each correspoinding flag
    #     'duplicate_id_flag':{
    #         'value':False,
    #         'mistake':False
    #     }

    # }
}

'''
Stores all the company policies that need to  be reffered for PHASE1

'''
policies={

    'submission_period': 30,
    'Employee': {
        'expense_limit':{
            'Domestic': {
                'Duration': 5, #unless pre-approved
                'Travel (Transport, Accommodation)': 40000,  # per trip
                'Meals': 2500,  # per day
                'Office_Supplies': 8000,  # per month
                'Communication': 4000,  # per month
                'Gifts': 4000,  # per occasion
                'Events': 40000,  # per event
                'Training': 80000,  # per year
        },
        'International': {
            'Duration': 10,
            'Travel (Transport, Accommodation)': 100000,  # per trip
            'Meals': 5000,  # per day
            'Events': 100000,  # per event
            'Training': 200000,  # per year
        }
        }

    },
    'Team Lead': {
        'expense_limit':{
            'Domestic': {
                'Duration': 5, #unless pre-approved
                'Travel (Transport, Accommodation)': 80000,  # per trip
                'Meals': 4000,  # per day
                'Office_Supplies': 16000,  # per month
                'Communication': 8000,  # per month
                'Gifts': 8000,  # per occasion
                'Events': 80000,  # per event
                'Training': 160000,  # per year
        },
        'International': {
            'Duration':10,
            'Travel (Transport, Accommodation)': 200000,  # per trip
            'Meals': 10000,  # per day
            'Events': 200000,  # per event
            'Training': 400000,  # per year
        }
        }

    },
    'Manager': {
        'expense_limit':{
            'Domestic': {
                'Duration': 5, #unless pre-approved
                'Travel (Transport, Accommodation)': 160000,  # per trip
                'Meals': 8000,  # per day
                'Office_Supplies': 40000,  # per month
                'Communication': 16000,  # per month
                'Gifts': 40000,  # per occasion
                'Events': 400000,  # per event
                'Training': 400000,  # per year
        },
        'International': {
            'Duration':10,
            'Travel (Transport, Accommodation)': 400000,  # per trip
            'Meals': 20000,  # per day
            'Events': 1000000,  # per event
            'Training': 1000000,  # per year
        }
        }

    },
    'Dept Head': {
        'expense_limit':{
            'Domestic': {
                'Duration': 5, #unless pre-approved
                'Travel (Transport, Accommodation)': 400000,  # per trip
                'Meals': 16000,  # per day
                'Office_Supplies': 80000,  # per month
                'Communication': 40000,  # per month
                'Gifts': 80000,  # per occasion
                'Events': 800000,  # per event
                'Training': 800000,  # per year
        },
        'International': {
            'Duration':10,
            'Travel (Transport, Accommodation)': 1000000,  # per trip
            'Meals': 40000,  # per day
            'Events': 2000000,  # per event
            'Training': 2000000,  # per year
        }
        }

    },
    'CEO': {
        'expense_limit':{
          'Domestic': 'No cap (as required)',
          'International': 'No cap (as required)'
          }

    }


}

india_city = [
    "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Surat", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Visakhapatnam", "Indore", "Thane", "Bhopal", "Patna", "Ludhiana", "Agra",
    "Nashik", "Vadodara", "Meerut", "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Prayagraj",
    "Gwalior", "Jabalpur", "Coimbatore", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Chandigarh", "Guwahati",
    "Solapur", "Hubballi-Dharwad", "Tiruchirappalli", "Bareilly", "Bhubaneswar", "Moradabad", "Aligarh", "Jamshedpur",
    "Dehradun", "Asansol"
]

user_expense={
      'user_list':[],
      "user_id": {
          "bill_count":0,
          "BILL_ID": {
            "extracted_bill_id": "HTLVKU28VU",
            "bill_date": "Oct 11, 2017",
            "upload_date": "Oct 11, 2017",
            "time": "03:53 PM",
            "location": "2532, Street No 11, Chuna Mandi, Paharganj, New Delhi, ND-110055",
            "bill_amount": 1889,
            "currency": "INR",
            "bill_details": [
              {
                "vendor": "Goibibo",
                "location": "Sai Miracle (goStays Certified)",
                "phone": "01147056969, 8510852299",
                "invoice_number": "HTLVKU28VU",
                "date": "Oct 11, 2017",
                "sub_total": 1889,
                "net_total": 1889,
                "grand_total": 1889,
                "items": [
                  {
                    "item": "Deluxe Room",
                    "quantity": 1,
                    "rate": 1889,
                    "amount": 1889
                  }
                ]
              }
            ],
            "summary": "Sambhav Jain stayed at Sai Miracle (goStays Certified) from Oct 11 to Oct 12, 2017, paying a total of Rs.1889 for a Deluxe Room.",
            "tags": "Hotel, Room, Deluxe Room, Goibibo"
        }
  }

}

temp_bill={
            "extracted_bill_id": "COMB1",
            "bill_date": "2017-10-07",
            "upload_date": "2017-10-08",
            "time": "03:53 PM",
            "location": "2532, Street No 11, Chuna Mandi, Paharganj, New Delhi, ND-110055",
            "bill_amount": 1889,
            "currency": "INR",
            "bill_details": [
              {
                "vendor": "Goibibo",
                "location": "Sai Miracle (goStays Certified)",
                "phone": "01147056969, 8510852299",
                "invoice_number": "HTLVKU28VU",
                "date": "Oct 11, 2017",
                "sub_total": 1889,
                "net_total": 1889,
                "grand_total": 1889,
                "items": [
                  {
                    "item": "Deluxe Room",
                    "quantity": 1,
                    "rate": 1889,
                    "amount": 1889
                  }
                ]
              }
            ],
            "summary": "Sambhav Jain stayed at Sai Miracle (goStays Certified) from Oct 11 to Oct 12, 2017, paying a total of Rs.1889 for a Deluxe Room.",
            "tags": "Hotel, Room, Deluxe Room, Goibibo"
        }

flag_user_expense={
      'user_list':[]
}

"""## CODES"""

def embed_query(query:str):
  return model.encode(query).tolist()
def embed_cat(categories:str):
  embedding_cat=[]
  for cat in categories:
    embedding_cat.append(model.encode(cat).tolist())
  return embedding_cat
def compute_similarity(query_vector, vector_list):
    """
    Compute similarity scores between a query vector and a list of vectors.

    :param query_vector: A 1D numpy array representing the query vector.
    :param vector_list: A 2D numpy array where each row is a vector to compare.
    :return: A list of similarity scores and confidence scores.
    """
    similarity_scores = []

    for vec in vector_list:
        similarity = 1 - cosine(query_vector, vec)  # Cosine similarity
        confidence = (similarity + 1) / 2  # Scale similarity to range [0,1]
        similarity_scores.append(similarity)

    return np.argmax(similarity_scores),np.max(similarity_scores)
def fix_cateogry(query_vector,vector_list):
  index,confidence=compute_similarity(query_vector,vector_list)
  return categories[index],round(confidence,4)
def extract_summary_category(summary:str):
  query_vector=embed_query(summary)
  embedding_cat=embed_cat(categories)
  return fix_cateogry(query_vector,embedding_cat)

def identify_region(location:str,indian_city:str):
  is_domestic=any(element in location for element in indian_city)
  if is_domestic==True:
    return 'Domestic'
  else:
    return 'International'

def update_user_expense(user_expense:Dict,emp_id:str,temp_bill_details:Dict):
  if emp_id not in user_expense['user_list']:
    user_expense['user_list'].append(emp_id)
    user_expense[emp_id]={
        'bill_count':1,
        1:temp_bill_details
    }
  else:
    user_expense[emp_id]['bill_count']+=1
    user_expense[emp_id][user_expense[emp_id]['bill_count']]=temp_bill_details

# update_user_expense(flag_user_expense,'1',temp_bill)

def reject_reasons_summary(details:List,emp_id:str):
  filename=f'{emp_id}_reject_reason'
  with open(filename,'w') as file:
    for detail in details:
      file.write(str(detail) + "\n")
  return filename

def check_bill_id_index(bill_id:str)->bool:
  return bill_id in(bill_id_index['common_list'])
def check_user_for_bill(bill_id):
    """Return the employee ID who uploaded the given bill_id"""
    for employee_id, data in bill_id_index.items():
        if employee_id != "common_list" and bill_id in data["bill_id"]:
            return employee_id
    return None  # Bill ID not found


def update_bill_for_employee(employee_id, bill_id):
    """Add the bill_id to the employee's record and the common list if it's new"""
    # Add the bill to the common list if not already present
    if bill_id not in bill_id_index["common_list"]:
        bill_id_index["common_list"].append(bill_id)

    # Add the bill to the employee's bill_id list (create the key if not exists)
    if employee_id not in bill_id_index:
        bill_id_index[employee_id] = {"bill_id": []}

    # Append the bill_id to the employee's list if not already present
    if bill_id not in bill_id_index[employee_id]["bill_id"]:
        bill_id_index[employee_id]["bill_id"].append(bill_id)
def update_flag(employee_id:str,flag_type:str,valueF:bool,valueM:bool)->None:
  if employee_id not in flag_list:
    flag_list[employee_id]={
        flag_type:{
            'value':valueF,
            'mistake':valueM
        }
    }
    flag_list['emp_id'].append(employee_id)
  else:
    flag_list[employee_id][flag_type]={
        'value':valueF,
        'mistake':valueM
    }
def validate_duplicate_bill(emp_id:str,bill_id:str,bill_id_index:List)->bool:
  flag=check_bill_id_index(bill_id)
  if check_bill_id_index(bill_id):
      id=check_user_for_bill(bill_id)
      print(f"Bill:{bill_id} already submitted by another user {id}")
      update_flag(emp_id,'duplicate_id_flag',True,False)
      return True

  if not check_bill_id_index(bill_id):
    update_bill_for_employee(emp_id,bill_id) # updates the bill_id_index (SHOULDNT BE DONE TILL PHASE 3)
    #print(f"Bill: {bill_id} submitted successfully")
    return False

def is_bill_submitted_on_time(bill_date, upload_date, submission_period_days):
    """
    Checks if a bill is submitted within the allowed submission period.

    :param bill_date: The date when the bill was issued (YYYY-MM-DD).
    :param upload_date: The date when the bill was uploaded (YYYY-MM-DD).
    :param submission_period_days: Number of days allowed for submission after the bill date.
    :return: Tuple (is_valid, message)
    """

    # Convert string dates to datetime objects
    bill_date = datetime.strptime(bill_date, "%Y-%m-%d")
    upload_date = datetime.strptime(upload_date, "%Y-%m-%d")

    # Calculate the submission deadline
    submission_deadline = bill_date + timedelta(days=submission_period_days)

    # Check if upload date is within the allowed period
    if upload_date < bill_date:
        return False, "Upload date cannot be before the bill date."

    if upload_date <= submission_deadline:
        return True, "Bill submitted within the submission period."
    else:
        return False, "Bill submitted late, beyond the allowed submission period."

# # Example Usage
# bill_date = "2017-10-07"
# upload_date = "2017-02-08"
# submission_period = 15  # Allowed submission period in days

# is_valid, message = is_bill_submitted_on_time(bill_date, upload_date, submission_period)
# print(f"Submission Valid: {is_valid}, Message: {message}")

def PHASE1(bill_id_index:Dict,policies:Dict,user_details:Dict,emp_id:str,temp_bill_details:Dict):
  phase2=True
  reject_reasons=[]
  status=None
  # Requirements from the bill
  bill_id=temp_bill_details['extracted_bill_id']
  bill_date=temp_bill_details['bill_date']
  bill_upload_date=temp_bill_details['upload_date']
  bill_summary=temp_bill_details['summary']
  bill_region=identify_region(temp_bill_details['location'],india_city)
  bill_amount=temp_bill_details['bill_amount']

  #Requirements of the user
  emp_dept=user_details[emp_id]['user_dept']
  emp_role=user_details[emp_id]['user_role']

  # check if the bill already exisits
  duplicate=validate_duplicate_bill(emp_id,bill_id,bill_id_index)

  #check if bill is uploaded on correct time
  delay_status=is_bill_submitted_on_time(bill_date,bill_upload_date,policies['submission_period'])
  bill_delay=not delay_status[0]

  # find the tag of expense
  expense_type,conf=extract_summary_category(bill_summary)

  #Retrive the expense policy for the user
  pol=policies[emp_role]['expense_limit'][bill_region][expense_type]

  # Check if the expense is in the policy limit
  excess_spend=pol<bill_amount

  #Set the flags
  if duplicate==True:
    phase2=False
    reject_reasons.append(f'Bill with ID: {bill_id} already submitted!')
  if bill_delay==True:
    phase2=False
    reject_reasons.append(f'Bill with ID: {bill_id} submitted late! {delay_status[1]}')
    update_flag(emp_id,'bill_delay_flag',True,False)
  if excess_spend==True:
    phase2=False
    reject_reasons.append(f'Bill with ID: {bill_id} exceeds the expense limit for {expense_type} for Role:{emp_role}, for {bill_region} region !')
    update_flag(emp_id,f'excess_spend_{expense_type}',True,False)

  if len(reject_reasons)!=0:
    status=f'BILL: {bill_id} HAS BEEN REJECTED! CHECK THE REASONS AT THE DASHBOARD'
    reject_path=reject_reasons_summary(reject_reasons,emp_id)
  if phase2==True:
    status=f'BILL: {bill_id} HAS BEEN SENT FOR FINAL PROCESSING! CHECK THE UPDATES AT THE DASHBOARD'
    update_user_expense(user_expense,emp_id,temp_bill_details)
    reject_path=None
  else:
    update_user_expense(flag_user_expense,emp_id,temp_bill_details)
  return phase2,status,reject_path

# phase2,bill_status,reject_path=PHASE1(bill_id_index,policies,user_details,103,temp_bill)

# print(phase2)
# print(bill_status)
# print(reject_path)

# flag_list

"""## Check all databases"""

# user_details

# bill_id_index['common_list']

# flag_list

# user_expense

# flag_user_expense

"""# PHASE 2"""

@dataclasses.dataclass
class DEFAULT:
    PINECONE_API_KEY: str = "your pinecone key"
    INDEX_NAME: str = "loc-phase-2"

class EMBEDDINGSingleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EMBEDDINGSingleton, cls).__new__(cls)
            cls._instance.model = SentenceTransformer("jinaai/jina-embeddings-v2-small-en", trust_remote_code=True)
        return cls._instance

class GenerateVectorEmbeddings:
    def __init__(self):
        self.model = EMBEDDINGSingleton().model
        self.scaler = MinMaxScaler()

    def load_data(self, file_path):
        self.df = pd.read_csv(file_path)

    def preprocess(self):
        self.df["Text_Representation"] = self.df.apply(
            lambda row: f"{row['Vendor']} spent on {row['Item']} at {row['Location']} "
                        f"under {row['Department']} department as a {row['Role']} "
                        f"categorized as {row['Tag']}.", axis=1
        )
        self.df[["Amount", "Rate", "Quantity"]] = self.scaler.fit_transform(self.df[["Amount", "Rate", "Quantity"]])

    def embed_base(self):
        self.df['cat_embedding'] = self.df['Text_Representation'].apply(lambda x: self.model.encode(x).tolist())

    def final_embed(self):
      """Concatenate categorical embeddings with normalized numeric data."""
      self.df['final_embedding'] = self.df.apply(
          lambda row: np.append(row['cat_embedding'], [row['Amount'], row['Rate'], row['Quantity']]).tolist(),
          axis=1
        )


    def save_data(self, output_file):
        self.df.to_csv(output_file, index=False)

    def run_pipeline(self, input_file, output_file):
        self.load_data(input_file)
        self.preprocess()
        self.embed_base()
        self.final_embed()
        self.save_data(output_file)

class IndexHandling:
    def __init__(self, index_name):
        self.key = Pinecone(api_key=DEFAULT.PINECONE_API_KEY)
        self.index_name = "loc-phase-2"
        self.index = self.key.Index(self.index_name)
        self.model = EMBEDDINGSingleton().model

        # if index_name not in self.key.list_indexes():
        #     print(f'Creating index with name {self.index_name}....')
        #     self.key.create_index(
        #         name=self.index_name,
        #         dimension=515,
        #         metric='cosine',
        #         spec=ServerlessSpec(cloud='aws', region='us-east-1')
        #     )
        # else:
        #     print(f"Index '{index_name}' already exists. Skipping creation.")
        while not self.key.describe_index(self.index_name).status['ready']:
            time.sleep(2)

    def create_data_records(self, data):
        records = []
        for _, row in data.iterrows():
            records.append({
                'id': str(row['id']),  # Ensure ID is a string
                'values': row['final_embedding'],  # Already converted to a Python list
                'metadata': {'text': row['Summary']}
            })
        return records

    def upsertVectors(self, data, data_namespace):
        records = self.create_data_records(data)
        print(len(records))
        self.index.upsert(
            vectors=records,
            namespace=data_namespace
        )
        time.sleep(10)
        print(self.index.describe_index_stats())

    def searchIndex(self, query,norms, namespace_value):
        query_embedding = generate_query(query,norms)
        results = self.index.query(
            namespace=namespace_value,
            vector=query_embedding,
            top_k=100,
            include_metadata=False,
            include_values=True
        )
        return results

def extract_details(user_details, user_expense):
    result = []
    combined_strinf=''
    for user_id in user_expense['user_list']:
        user = user_details[user_id]
        expense_data = user_expense[user_id]

        for bill_id, bill in expense_data.items():
            if bill_id != "bill_count":
                bill_details = bill["bill_details"][0]
                for item in bill_details["items"]:
                    extracted_data = {
                        "Vendor": bill_details["vendor"],
                        "Location": bill["location"],
                        "Department": user["user_dept"],
                        "Role": user["user_role"],
                        "Currency": bill["currency"],
                        "Amount": item["amount"],
                        "Item": item["item"],
                        "Rate": item["rate"],
                        "Quantity": item["quantity"],
                        "Summary": bill["summary"],
                        "Tag": bill["tags"]
                    }
                    result.append(extracted_data)
                    combined_string = ', '.join([
                        bill_details["vendor"],
                        bill["location"],
                        user["user_dept"],
                        user["user_role"],
                        bill["currency"],
                        bill["tags"]
                    ])

    return result,combined_string

def normalize_expense_details( details):
    result = []
    df = pd.read_csv('base.csv')

    amount_max = np.max(df['Amount'])
    amount_min = np.min(df['Amount'])


    rate_max=np.max(df['Rate'])
    rate_min=np.min(df['Rate'])


    quantity_max=np.max(df['Quantity'])
    quantity_min=np.min(df['Quantity'])

    # Iterate through each expense detail in the list
    for detail in details:
        amount = detail['Amount']
        print(amount)
        rate = detail['Rate']
        quantity = detail['Quantity']
        result.append((amount - amount_min) / (amount_max - amount_min))
        result.append((rate - rate_min) / (rate_max - rate_min))
        result.append((quantity - quantity_min) / (quantity_max - quantity_min))
        print(result)
        print(f'result len : {len(result)}')
    return result
def generate_query_temp(query_string):
  query_embedding = EMBEDDINGSingleton().model.encode(query_string).tolist()
  return query_embedding
def generate_query(query_string,norms):
  query_string_embed=generate_query_temp(query_string)
  print(len(query_string_embed))
  query_embedding=np.append(query_string_embed,norms).tolist()
  return query_embedding
def extract_vectors(results_search):
  vector_list=results_search.matches
  vectors=[]
  for vec in vector_list:
    vectors.append(vec.values)
  return vectors

def anomaly(base_vec,query_vector):
  # Assuming base_vec is already defined and contains 100 vectors
  base_vec = np.array(base_vec)

  # Add the query_vector to the dataset
  combined_vecs = np.vstack([base_vec, query_vector])

  # Define the autoencoder model
  input_dim = combined_vecs.shape[1]
  input_layer = layers.Input(shape=(input_dim,))
  encoded = layers.Dense(128, activation='relu')(input_layer)
  encoded = layers.Dense(64, activation='relu')(encoded)
  decoded = layers.Dense(128, activation='relu')(encoded)
  decoded = layers.Dense(input_dim, activation='sigmoid')(decoded)

  autoencoder = models.Model(input_layer, decoded)
  autoencoder.compile(optimizer='adam', loss='mse')

  # Train the autoencoder
  autoencoder.fit(combined_vecs, combined_vecs, epochs=50, batch_size=16, shuffle=True)

  # Get reconstruction error
  reconstructed = autoencoder.predict(combined_vecs)
  reconstruction_error = np.mean(np.square(combined_vecs - reconstructed), axis=1)

  # Define an anomaly threshold (for example, using the 95th percentile of reconstruction error)
  threshold = np.percentile(reconstruction_error, 95)
  return reconstruction_error[-1] > threshold

details = []
for user_id, bills in user_expense.items():
    if isinstance(bills, dict) and "BILL_ID" in bills:
        bill_details = bills["BILL_ID"]["bill_details"]
        for bill in bill_details:
            for item in bill["items"]:
                details.append({
                    "Amount": item["amount"],
                    "Rate": item["rate"],
                    "Quantity": item["quantity"]
                })

details

from typing import Dict
def PHASE2(user_details:Dict,user_expense:Dict):
  phase3=False
  extracted_details,query_string = extract_details(user_details, user_expense)
  norms=normalize_expense_details(details)
  print(norms)
  query=query_string
  index=IndexHandling(DEFAULT.INDEX_NAME)
  results_search = index.searchIndex(query,norms, 'default')
  base_vec=extract_vectors(results_search)
  query_vector=generate_query(query_string,norms)
  print(len(query_vector))
  is_anomaly= anomaly(base_vec,query_vector)
  if is_anomaly==False:
    phase3=True

  return phase3,is_anomaly

# approval,is_anomaly=PHASE2(user_details,user_expense)
# print(approval,is_anomaly)

"""# COMBINED"""

def combined(bill_id_index:Dict,policies:Dict,user_details:Dict,user_expense:Dict,emp_id:str,temp_bill):
  phase1,bill_status,reject_path=PHASE1(bill_id_index,policies,user_details,emp_id,temp_bill)
  print(phase1)
  print(bill_status)
  print(reject_path)
  if phase1==False:
    update_flag(emp_id,'phase1_flag',False,False)
    print("Failed PHASE 1!")
    print(bill_status)

  if phase1==True:
    approval,is_anomaly=PHASE2(user_details,user_expense)
    if approval==False:
      update_flag(emp_id,'phase2_flag',False,False)
      update_flag(emp_id,'is_anomaly',True,False)
      print(f"Failed the Phase 2 CHECK! ANOMALY DETECTED")
      update_user_expense(flag_user_expense,emp_id,temp_bill)
    else:
      print("YOUR BILL HAS BEEN SENT TO THE FINANCE DEPARTMENT FOR REIMBURSEMENT!!")
      update_user_expense(user_expense,emp_id,temp_bill)
      validate_duplicate_bill(emp_id,temp_bill['extracted_bill_id'],bill_id_index)

    return phase1,approval,is_anomaly

#combined(bill_id_index,policies,user_details,user_expense,103,temp_bill)

combined(bill_id_index,policies,user_details,user_expense,103,temp_bill)

# bill_id_index['common_list']





