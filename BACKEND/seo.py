# seo.py
import os
import graphene
from flask import Flask, jsonify, request, Response
from flask_graphql import GraphQLView
from flask_cors import CORS
import google.generativeai as genai
import time
import json
import re
import requests
from newspaper import Article
from urllib.parse import urlparse, quote_plus
import threading
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor
import random
from collections import deque
import uuid
from graphql.error import GraphQLError

# --- Gemini API Key (Declared at the top) ---
GEMINI_API_KEY_VALUE = os.environ.get("GEMINI_API_KEY", "AIzaSyCqWuv0AHNjrfFZygUceprVkxWE-_1jyqc")

# --- Configuration ---
class Config:
    GEMINI_API_KEY = GEMINI_API_KEY_VALUE

# --- Global Data Stores (Persist across requests) ---
initial_keywords_data = [] # List of dicts, each representing a keyword for the main dashboard view
suggested_keywords_data = {} # Dict: keyword_name -> list of suggestions
related_posts_data = {} # Dict: keyword_name -> list of related posts
platform_trend_data = {} # Dict: keyword_name -> list of platform trends

initial_recent_generations_list = []

# --- Job Status Storage ---
# Stores results for ongoing or completed background tasks
# Format: {job_id: {"status": "PENDING"|"COMPLETED"|"FAILED", "data": {"related_posts_map": {...}}, "timestamp": ...}}
background_jobs_status = {}
JOB_CLEANUP_INTERVAL_SECONDS = 3600 # Clean up old jobs every hour

# Simple in-memory cache for external fetching results (optional but good for repeated queries)
keyword_cache = {} # Stores {keyword: {"posts": [...], "trends": []}} for a short duration
CACHE_TTL_SECONDS = 3600 # Cache items for 1 hour
CACHE_MAX_SIZE = 50 # Max 50 keywords in cache (LRU-like)

# --- Mock Data ---
mock_transcripts_data = [
  {"id": "t1", "name": "Podcast Interview with SEO Expert", "content": "This transcript covers an interview about keyword research and content clusters. The expert mentioned the rising interest in AI-powered content generation tools like Jasper and Copy.ai, and how Google's BERT and MUM updates are changing keyword strategies. They also touched on the importance of E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) in recent ranking trends. There's a section on video SEO, mentioning YouTube shorts and TikTok's growing search capabilities."},
  {"id": "t2", "name": "Webinar on Google Algorithm Updates", "content": "A discussion on recent changes to Google's ranking factors, focusing heavily on the helpful content update and its impact on niche sites. The speaker emphasized the need for original research and deep dives. Core web vitals remain important, and there's a new focus on semantic search and natural language queries. They briefly discussed the emergence of generative AI in search results and the need for websites to provide unique value beyond what AI can synthesize."},
  {"id": "t3", "name": "Lecture: Future of AI in Marketing", "content": "Insights into how AI is transforming digital marketing strategies, from automated ad bidding to personalized customer experiences. The lecture highlighted predictive analytics for user behavior, AI-driven content optimization (e.g., using AI for headline testing), and the ethical implications of AI in data collection. It also explored the use of AI in chatbots for customer service and lead generation, and the potential for AI to optimize sales funnels."},
  {"id": "t4", "name": "Q&A Session: Local SEO Strategies", "content": "Answers to common questions about optimizing for local search, including Google Business Profile optimization, local citations, and geo-targeted content. The importance of local reviews and user-generated content was stressed. They also discussed voice search optimization for local businesses and emerging trends in 'near me' searches. The panel briefly touched on hyper-local content strategies for very specific geographic areas."},
] #

user_activity_trends_data = [
    {"name": "Day 1", "interactions": 10, "uploads": 3, "chats": 7},
    {"name": "Day 2", "interactions": 12, "uploads": 4, "chats": 8},
    {"name": "Day 3", "interactions": 8, "uploads": 2, "chats": 6},
    {"name": "Day 4", "interactions": 15, "uploads": 5, "chats": 10},
    {"name": "Day 5", "interactions": 11, "uploads": 3, "chats": 8},
    {"name": "Day 6", "interactions": 14, "uploads": 4, "chats": 10},
    {"name": "Day 7", "interactions": 16, "uploads": 5, "chats": 11},
] #

generation_type_breakdown_data = [
    {"name": "Transcripts", "value": 20},
    {"name": "Files", "value": 15},
    {"name": "YouTube", "value": 10},
    {"name": "Chat", "value": 55},
] #

# Simple lock for thread-safe access to mock data and job status
data_lock = threading.Lock() #

# Thread pool for CPU-bound tasks like newspaper3k parsing
executor = ThreadPoolExecutor(max_workers=os.cpu_count() or 4) #

# --- User-Agent Rotation ---
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/109.0.1518.78",
] #

def get_random_user_agent():
    return random.choice(USER_AGENTS) #


# --- Services (Gemini Integration) ---
class GeminiService:
    def __init__(self):
        if not GEMINI_API_KEY_VALUE or GEMINI_API_KEY_VALUE == "YOUR_GEMINI_API_KEY_HERE":
            print("WARNING: Gemini API Key not set or is default. AI generation will not work.")
            self.model = None
        else:
            genai.configure(api_key=GEMINI_API_KEY_VALUE)
            self.model = genai.GenerativeModel('gemini-2.5-flash')

    def generate_content(self, prompt: str):
        """Generates content using the Gemini API based on a prompt (non-streaming)."""
        if not self.model:
            return "AI model not initialized. Please set your Gemini API key."
        try:
            response = self.model.generate_content(
                prompt,
                safety_settings=[
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
                ]
            )
            if response.candidates:
                return response.candidates[0].content.parts[0].text
            elif response.prompt_feedback and response.prompt_feedback.block_reason:
                return f"AI response blocked: {response.prompt_feedback.block_reason.name}. Please try a different prompt."
            return "No content generated."
        except Exception as e:
            print(f"Error generating content with Gemini API: {e}")
            return f"An error occurred: {e}"

gemini_service = GeminiService() #

# --- External Data Fetching Functions ---

def _sync_fetch_preview(url):
    """
    Synchronously fetches article title and top image using newspaper3k.
    This function will be run in a ThreadPoolExecutor.
    Returns an empty string for 'image' if none is found or on error.
    Includes robust error handling and user-agent.
    """
    try:
        if not urlparse(url).scheme:
            url = "http://" + url
        article = Article(url, headers={'User-Agent': get_random_user_agent()}, fetch_images=False)
        article.download()
        article.parse()
        return {
            "title": article.title or "No Title Available",
            "image": article.top_image or "",
        }
    except requests.exceptions.RequestException as e:
        print(f"Network error fetching preview for {url}: {e}")
        return {
            "title": "Network Error",
            "image": "",
        }
    except Exception as e:
        print(f"Error parsing article for {url}: {e}")
        return {
            "title": "No Title Available",
            "image": "",
        }

async def fetch_preview_async(url):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, _sync_fetch_preview, url) #


async def get_related_posts_for_keyword(keyword: str):
    encoded_keyword = quote_plus(keyword)
    sources = [
        {
            "name": "Reddit",
            "url": f"https://www.reddit.com/search.json?q={encoded_keyword}&limit=3",
            "headers": {'User-agent': get_random_user_agent()},
            "parser": lambda r: [
                {
                    "title": item['data'].get('title', 'No Title'),
                    "link": f"https://reddit.com{item['data'].get('permalink', '')}",
                    "image": item['data'].get('thumbnail') if item['data'].get('thumbnail', '').startswith('http') else "",
                    "source": "Reddit"
                } for item in r.get('data', {}).get('children', [])
            ]
        },
        {
            "name": "Hacker News",
            "url": f"http://hn.algolia.com/api/v1/search?query={encoded_keyword}&tags=story&hitsPerPage=3",
            "headers": {'User-agent': get_random_user_agent()},
            "parser": lambda r: [
                {
                    "title": hit.get('title', 'No Title'),
                    "link": hit.get('url', ''),
                    "image": "",
                    "source": "Hacker News"
                } for hit in r.get('hits', [])[:3]
            ]
        },
        {
            "name": "Medium",
            "url": f"https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/tag/{encoded_keyword}",
            "headers": {'User-agent': get_random_user_agent()},
            "parser": lambda r: [
                {
                    "title": item.get('title', 'No Title'),
                    "link": item.get('link', ''),
                    "image": re.search(r'<img[^>]*src="([^"]*)"', item.get('content', '')).group(1) if re.search(r'<img[^>]*src="([^"]*)"', item.get('content', '')) else "",
                    "source": "Medium"
                } for item in r.get('items', [])[:3]
            ]
        }
    ] #

    all_posts = []
    async with aiohttp.ClientSession() as session:
        keyword_coroutine_pairs = [] # List to hold (keyword_name, coroutine)
        for source in sources:
            async def fetch_source(src):
                retries = 3
                for i in range(retries):
                    try:
                        # Increased timeout to 15 seconds
                        async with session.get(src["url"], headers=src["headers"], timeout=aiohttp.ClientTimeout(total=15)) as res:
                            res.raise_for_status()
                            data = await res.json()
                            parsed_items = src["parser"](data)
                            return parsed_items
                    except aiohttp.ClientResponseError as e:
                        if 400 <= e.status < 500: # Client error, likely not retriable (e.g., 422 Unprocessable Entity for Medium)
                            print(f"Client HTTP error from {src['name']} for keyword '{keyword}' (Status: {e.status}, Message: {e.message}). Skipping further retries for this source.")
                            # For 422 errors from Medium, specifically skip further retries
                            if src['name'] == 'Medium' and e.status == 422:
                                return []
                            return [] # Do not retry on other client errors
                        else: # Server error or other retriable HTTP error
                            print(f"Retriable HTTP error from {src['name']} for keyword '{keyword}' (Attempt {i+1}/{retries}): {e.status} {e.message}")
                            try:
                                response_text = await res.text()
                                print(f"Response content: {response_text[:200]}...") # Log response content for debugging
                            except Exception as text_err:
                                print(f"Could not read response text: {text_err}")
                            if i < retries - 1:
                                await asyncio.sleep(random.uniform(0.5 * (2 ** i), 0.75 * (2 ** i))) # Exponential backoff with jitter
                            else:
                                return []
                    except aiohttp.ClientError as e:
                        print(f"Network error fetching from {src['name']} for keyword '{keyword}' (Attempt {i+1}/{retries}): {e}")
                        if i < retries - 1:
                            await asyncio.sleep(random.uniform(0.5 * (2 ** i), 0.75 * (2 ** i))) # Exponential backoff with jitter
                        else:
                            return []
                    except Exception as e:
                        print(f"Unexpected error processing {src['name']} for keyword '{keyword}': {e}")
                        return []
                return []

            keyword_coroutine_pairs.append((source["name"], fetch_source(source))) # Store (source_name, coroutine)

        # Extract only the coroutines for asyncio.gather
        coroutines_to_gather = [pair[1] for pair in keyword_coroutine_pairs]
        results = await asyncio.gather(*coroutines_to_gather, return_exceptions=True) #

        image_fetch_tasks = []
        flattened_items = []
        for i, parsed_items_from_source in enumerate(results): # Iterate over results
            source_name = keyword_coroutine_pairs[i][0] # Get source name back
            if isinstance(parsed_items_from_source, Exception): # Handle exceptions from gather
                print(f"Error gathering results for {source_name}: {parsed_items_from_source}")
                continue

            for item in parsed_items_from_source:
                flattened_items.append(item)
                if not item.get("image") and item.get("link"):
                    image_fetch_tasks.append(fetch_preview_async(item["link"])) #

        if image_fetch_tasks:
            image_previews = await asyncio.gather(*image_fetch_tasks, return_exceptions=True) #
            
            current_image_preview_idx = 0
            for item in flattened_items:
                if not item.get("image") and item.get("link"):
                    if current_image_preview_idx < len(image_previews):
                        preview_result = image_previews[current_image_preview_idx]
                        if not isinstance(preview_result, Exception):
                            item["image"] = preview_result["image"]
                        current_image_preview_idx += 1
        
        all_posts = flattened_items

    return all_posts #

# Function to generate a more dynamic trend list
def generate_dynamic_trend(start_value=50, num_days=7, volatility=20, min_val=0, max_val=100):
    trend = [start_value]
    for _ in range(1, num_days):
        # Generate a random change (e.g., -volatility to +volatility)
        change = random.randint(-volatility, volatility)
        next_value = trend[-1] + change
        
        # Clamp the value within min_val and max_val
        next_value = max(min_val, min(max_val, next_value))
        
        trend.append(next_value)
    return trend #


def generate_dynamic_platform_trends_sync(keyword: str):
    """
    Synchronously generates plausible, dynamic platform trend scores for a keyword.
    This replaces the async version for initial response speed.
    """
    hash_val = sum(ord(char) for char in keyword.lower())
    
    blog_score = 60 + (hash_val % 40) # 60-99
    youtube_score = 50 + (hash_val % 50) # 50-99
    twitter_score = 40 + (hash_val % 60) # 40-99
    linkedin_score = 55 + (hash_val % 45) # 55-99

    return [
        {"platform": 'Blog', "score": blog_score},
        {"platform": 'YouTube', "score": youtube_score},
        {"platform": 'Twitter', "score": twitter_score},
        {"platform": 'LinkedIn', "score": linkedin_score},
    ] #

# --- Background Task Runner ---
def run_async_task_in_thread(coro):
    """Runs an async coroutine in a new event loop on a separate thread."""
    def run_loop():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(coro)
        finally:
            loop.close()
            asyncio.set_event_loop(None)

    thread = threading.Thread(target=run_loop)
    thread.daemon = True
    thread.start() #

# --- Job Cleanup (Optional) ---
def cleanup_old_jobs():
    global background_jobs_status
    with data_lock:
        keys_to_delete = [job_id for job_id, job_info in background_jobs_status.items()
                          if (time.time() - job_info.get("timestamp", 0)) > JOB_CLEANUP_INTERVAL_SECONDS]
        for key in keys_to_delete:
            del background_jobs_status[key]
            print(f"Cleaned up old job: {key}")
    threading.Timer(JOB_CLEANUP_INTERVAL_SECONDS, cleanup_old_jobs).start() #

cleanup_old_jobs() # Initial call to start the timer


# --- GraphQL Schema ---

class Keyword(graphene.ObjectType):
    id = graphene.ID()
    name = graphene.String()
    traffic = graphene.Int()
    trend = graphene.List(graphene.Int)
    prev_traffic = graphene.Int()
    suggestions = graphene.List(graphene.String) #

class SuggestedKeywords(graphene.ObjectType):
    keyword = graphene.String()
    suggestions = graphene.List(graphene.String) #

class RelatedPost(graphene.ObjectType):
    title = graphene.String()
    link = graphene.String()
    source = graphene.String()
    image = graphene.String() #

class PlatformTrend(graphene.ObjectType):
    platform = graphene.String()
    score = graphene.Int() #

class InitialSuggestedKeywords(graphene.ObjectType):
    keyword = graphene.String()
    suggestions = graphene.List(graphene.String) #

class InitialPlatformTrendsItem(graphene.ObjectType):
    keyword_name = graphene.String()
    trends = graphene.List(PlatformTrend) #

class InitialRelatedPostsItem(graphene.ObjectType):
    keyword_name = graphene.String()
    posts = graphene.List(RelatedPost) #

class AllDashboardData(graphene.ObjectType):
    keywords = graphene.List(Keyword)
    suggested = graphene.List(InitialSuggestedKeywords)
    platform_trends_initial = graphene.List(InitialPlatformTrendsItem)
    related_posts_initial = graphene.List(InitialRelatedPostsItem) #

class Transcript(graphene.ObjectType):
    id = graphene.ID()
    name = graphene.String()
    content = graphene.String() #

class RecentGeneration(graphene.ObjectType):
    id = graphene.ID()
    timestamp = graphene.Float()
    type = graphene.String()
    name = graphene.String() #

class UserActivityTrend(graphene.ObjectType):
    name = graphene.String()
    interactions = graphene.Int()
    uploads = graphene.Int()
    chats = graphene.Int() #

class GenerationTypeBreakdown(graphene.ObjectType):
    name = graphene.String()
    value = graphene.Int() #

# --- New types for partial/job-based response ---
class CoreDashboardData(graphene.ObjectType):
    # This represents the FAST initial data
    keywords_data = graphene.List(Keyword)
    platform_trends_map = graphene.List(graphene.List(PlatformTrend))
    primary_keyword_name = graphene.String() #

class DetailedJobResult(graphene.ObjectType):
    # This represents the SLOW additional data that comes later
    job_id = graphene.ID()
    status = graphene.String()
    # Change related_posts_map to a list of InitialRelatedPostsItem
    related_posts_map = graphene.List(InitialRelatedPostsItem) #

class ChatResponseWithJob(graphene.ObjectType):
    initial_data = graphene.Field(CoreDashboardData)
    job_id = graphene.ID() #

# --- GraphQL Query Definitions ---
class Query(graphene.ObjectType):
    hello = graphene.String(name=graphene.String(default_value="World"))
    get_all_dashboard_data = graphene.Field(AllDashboardData)
    get_mock_transcripts = graphene.List(Transcript)
    get_recent_generations = graphene.List(RecentGeneration)
    get_user_activity_trends = graphene.List(UserActivityTrend)
    get_generation_type_breakdown = graphene.List(GenerationTypeBreakdown)
    
    get_detailed_dashboard_job_result = graphene.Field(
        DetailedJobResult,
        job_id=graphene.ID(required=True)
    ) #

    def resolve_hello(root, info, name):
        return f"Hello, {name}!" #

    def resolve_get_all_dashboard_data(root, info):
        with data_lock:
            transformed_suggested = [
                InitialSuggestedKeywords(keyword=k, suggestions=v) for k, v in suggested_keywords_data.items()
            ]

            transformed_platform_trends_initial = []
            for keyword_dict in initial_keywords_data:
                keyword_name = keyword_dict["name"]
                if keyword_name in platform_trend_data:
                    transformed_platform_trends_initial.append(InitialPlatformTrendsItem(
                        keyword_name=keyword_name,
                        trends=[PlatformTrend(**t) for t in platform_trend_data[keyword_name]]
                    ))

            transformed_related_posts_initial = []
            for keyword_dict in initial_keywords_data:
                keyword_name = keyword_dict["name"]
                if keyword_name in related_posts_data:
                    transformed_related_posts_initial.append(InitialRelatedPostsItem(
                        keyword_name=keyword_name,
                        posts=[RelatedPost(**p) for p in related_posts_data[keyword_name]]
                    ))

            return AllDashboardData(
                keywords=[Keyword(id=k['id'], name=k['name'], traffic=k['traffic'], trend=k['trend'], prev_traffic=k['prev_traffic'], suggestions=k.get('suggestions', [])) for k in initial_keywords_data],
                suggested=transformed_suggested,
                platform_trends_initial=transformed_platform_trends_initial,
                related_posts_initial=transformed_related_posts_initial
            ) #

    def resolve_get_mock_transcripts(root, info):
        with data_lock:
            return [Transcript(**t) for t in mock_transcripts_data] #

    def resolve_get_recent_generations(root, info):
        with data_lock:
            return [RecentGeneration(**g) for g in initial_recent_generations_list] #

    def resolve_get_user_activity_trends(root, info):
        with data_lock:
            return [UserActivityTrend(**t) for t in user_activity_trends_data] #

    def resolve_get_generation_type_breakdown(root, info):
        with data_lock:
            return [GenerationTypeBreakdown(**t) for t in generation_type_breakdown_data] #

    def resolve_get_detailed_dashboard_job_result(root, info, job_id):
        with data_lock:
            job_info = background_jobs_status.get(job_id)
            if not job_info:
                return DetailedJobResult(job_id=job_id, status="NOT_FOUND", related_posts_map=[])
            
            status = job_info["status"]
            
            if status == "COMPLETED":
                data = job_info["data"]
                # MODIFICATION START: Return list of InitialRelatedPostsItem
                return DetailedJobResult(
                    job_id=job_id,
                    status=status,
                    related_posts_map=[InitialRelatedPostsItem(**item_data) for item_data in data['related_posts_map']]
                )
                # MODIFICATION END
            elif status == "PENDING":
                return DetailedJobResult(job_id=job_id, status=status, related_posts_map=[])
            elif status == "FAILED":
                return DetailedJobResult(job_id=job_id, status=status, related_posts_map=[]) #


# --- GraphQL Mutation Definitions ---
class SendChatMessage(graphene.Mutation):
    class Arguments:
        message = graphene.String(required=True)
        uploaded_transcripts_content = graphene.List(graphene.String)
        uploaded_files_content = graphene.List(graphene.String)
        youtube_url_info = graphene.Argument(graphene.String, default_value=None)

    Output = ChatResponseWithJob #

    def mutate(root, info, message, uploaded_transcripts_content=None, uploaded_files_content=None, youtube_url_info=None):
        # Create a new event loop for this mutation's synchronous parts
        # This is generally not needed if all blocking I/O is awaited or moved to threads.
        # However, keeping it for now if there are specific sync needs that require an event loop.
        current_mutation_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(current_mutation_loop)

        new_job_id = str(uuid.uuid4())
        with data_lock:
            background_jobs_status[new_job_id] = {"status": "PENDING", "timestamp": time.time(), "data": {}} #

        initial_dashboard_data = None
        all_unique_keywords_from_ai = []

        raw_gemini_response = ""
        try:
            # --- Part 1: Fast AI Response (Keywords, Suggestions, Platform Trends) ---
            full_context = []
            if message and message.strip():
                full_context.append(f"User query: {message.strip()}")
            if uploaded_transcripts_content:
                for i, content in enumerate(uploaded_transcripts_content):
                    full_context.append(f"Transcript {i+1} content: {content.strip()}")
            if uploaded_files_content:
                for i, content in enumerate(uploaded_files_content):
                    full_context.append(f"File {i+1} content: {content.strip()}")
            if youtube_url_info:
                try:
                    youtube_info_dict = json.loads(youtube_url_info)
                    youtube_url = youtube_info_dict.get("url")
                    youtube_name = youtube_info_dict.get("name", "YouTube Video")
                    full_context.append(f"YouTube video analysis request for '{youtube_name}' ({youtube_url}). The video content is about: [Summarize content from transcript if available, or ask AI to infer from title/description if not].")
                except json.JSONDecodeError:
                    print(f"Warning: Could not parse youtube_url_info: {youtube_url_info}")
                    full_context.append(f"YouTube URL provided: {youtube_url_info}")

            combined_context = "\n\n".join(full_context) if full_context else "User provided no specific content."

            consolidated_prompt = (
                f"You are an expert SEO content strategist. Based on the user's input and context, provide highly relevant SEO dashboard data. "
                f"Return your response as a single JSON object. The structure MUST be exactly as follows:\n"
                f"```json\n"
                f"{{\n"
                f"  \"dashboard_data\": {{\n"
                f"    \"primary_keyword\": \"<ONE primary, currently trending SEO keyword based on context,always as CamelCase words without space or any special character below 25 characters only.>\",\n"
                f"    \"related_keywords\": [\"<related_keyword_1>\", \"<related_keyword_2>\", ... (up to 9 more words if possible)],\n"
                f"    \"keywords_info\": [\n"
                f"      {{\n"
                f"        \"name\": \"<keyword_name>\",\n"
                f"        \"traffic\": <integer, 1000-150000>,\n"
                f"        \"prev_traffic\": <integer, +/-20% of traffic>,\n"
                f"        \"trend\": [<int, 20-100>, ..., <int, 7 days>],\n"
                f"        \"suggestions\": [\"<suggestion_1>\", \"<suggestion_2>\", \"<suggestion_3>\"]\n"
                f"      }},\n"
                f"      // ... up to 10 keyword_info objects (primary + related)\n"
                f"    ],\n"
                f"    \"platform_trends_map\": [\n"
                f"      [{{\"platform\": \"Blog\", \"score\": <int>}}, {{\"platform\": \"YouTube\", \"score\": <int>}}, {{\"platform\": \"Twitter\", \"score\": <int>}}, {{\"platform\": \"LinkedIn\", \"score\": <int>}}],\n" # Reverted to 4 platforms
                f"      // ... one array of trends for each keyword in keywords_info\n"
                f"    ]\n"
                f"  }}\n"
                f"}}\n"
                f"```\n"
                f"Ensure all placeholder values are replaced with realistic, but fictional, data relevant to the keywords. "
                f"The `suggestions` array for each keyword should contain 2-3 highly relevant alternative search terms. "
                f"The `platform_trends_map` should contain a trends array for each keyword listed in `keywords_info`, in the same order. "
                f"For the 'trend' values, generate a series of 7 integers between 20 and 100 that show noticeable day-to-day fluctuations, simulating real-world search volume volatility. "
                f"Do not include any other text or explanation outside of the JSON block.\n\n"
                f"Context for Analysis: {combined_context}\n"
                f"User Query: {message}\n"
                f"Begin your JSON response now:"
            ) #

            raw_gemini_response = gemini_service.generate_content(consolidated_prompt) #

            # --- Robust JSON parsing ---
            cleaned_response = raw_gemini_response.strip()
            
            # Use regex to find the JSON block. This is more resilient than string.startswith/endswith.
            json_match = re.search(r'```json\s*(\{.*\})\s*```', cleaned_response, re.DOTALL) #
            
            parsed_data = {}
            if json_match:
                json_string = json_match.group(1)
                try:
                    parsed_data = json.loads(json_string)
                except json.JSONDecodeError as e:
                    print(f"JSON Decode Error after regex extraction: {e}\nProblematic JSON string:\n{json_string}")
                    try:
                        parsed_data = json.loads(cleaned_response)
                        print("Successfully parsed direct cleaned_response after regex failed.")
                    except json.JSONDecodeError as e_direct:
                        raise ValueError(f"Failed to decode JSON from Gemini response: {e_direct}. Raw: {raw_gemini_response}")

            elif cleaned_response.startswith("{") and cleaned_response.endswith("}"):
                try:
                    parsed_data = json.loads(cleaned_response)
                except json.JSONDecodeError as e:
                    raise ValueError(f"Failed to decode JSON from Gemini response (direct parse): {e}. Raw: {raw_gemini_response}")
            else:
                raise ValueError(f"Gemini response did not contain a valid JSON block. Raw: {raw_gemini_response}")
            # --- End Robust JSON parsing ---

            dashboard_section = parsed_data.get("dashboard_data", {}) #

            extracted_primary_keyword_name = dashboard_section.get("primary_keyword") #
            related_keywords_from_ai = dashboard_section.get("related_keywords", []) #
            keywords_info_list = dashboard_section.get("keywords_info", []) #
            platform_trends_from_ai = dashboard_section.get("platform_trends_map", []) #

            if extracted_primary_keyword_name:
                all_unique_keywords_from_ai.append(extracted_primary_keyword_name)
            for kw in related_keywords_from_ai:
                if kw.lower() not in [k.lower() for k in all_unique_keywords_from_ai]:
                    all_unique_keywords_from_ai.append(kw)
            all_unique_keywords_from_ai = all_unique_keywords_from_ai[:10]

            generated_keywords_for_initial_response = []
            generated_platform_trends_for_initial_response = []

            with data_lock:
                initial_keywords_data.clear()
                suggested_keywords_data.clear()
                platform_trend_data.clear()

                for i, kw_name_original in enumerate(all_unique_keywords_from_ai):
                    kw_info = next((item for item in keywords_info_list if item.get("name", "").lower() == kw_name_original.lower()), None)
                    
                    new_keyword_entry = None
                    if kw_info:
                        new_keyword_entry = {
                            "id": str(uuid.uuid4()),
                            "name": kw_info.get("name"),
                            "traffic": kw_info.get("traffic", 0),
                            "prev_traffic": kw_info.get("prev_traffic", 0),
                            "trend": kw_info.get("trend", []),
                            "suggestions": kw_info.get("suggestions", [])
                        }
                    else:
                        print(f"Warning: Gemini did not provide detailed info for keyword '{kw_name_original}'. Generating mock data.")
                        generated_trend = generate_dynamic_trend(
                            start_value=random.randint(40, 70),
                            volatility=random.randint(10, 25),
                            min_val=10,
                            max_val=95
                        )
                        new_keyword_entry = {
                            "id": str(uuid.uuid4()),
                            "name": kw_name_original,
                            "traffic": int(time.time() % 10000 + 1000),
                            "prev_traffic": int(time.time() % 9000 + 500),
                            "trend": generated_trend,
                            "suggestions": [f"{kw_name_original} analysis", f"{kw_name_original} guide"]
                        }
                    
                    initial_keywords_data.append(new_keyword_entry)
                    generated_keywords_for_initial_response.append(Keyword(**new_keyword_entry))
                    suggested_keywords_data[kw_name_original] = new_keyword_entry["suggestions"]

                    # MODIFICATION START: Use synchronous platform trend generation for initial response
                    # If AI provided platform trends for this keyword, use it.
                    # Otherwise, generate dynamic ones synchronously.
                    platform_trends_for_this_keyword = []
                    if i < len(platform_trends_from_ai):
                        platform_trends_for_this_keyword = platform_trends_from_ai[i]
                    else:
                        # Fallback to synchronous dynamic generation if not provided by AI
                        platform_trends_for_this_keyword = generate_dynamic_platform_trends_sync(kw_name_original)
                        
                    platform_trend_data[kw_name_original] = platform_trends_for_this_keyword
                    generated_platform_trends_for_initial_response.append([PlatformTrend(**t) for t in platform_trends_for_this_keyword])
                    # MODIFICATION END


                initial_dashboard_data = CoreDashboardData(
                    keywords_data=generated_keywords_for_initial_response,
                    platform_trends_map=generated_platform_trends_for_initial_response,
                    primary_keyword_name=extracted_primary_keyword_name
                ) #

        except (json.JSONDecodeError, ValueError) as e:
            print(f"AI response parsing FAILED: {e}\nRaw response:\n{raw_gemini_response}")
            with data_lock:
                background_jobs_status[new_job_id]["status"] = "FAILED"
            raise GraphQLError(f"AI response format error: {e}. Please try again or refine your prompt. Raw: {raw_gemini_response[:500]}...")
        except Exception as e:
            print(f"General Error in mutate (initial part): {e}")
            with data_lock:
                background_jobs_status[new_job_id]["status"] = "FAILED"
            raise GraphQLError(f"An unexpected error occurred during AI analysis: {e}")
        finally:
            # Ensure the loop is closed if it was created
            if current_mutation_loop and not current_mutation_loop.is_running():
                current_mutation_loop.close()
            asyncio.set_event_loop(None)


        # --- Part 2: Asynchronous Background Task (ONLY Related Posts) ---
        async def background_processing_task(job_id, keywords_list_to_process):
            current_loop = asyncio.new_event_loop()
            asyncio.set_event_loop(current_loop)
            
            try:
                # This list will store tuples of (keyword_name, coroutine)
                keyword_coroutine_pairs = [] 
                for kw_name_original in keywords_list_to_process:
                    cached_data = keyword_cache.get(kw_name_original)
                    if cached_data and (time.time() - cached_data['timestamp']) < CACHE_TTL_SECONDS and 'posts' in cached_data:
                        with data_lock:
                            if kw_name_original not in related_posts_data:
                                related_posts_data[kw_name_original] = cached_data['posts']
                        pass # Use cached data, no need to fetch
                    else:
                        # Store the keyword name along with the coroutine object
                        keyword_coroutine_pairs.append((kw_name_original, get_related_posts_for_keyword(kw_name_original)))

                if keyword_coroutine_pairs:
                    # Extract only the coroutines to pass to asyncio.gather
                    coroutines_to_gather = [pair[1] for pair in keyword_coroutine_pairs]
                    fetched_posts_results = await asyncio.gather(*coroutines_to_gather, return_exceptions=True) #

                    # Iterate over the original (keyword_name, coroutine) pairs to match results
                    for i, (kw_name_original, _) in enumerate(keyword_coroutine_pairs):
                        fetched_posts = fetched_posts_results[i]
                        if isinstance(fetched_posts, Exception): # Handle exceptions from the gathered coroutines
                            print(f"Background error fetching posts for '{kw_name_original}': {fetched_posts}")
                            fetched_posts = [] # Assign empty list on error
                        
                        with data_lock:
                            related_posts_data[kw_name_original] = fetched_posts
                            current_cache_entry = keyword_cache.get(kw_name_original, {})
                            current_cache_entry['posts'] = fetched_posts
                            current_cache_entry['timestamp'] = time.time()
                            keyword_cache[kw_name_original] = current_cache_entry

                            if len(keyword_cache) > CACHE_MAX_SIZE:
                                oldest_key = min(keyword_cache, key=lambda k: keyword_cache[k]['timestamp'])
                                del keyword_cache[oldest_key]
                
                final_job_related_posts_map = []
                with data_lock:
                    for kw_name_original in keywords_list_to_process:
                        final_job_related_posts_map.append({
                            "keyword_name": kw_name_original,
                            "posts": related_posts_data.get(kw_name_original, [])
                        })

                    background_jobs_status[job_id]["status"] = "COMPLETED" #
                    background_jobs_status[job_id]["data"] = {
                        "related_posts_map": final_job_related_posts_map # Now it's a list of objects with keywordName and posts
                    }
            except Exception as e:
                print(f"Background processing task FAILED for job {job_id}: {e}")
                with data_lock:
                    background_jobs_status[job_id]["status"] = "FAILED" #
            finally:
                current_loop.close()
                asyncio.set_event_loop(None)

        run_async_task_in_thread(background_processing_task(new_job_id, all_unique_keywords_from_ai)) #

        with data_lock:
            generation_type = "chat"
            item_name = message[:30] + ('...' if len(message) > 30 else '')
            if uploaded_transcripts_content:
                generation_type = "transcript"
                item_name = f"Transcripts ({len(uploaded_transcripts_content)})"
            elif uploaded_files_content:
                generation_type = "file"
                item_name = f"Files ({len(uploaded_files_content)})"
            elif youtube_url_info:
                try:
                    info_dict = json.loads(youtube_url_info)
                    item_name = info_dict.get("name", "YouTube Video")
                except json.JSONDecodeError:
                    item_name = "YouTube Video"

            initial_recent_generations_list.append({
                "id": f"{generation_type}_{int(time.time())}",
                "timestamp": time.time() * 1000,
                "type": generation_type,
                "name": item_name
            })
        
        return ChatResponseWithJob(initial_data=initial_dashboard_data, job_id=new_job_id) #


class Mutation(graphene.ObjectType):
    send_chat_message = SendChatMessage.Field() #


# --- GraphQL Schema Setup ---
schema = graphene.Schema(query=Query, mutation=Mutation) #


# --- Flask Application Setup ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://just-speak-nine.vercel.app", "http://localhost:5173", "http://localhost:3000"]}}, supports_credentials=True) #

app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True, batch=True)
) #


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "service": "seo_service"}), 200

@app.route('/')
def index():
    return "Welcome to the SEO Assistant Backend! Access the GraphQL API at /graphql." #

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    app.run(debug=True, port=port, use_reloader=False) #