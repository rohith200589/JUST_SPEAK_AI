# post.py
import asyncio
import concurrent.futures
import json
import google.generativeai as genai
import os
from typing import Dict, Any, List, Union, Optional
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import PyPDF2
from docx import Document
import io
import requests
import base64
import time
import sys
import logging
import graphene
from flask_graphql import GraphQLView

# --- Flask app initialization and configuration ---
app = Flask(__name__)
CORS(app, origins=["*", "https://just-speak-nine.vercel.app"])

@app.route('/')
def index():
    return "Post Service is running!"

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "service": "post_service"}), 200

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

DEVTO_API_KEY = os.environ.get("DEVTO_API_KEY", "juq3WdgTVqkGYWJ8kj41LvWj")
if not DEVTO_API_KEY:
    print("WARNING: DEVTO_API_KEY environment variable not set. Dev.to posting will not work.")

# --- Gemini API Setup ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyCqWuv0AHNjrfFZygUceprVkxWE-_1jyqc")
if not GEMINI_API_KEY:
    logging.error("GEMINI_API_KEY is not set.")
    raise RuntimeError("GEMINI_API_KEY is not set.")
genai.configure(api_key=GEMINI_API_KEY)

# Use a thread pool executor for running synchronous Gemini calls in an async context
executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)
model = genai.GenerativeModel('gemini-2.5-flash')

# --- Helper function for fetching content from AI model ---
def _call_gemini_api_sync(prompt: str, post_type: str) -> str:
    """Helper to call the synchronous Gemini API with retry logic and content handling."""
    retries = 3
    base_delay = 1
    for i in range(retries):
        try:
            response = model.generate_content(prompt)
            if not response or not response.candidates:
                logging.warning(f"API response for {post_type} was empty. Attempt {i+1} of {retries}.")
                time.sleep(base_delay * (2 ** i))
                continue
            
            full_text = "".join(part.text for part in response.candidates[0].content.parts)
            
            if not full_text:
                logging.warning(f"API response for {post_type} did not contain text content. Attempt {i+1} of {retries}.")
                time.sleep(base_delay * (2 ** i))
                continue
                 
            return full_text
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 503 and i < retries - 1:
                logging.warning(f"503 Service Unavailable for {post_type}. Retrying in {base_delay * (2 ** i)} seconds...")
                time.sleep(base_delay * (2 ** i))
            else:
                logging.error(f"Error generating {post_type} content: {e}", exc_info=True)
                return ""
        except Exception as e:
            logging.error(f"An unexpected error occurred for {post_type}: {e}", exc_info=True)
            return ""
    
    logging.error(f"Failed to generate content for {post_type} after {retries} retries.")
    return ""

# --- Individual Post Generation Functions with Modified Prompts ---


# In post.py - Fix the generation functions to properly use options

def generate_blog_post(user_prompt: str, options: dict, all_content_sources: str) -> str:
    """Generates a detailed blog post with Markdown-formatted backlinks, optimized for SEO."""
    
    # Extract options safely with fallbacks
    blog_options = options.get('Blog', {})
    all_options = options.get('All', {})
    
    # Use specific blog options first, then fall back to 'All' options, then defaults
    tone = blog_options.get('toneStyle', all_options.get('toneStyle', 'Informative'))
    word_count = blog_options.get('wordCount', all_options.get('wordCount', 1000))
    keywords = blog_options.get('focusKeywords', all_options.get('focusKeywords', 'SEO, content creation'))
    audience = blog_options.get('targetAudience', all_options.get('targetAudience', 'General'))
    language = blog_options.get('language', all_options.get('language', 'English'))
    formality = blog_options.get('formality', all_options.get('formality', 70))
    creativity = blog_options.get('creativityLevel', all_options.get('creativityLevel', 60))
    
    prompt_template = f"""
    You are a skilled content creator. Generate a compelling, high-quality blog post based on the following user request and source material. The post should be in a competition-winning format, with a humanized tone and excellent SEO.

    Source Material:
    ---
    {all_content_sources}
    ---

    User's primary request:
    ---
    {user_prompt}
    ---

    Constraints:
    - Post Type: Blog Post
    - Language: {language}
    - Tone: {tone}
    - Formality Level: {formality}% (0=very casual, 100=very formal)
    - Creativity Level: {creativity}% (0=very structured, 100=very creative)
    - Word Count: Up to {word_count} words
    - Keywords: {keywords}
    - Audience: {audience}
    - Include relevant emojis where appropriate (not like a chatbot).
    - **Backlinks**: Include valid backlinks using Markdown syntax like [Text to display](https://example.com). Use only main, top-level URLs (e.g., `https://domain.com/blog`) to ensure the links are reliable and not deep, ephemeral pages that might return a 404 error. The URLs must be functional and relevant.

    Generate the full content of the blog post. Do not include any extra commentary.
    """
    return _call_gemini_api_sync(prompt_template, "Blog")

def generate_linkedin_post(user_prompt: str, options: dict, all_content_sources: str) -> str:
    """Generates a professional LinkedIn post with Markdown-formatted backlinks, optimized for SEO."""
    
    # Extract options safely with fallbacks
    linkedin_options = options.get('LinkedIn', {})
    all_options = options.get('All', {})
    
    tone = linkedin_options.get('toneStyle', all_options.get('toneStyle', 'Professional'))
    char_count = linkedin_options.get('characterCount', all_options.get('characterCount', 600))
    audience = linkedin_options.get('targetAudience', all_options.get('targetAudience', 'Professionals'))
    language = linkedin_options.get('language', all_options.get('language', 'English'))
    formality = linkedin_options.get('formality', all_options.get('formality', 80))
    creativity = linkedin_options.get('creativityLevel', all_options.get('creativityLevel', 40))
    keywords = linkedin_options.get('focusKeywords', all_options.get('focusKeywords', 'professional, networking'))
    
    prompt_template = f"""
    You are a skilled content creator. Generate a professional and engaging LinkedIn post based on the following user request and source material. The post should be in a competition-winning format, with a humanized tone and excellent SEO.

    Source Material:
    ---
    {all_content_sources}
    ---

    User's primary request:
    ---
    {user_prompt}
    ---

    Constraints:
    - Post Type: LinkedIn Post
    - Language: {language}
    - Tone: {tone}
    - Formality Level: {formality}% (0=very casual, 100=very formal)
    - Creativity Level: {creativity}% (0=very structured, 100=very creative)
    - Character Count: Up to {char_count} characters
    - Keywords: {keywords}
    - Audience: {audience}
    - Include relevant hashtags at the end.
    - Include relevant emojis where appropriate (not like a chatbot).
    - **Backlinks**: Include valid backlinks using Markdown syntax like [Text to display](https://example.com). Use only main, top-level URLs (e.g., `https://domain.com/blog`) to ensure the links are reliable and not deep, ephemeral pages that might return a 404 error. The URLs must be functional and relevant.

    Generate the full content of the LinkedIn post. Do not include any extra commentary.
    """
    return _call_gemini_api_sync(prompt_template, "LinkedIn")

def generate_newsletter_post(user_prompt: str, options: dict, all_content_sources: str) -> str:
    """Generates a concise newsletter segment with Markdown-formatted backlinks, optimized for SEO."""
    
    # Extract options safely with fallbacks
    newsletter_options = options.get('Newsletter', {})
    all_options = options.get('All', {})
    
    tone = newsletter_options.get('toneStyle', all_options.get('toneStyle', 'Friendly'))
    char_count = newsletter_options.get('characterCount', all_options.get('characterCount', 200))
    audience = newsletter_options.get('targetAudience', all_options.get('targetAudience', 'Subscribers'))
    language = newsletter_options.get('language', all_options.get('language', 'English'))
    formality = newsletter_options.get('formality', all_options.get('formality', 60))
    creativity = newsletter_options.get('creativityLevel', all_options.get('creativityLevel', 70))
    keywords = newsletter_options.get('focusKeywords', all_options.get('focusKeywords', 'newsletter, updates'))
    
    prompt_template = f"""
    You are a skilled content creator. Generate a concise and friendly newsletter segment based on the following user request and source material. The post should be in a competition-winning format, with a humanized tone and excellent SEO.

    Source Material:
    ---
    {all_content_sources}
    ---

    User's primary request:
    ---
    {user_prompt}
    ---

    Constraints:
    - Post Type: Newsletter Segment
    - Language: {language}
    - Tone: {tone}
    - Formality Level: {formality}% (0=very casual, 100=very formal)
    - Creativity Level: {creativity}% (0=very structured, 100=very creative)
    - Character Count: Up to {char_count} characters
    - Keywords: {keywords}
    - Audience: {audience}
    - Include relevant emojis where appropriate (not like a chatbot).
    - **Backlinks**: Include valid backlinks using Markdown syntax like [Text to display](https://example.com). Use only main, top-level URLs (e.g., `https://domain.com/blog`) to ensure the links are reliable and not deep, ephemeral pages that might return a 404 error. The URLs must be functional and relevant.

    Generate the full content, including a clear subject line at the very top, formatted as 'Subject: [Your Subject Line]'. Do not include any extra commentary.
    """
    return _call_gemini_api_sync(prompt_template, "Newsletter")

def generate_twitter_post(user_prompt: str, options: dict, all_content_sources: str) -> str:
    """Generates a brief and concise Twitter (X) post with Markdown-formatted backlinks, optimized for SEO."""
    
    # Extract options safely with fallbacks
    twitter_options = options.get('Twitter', {})
    all_options = options.get('All', {})
    
    tone = twitter_options.get('toneStyle', all_options.get('toneStyle', 'Concise'))
    char_count = twitter_options.get('characterCount', all_options.get('characterCount', 100))
    audience = twitter_options.get('targetAudience', all_options.get('targetAudience', 'General'))
    language = twitter_options.get('language', all_options.get('language', 'English'))
    formality = twitter_options.get('formality', all_options.get('formality', 40))
    creativity = twitter_options.get('creativityLevel', all_options.get('creativityLevel', 80))
    keywords = twitter_options.get('focusKeywords', all_options.get('focusKeywords', 'trending, social'))
    
    prompt_template = f"""
    You are a skilled content creator. Generate a brief and concise Twitter (X) post based on the following user request and source material. The post should be in a competition-winning format, with a humanized tone and excellent SEO.

    Source Material:
    ---
    {all_content_sources}
    ---

    User's primary request:
    ---
    {user_prompt}
    ---

    Constraints:
    - Post Type: Twitter Post
    - Language: {language}
    - Tone: {tone}
    - Formality Level: {formality}% (0=very casual, 100=very formal)
    - Creativity Level: {creativity}% (0=very structured, 100=very creative)
    - Character Count: Up to {char_count} characters
    - Keywords: {keywords}
    - Audience: {audience}
    - Use relevant hashtags.
    - Include relevant emojis where appropriate (not like a chatbot).
    - **Backlinks**: Include valid backlinks using Markdown syntax like [Text to display](https://example.com). Use only main, top-level URLs (e.g., `https://domain.com/blog`) to ensure the links are reliable and not deep, ephemeral pages that might return a 404 error. The URLs must be functional and relevant.

    Generate the full content of the tweet. Do not include any extra commentary.
    """
    return _call_gemini_api_sync(prompt_template, "Twitter")

# Also add debug logging to the main endpoint
@app.route("/generate-posts", methods=['POST'])
def generate_posts_sync():
    """
    Synchronous endpoint for generating posts. To be wrapped by async handler.
    This function processes the request and dispatches tasks to the executor.
    """
    if not request.is_json:
        return jsonify({"message": "Request must be JSON"}), 400

    request_data = request.get_json()
    required_keys = ['prompt', 'generation_options']
    if not all(key in request_data for key in required_keys):
        return jsonify({"message": "Missing required keys: 'prompt' or 'generation_options'"}), 400

    prompt = request_data.get('prompt', '')
    generation_options = request_data.get('generation_options', {})
    selected_transcripts = request_data.get('selected_transcripts', [])
    attached_files = request_data.get('attached_files', [])
    youtube_file = request_data.get('youtube_file')

    # DEBUG: Log received options
    logging.info(f"Received generation options: {generation_options}")
    
    # Validate generation options structure
    if not isinstance(generation_options, dict):
        return jsonify({"message": "generation_options must be a dictionary"}), 400

    all_content_sources = ""
    for t in selected_transcripts:
        all_content_sources += t.get('content', '') + "\n\n"
        
    for f in attached_files:
        try:
            parsed_content = parse_document_content(f.get('content', ''), f.get('name', ''))
            all_content_sources += f"--- Content from file '{f.get('name', '')}' ---\n{parsed_content}\n---\n\n"
        except Exception as e:
            logging.error(f"Failed to parse file '{f.get('name', '')}': {e}", exc_info=True)
            return jsonify({"message": f"Failed to parse file '{f.get('name', '')}': {str(e)}"}), 422

    if youtube_file:
        try:
            video_id = youtube_file.get('url', '').split("v=")[-1]
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            full_transcript_text = " ".join([t['text'] for t in transcript])
            all_content_sources += f"--- YouTube Video Transcript ---\n{full_transcript_text}\n---\n"
        except Exception as e:
            logging.error(f"Error fetching YouTube transcript for URL {youtube_file.get('url', '')}: {e}", exc_info=True)
            return jsonify({"message": "Error fetching YouTube transcript. Please check the URL or try again later."}), 500

    # Submit synchronous tasks to the thread pool executor
    future_blog = executor.submit(generate_blog_post, prompt, generation_options, all_content_sources)
    future_linkedin = executor.submit(generate_linkedin_post, prompt, generation_options, all_content_sources)
    future_newsletter = executor.submit(generate_newsletter_post, prompt, generation_options, all_content_sources)
    future_twitter = executor.submit(generate_twitter_post, prompt, generation_options, all_content_sources)
    
    # Wait for all tasks to complete and retrieve results
    try:
        results = [
            future_blog.result(),
            future_linkedin.result(),
            future_newsletter.result(),
            future_twitter.result()
        ]
    except Exception as e:
        logging.error("An error occurred while getting results from executor.", exc_info=True)
        return jsonify({"message": "An unexpected error occurred during post generation."}), 500
        
    response_data = {
        "blog": results[0],
        "linkedin": results[1],
        "newsletter": results[2],
        "twitter": results[3],
    }

    if not any(response_data.values()):
        return jsonify({"message": "Failed to generate any content. Please check your prompt and try again."}), 500

    return jsonify(response_data)

# --- Document Parsing Helper Functions ---
def parse_document_content(file_content: str, file_name: str) -> str:
    """
    Parses the content of an uploaded file from a Base64 string.
    """
    file_extension = os.path.splitext(file_name)[1].lower()
    
    try:
        if ',' in file_content:
            header, base64_data = file_content.split(',', 1)
        else:
            base64_data = file_content
        file_bytes = base64.b64decode(base64_data)
    except Exception as e:
        logging.error(f"Failed to decode Base64 content for file {file_name}: {e}")
        raise ValueError(f"Failed to decode Base64 content: {e}")

    if file_extension == '.txt':
        try:
            return file_bytes.decode('utf-8')
        except UnicodeDecodeError:
            return file_bytes.decode('latin-1')
    elif file_extension == '.pdf':
        try:
            pdf_file = io.BytesIO(file_bytes)
            reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page_num in range(len(reader.pages)):
                text += reader.pages[page_num].extract_text() or ""
            return text
        except Exception as e:
            logging.error(f"Error extracting text from PDF {file_name}: {e}", exc_info=True)
            raise RuntimeError(f"Error extracting text from PDF: {e}")
    elif file_extension == '.docx':
        try:
            docx_file = io.BytesIO(file_bytes)
            doc = Document(docx_file)
            text = ""
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text
        except Exception as e:
            logging.error(f"Error extracting text from DOCX {file_name}: {e}", exc_info=True)
            raise RuntimeError(f"Error extracting text from DOCX: {e}")
    else:
        try:
            return file_bytes.decode('utf-8', errors='ignore')
        except Exception:
            return ""

# --- API Endpoints ---

# FIX: Add a general error handler for any uncaught exceptions
@app.errorhandler(Exception)
def handle_uncaught_exception(e):
    app.logger.error('An unhandled exception occurred during request processing.', exc_info=e)
    return jsonify({"message": "Internal Server Error", "details": "An unexpected error occurred."}), 500

class PostBlogToDevTo(graphene.Mutation):
    """Mutation to post a blog to Dev.to."""
    class Arguments:
        title = graphene.String(required=True)
        content = graphene.String(required=True)
        tags = graphene.List(graphene.String)
        published = graphene.Boolean()

    # CORRECTED: Define the output field(s) directly on the mutation class
    blog_url = graphene.String() # This will be the URL returned on success
    # You could add more fields if needed, e.g.:
    # success = graphene.Boolean()
    # message = graphene.String()

    def mutate(root, info, title, content, tags=None, published=True):
        if not DEVTO_API_KEY:
            print("ERROR: Dev.to API key not configured. Please set DEVTO_API_KEY in backend.")
            # Return an instance of the mutation class itself
            return PostBlogToDevTo(blog_url="Error: Dev.to API key not configured. Please set DEVTO_API_KEY in backend.")

        devto_url = "https://dev.to/api/articles"
        headers = {
            "Content-Type": "application/json",
            "api-key": DEVTO_API_KEY
        }
        payload = {
            "article": {
                "title": title,
                "body_markdown": content,
                "published": published,
                "tags": tags if tags is not None else ['ai', 'content_generation', 'justspeak'],
            }
        }

        try:
            print(f"DEBUG: Attempting to POST to Dev.to: {devto_url}")
            print(f"DEBUG: Headers (excluding API key): { {k: v for k, v in headers.items() if k != 'api-key'} }")
            print(f"DEBUG: Payload keys: {payload['article'].keys()}")

            response = requests.post(devto_url, headers=headers, json=payload)

            print(f"DEBUG: Dev.to API raw response status code: {response.status_code}")
            print(f"DEBUG: Dev.to API raw response headers: {response.headers}")
            print(f"DEBUG: Dev.to API raw response text (first 500 chars): {response.text[:500]}")

            response.raise_for_status() # Raises HTTPError for 4xx/5xx responses

            try:
                devto_response = response.json()
            except json.JSONDecodeError:
                error_msg = f"Dev.to returned non-JSON response (Status: {response.status_code}). Body: {response.text[:200]}..."
                print(f"ERROR: {error_msg}")
                # Return an instance of the mutation class itself
                return PostBlogToDevTo(blog_url=f"Error: {error_msg}")

            if response.status_code == 201:
                blog_url = devto_response.get("url")
                if blog_url:
                    print(f"Blog posted successfully to Dev.to: {blog_url}")
                    # Return an instance of the mutation class itself with the blog_url
                    return PostBlogToDevTo(blog_url=blog_url)
                else:
                    error_msg = devto_response.get("error", "Dev.to did not return a blog URL despite 201 status.")
                    print(f"ERROR: {error_msg}")
                    # Return an instance of the mutation class itself
                    return PostBlogToDevTo(blog_url=f"Error: {error_msg}")
            else:
                error_message = devto_response.get("error", devto_response.get("errors", "Unknown Dev.to API error"))
                print(f"Failed to post blog to Dev.to with status {response.status_code}: {error_message}")
                # Return an instance of the mutation class itself
                return PostBlogToDevTo(blog_url=f"Error: Dev.to API returned status {response.status_code}: {error_message}")

        except requests.exceptions.HTTPError as e:
            print(f"DEBUG: requests.exceptions.HTTPError occurred: {e}")
            if e.response is not None:
                error_details = e.response.text if e.response.text else "No specific text in response."
                print(f"DEBUG: e.response.status_code: {e.response.status_code}")
                print(f"DEBUG: e.response.headers: {e.response.headers}")
                print(f"DEBUG: e.response.text: {error_details}")
            else:
                error_details = "No response object attached to HTTPError. Possible connection issue before response."
                print(f"DEBUG: {error_details}")
            # Return an instance of the mutation class itself
            return PostBlogToDevTo(blog_url=f"HTTP Error from Dev.to ({e.response.status_code if e.response else 'N/A'}): {error_details[:200]}...")
        except requests.exceptions.ConnectionError as e:
            print(f"DEBUG: requests.exceptions.ConnectionError occurred: {e}")
            print(f"Connection error posting to Dev.to: {e}")
            # Return an instance of the mutation class itself
            return PostBlogToDevTo(blog_url=f"Connection Error: {str(e)}")
        except Exception as e:
            print(f"DEBUG: An unexpected error occurred in mutate: {e}")
            print(f"An unexpected error occurred while posting to Dev.to: {e}")
            # Return an instance of the mutation class itself
            return PostBlogToDevTo(blog_url=f"Unexpected Server Error: {str(e)}")

class RootMutation(graphene.ObjectType):
    """Root GraphQL Mutation type."""
    post_blog_to_dev_to = PostBlogToDevTo.Field()

# Define the GraphQL schema using your RootMutation
schema = graphene.Schema(mutation=RootMutation)

# Add the GraphQL endpoint to your Flask app
app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True  # Enables the GraphiQL browser UI for testing
    )
)

# --- Entry point for local development ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="0.0.0.0", port=port, debug=True, threaded=True)