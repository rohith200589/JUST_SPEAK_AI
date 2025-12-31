import re
import json
import os
import time


def _strip_code_fences_and_markdown(text: str) -> str:
    """Remove common markdown/code fences and surrounding explanatory text."""
    if not text:
        return text
    # Remove fenced code blocks like ```json ... ``` or ``` ... ```
    text = re.sub(r"```(?:json)?\s*([\s\S]*?)\s*```", r"\1", text, flags=re.IGNORECASE)
    # Remove an unclosed leading fence like ```json or ``` at the start
    text = re.sub(r"^(?:```json|```)\s*", "", text, flags=re.IGNORECASE)
    # Remove an unclosed trailing fence if present
    text = re.sub(r"\s*(?:```json|```)\s*$", "", text, flags=re.IGNORECASE)
    # Remove any leading/trailing backticks and whitespace
    text = text.strip().strip('`').strip()
    return text


def _extract_first_json(text: str):
    """Try to find and return the first JSON object or array within `text`.
    Returns a Python object on success, or None on failure.
    """
    if not text:
        return None
    # Clean up markdown/code fences first
    cleaned = _strip_code_fences_and_markdown(text)

    # Find the first '{' or '[' and try to parse from there to the end
    start_idx = None
    for i, ch in enumerate(cleaned):
        if ch in ['{', '[']:
            start_idx = i
            break
    if start_idx is None:
        return None

    candidate = cleaned[start_idx:].strip()

    # First, try to parse as-is
    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        pass

    # Try heuristic fixes for truncated or lightly malformed JSON
    # 1) Find last closing brace/bracket and try to cut the string there
    last_obj_end = None
    last_brace = candidate.rfind('}')
    last_bracket = candidate.rfind(']')
    if last_brace > last_bracket:
        last_obj_end = last_brace + 1
    elif last_bracket != -1:
        last_obj_end = last_bracket + 1

    if last_obj_end:
        truncated = candidate[:last_obj_end]
        try:
            return json.loads(truncated)
        except json.JSONDecodeError:
            pass

    # 2) Try to auto-close by appending the necessary closing character(s)
    opens = {'{': '}', '[': ']'}
    open_char = candidate[0]
    closing = opens.get(open_char)
    if closing:
        attempt = candidate + closing
        # Remove trailing commas before the closing bracket/brace
        attempt = re.sub(r",\s*(\]|\})$", r"\1", attempt)
        try:
            return json.loads(attempt)
        except json.JSONDecodeError:
            pass

    # 3) Balance braces/brackets by counting and appending missing closes
    def balance_and_close(s):
        stack = []
        for ch in s:
            if ch == '{' or ch == '[':
                stack.append(ch)
            elif ch == '}' or ch == ']':
                if stack and ((stack[-1] == '{' and ch == '}') or (stack[-1] == '[' and ch == ']')):
                    stack.pop()
        closing_seq = ''.join('}' if c == '{' else ']' for c in reversed(stack))
        return s + closing_seq

    attempt2 = balance_and_close(candidate)
    attempt2 = re.sub(r",\s*(\]|\})", r"\1", attempt2)
    try:
        return json.loads(attempt2)
    except json.JSONDecodeError:
        pass

    # 4) As a last resort, attempt progressive trimming from the end
    for end in range(len(candidate), 0, -1):
        try:
            attempt = candidate[:end]
            attempt = re.sub(r",\s*(\]|\})$", r"\1", attempt)
            return json.loads(attempt)
        except json.JSONDecodeError:
            continue

    return None


def _save_raw_gemini_response(helper_name: str, response_text: str):
    """Save the raw Gemini response and cleaned variants to a timestamped file for debugging."""
    try:
        logs_dir = os.path.join(os.path.dirname(__file__), 'logs', 'gemini_raw')
        os.makedirs(logs_dir, exist_ok=True)
        timestamp = time.strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}__{helper_name}.log"
        file_path = os.path.join(logs_dir, filename)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write("--- RAW RESPONSE ---\n")
            f.write(response_text or '')
            f.write("\n\n--- CLEANED (strip fences) ---\n")
            f.write(_strip_code_fences_and_markdown(response_text) or '')
        print(f"Saved raw Gemini response to {file_path}")
    except Exception as e:
        print(f"Failed to save raw Gemini response: {e}")
