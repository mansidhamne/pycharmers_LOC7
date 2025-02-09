from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline
import markdown
from bs4 import BeautifulSoup
import os

UPLOAD_FOLDER = "uploads_policy"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

model_name = "deepset/roberta-base-squad2"
nlp = pipeline('question-answering', model=model_name, tokenizer=model_name)

def extract_text_from_markdown(md_path):
    with open(md_path, "r", encoding="utf-8") as file:
        md_content = file.read()
    
    # Convert Markdown to HTML
    html_content = markdown.markdown(md_content)

    # Parse HTML to extract text and preserve tables
    soup = BeautifulSoup(html_content, "html.parser")
    extracted_text = ""

    for tag in soup.find_all(["p", "table", "h1", "h2", "h3", "h4", "h5", "h6"]):
        if tag.name == "table":
            table_text = []
            for row in tag.find_all("tr"):
                cells = [cell.get_text(strip=True) for cell in row.find_all(["th", "td"])]
                table_text.append(" | ".join(cells))
            extracted_text += "\n".join(table_text) + "\n\n"
        else:
            extracted_text += tag.get_text() + "\n"

    return extracted_text.strip()

def process_contest(file_path):
    context = extract_text_from_markdown(file_path)
    return context


