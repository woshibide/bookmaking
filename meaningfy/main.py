import logging
from api import key
from openai import OpenAI
import tiktoken
import os
import time
import random

client = OpenAI(api_key=key)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)

# Save processed text to a file
def save_text(file_path, content):
    with open(file_path, "w") as f:
        f.write(content)

# Create chunks with proper memory and error handling
def create_chunks(text, n, tokenizer):
    tokens = tokenizer.encode(text)
    i = 0
    while i < len(tokens):
        # Find the nearest end of sentence within a range
        j = min(i + int(1.5 * n), len(tokens))
        while j > i + int(0.5 * n):
            chunk = tokenizer.decode(tokens[i:j])
            if chunk.endswith(".") or chunk.endswith("\n"):
                break
            j -= 1
        if j == i + int(0.5 * n):
            j = min(i + n, len(tokens))
        yield tokenizer.decode(tokens[i:j])
        i = j  # Move to the next position

# Extract chunk with improved error handling and rate limiting
def extract_chunk(chunk, template_prompt):
    max_retries = 5
    base_delay = 1  # Base delay in seconds
    
    for attempt in range(max_retries):
        try:
            prompt = template_prompt.replace("<document>", chunk)
            messages = [
                {"role": "system", "content": "You help reformat text into structured LaTeX format."},
                {"role": "user", "content": prompt}
            ]
            response = client.chat.completions.create(
                # model="gpt-3.5-turbo",
                model="gpt-4o-mini",
                messages=messages,
                temperature=0,
                max_tokens=1500,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            return response.choices[0].message.content
        
        except Exception as e:
            logging.error(f"Error processing chunk (Attempt {attempt + 1}/{max_retries}): {e}")
            
            # If it's a rate limit error, implement exponential backoff
            if "429" in str(e):
                delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                logging.info(f"Rate limited. Waiting {delay:.2f} seconds before retrying...")
                time.sleep(delay)
            else:
                # For non-rate limit errors, wait a shorter time
                time.sleep(1)
    
    # If all retries fail
    return f"% Error processing chunk after {max_retries} attempts"



# Template prompt for AI
template_prompt = """
The following text is a raw transcript of an interview, where two women (Lee Davidson and Joni Blank) are being interviewed by another woman (Susanne Snyder). Format it in LaTeX syntax. Add speaker identifiers (e.g., \\textbf{Susanne Snyder}, \\textbf{Joni Blank}, \\textbf{Lee Davidson}), insert paragraph breaks, punctuation symbols, italicize whats important, make footnotes, make sure text is ready to typeset, and fix incoherent sentences. Ensure the LaTeX output is clean, follows the Chicago Manual of Style and ready to be typesetted. Here is the text:
<document>
"""

# Initialize tokenizer
tokenizer = tiktoken.get_encoding("cl100k_base")

def load_text(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def main(input_file, output_file):
    raw_text = load_text(input_file)
    logging.info("Loaded text...")

    clean_text = raw_text.strip().replace("\r\n", " ").replace("\n", " ")

    # Convert generator to list for length calculation
    chunks = list(create_chunks(clean_text, 1000, tokenizer))
    logging.info(f"Created {len(chunks)} chunks for processing.")

    results = []
    for idx, chunk in enumerate(chunks):
        logging.info(f"Processing chunk {idx + 1}/{len(chunks)}...")
        result = extract_chunk(chunk, template_prompt)
        results.append(result)

        # Save intermediate results to avoid data loss
        temp_output = "\n\n".join(results)
        save_text(f"temp_{output_file}", temp_output)

    final_output = "\n\n".join(results)
    save_text(output_file, final_output)
    logging.info(f"Processing complete. Output saved to {output_file}")


if __name__ == "__main__":
    input_file = "text.txt"  # Input raw transcript
    output_file = "formatted_output.tex"  # Output file in LaTeX syntax
    main(input_file, output_file)
