import os
import json
import sys
# Ensure project root is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from BACKEND.gemini_utils import _strip_code_fences_and_markdown, _extract_first_json, _save_raw_gemini_response

samples = {
    'metrics_wrapped': '```json\n[\n    {\n        "title": "Trend Score",\n        "value": "88",\n        "change": "+5.2%",\n        "changeType": "positive"\n    }\n]\n```',
    'rephrase_truncated': '```json\n[\n    {\n        "original": "The last time I explained about uh data types and general the types that we are using',
    'engagement_partial': '[\n    {"segment": "0%", "engagement":',
    'key_insights_empty': '```\nSome text that is not JSON\n```',
    'summary_malformed': '{\n    "title": "Advanced Python Data Structures: Sets and Dictionaries",     \n    "subheader": "A high-level overview of set and dict usage",\n    "points": ["Sets remove duplicates", "Dicts map keys to values"\n'
}

for name, sample in samples.items():
    print(f'--- SAMPLE: {name} ---')
    cleaned = _strip_code_fences_and_markdown(sample)
    print('CLEANED:')
    print(cleaned)
    parsed = _extract_first_json(sample)
    print('PARSED:')
    print(parsed)
    if parsed is None:
        _save_raw_gemini_response(name, sample)
        print('Saved raw response to logs/gemini_raw')
    print('\n')

print('Repro run complete')
