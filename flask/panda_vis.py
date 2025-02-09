import pandasai as pai
import dotenv
import os

# Get your API key from https://app.pandabi.ai
pai.api_key.set("$2a$10$GuGfa6OXt4B.Zv3qiok5Pe0ndyv5p4Oz2sMSB5zicDa81CVfTW81C")

df = pai.read_csv("data/expanded_office_department_spendings.csv")

try:
    response = df.chat("What is the trend in monthly spend in Operations department?")
    print(response)
except Exception as e:
    print(f"Error occured: {str(e)}")

# import pandasai as pai
# from pandasai_openai import OpenAI

# llm = OpenAI(api_token="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")

# # Set your OpenAI API key
# pai.config.set({"llm": llm})

# df = pai.read_csv("data/expanded_office_department_spendings.csv")

# response = df.chat("What is the monthy spend trend of Operations department?")
# print(response)