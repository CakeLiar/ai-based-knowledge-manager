import sys
import requests
import openai
import os
from bs4 import BeautifulSoup
import random

from flask import Flask, request
from flask_cors import CORS, cross_origin

# Get API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")

# Set the API key
openai.api_key = api_key

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

def check_website(_html):
    # Check if the website is a valid website
    res = openai.chat.completions.create(
        model='gpt-3.5-turbo-16k',
        messages=[
            {'role': 'system', 'content': 'Explain the following website, make headlines and summary. classify it and write exactly either [cool businesses], [articles to read] or [self development tips]'},
            {'role': 'user', 'content': _html},
    ])
    return res.choices[0].message.content

def scrape_website(url):
    req = requests.get(url)
    r = check_website(req.text)
    print(r)

@app.route("/get-website-info", methods=['GET'])
@cross_origin()
def get_data_from_website():
    final_image = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx0f7xGUzQQ3rriKMmGuk9NYgGtWNJ6z4M6Q&s'
    final_snippet = 'nice website'

    try:
        print(
            'got request for url: {}'.format(request.args['url']), file=sys.stderr
        )
        url = request.args['url']
        response = requests.get(url)
        soup = BeautifulSoup(response.content, "html.parser")
        text = soup.get_text(separator=' ').replace('\n', ' ').replace('\t', ' ').replace('  ', '')
        snippet = text[0:80]
        snippet = snippet.replace("\n", " ")
        snippet = snippet.replace("  ", " ")
        snippet = snippet.replace("\t", " ")
        
        if len(text) > 80:
            snippet += "..."

        final_snippet = snippet
        
    except Exception as e:
        print(e, file=sys.stderr)
    
    try:
        image_tags = soup.find_all('img')

        print(image_tags, file=sys.stderr)

        # Extract the src attributes of image tags that are online URLs
        images = [img['src'] for img in image_tags if img.get('src', '').startswith(('http://', 'https://'))]

        final_image = random.choice(images)

        if not images:
            Exception("No images found")
    except Exception as e:
        print(e, file=sys.stderr)

    

    return [final_image, final_snippet]

if __name__ == "__main__":
    app.run(host="localhost", port='8080', debug=True)