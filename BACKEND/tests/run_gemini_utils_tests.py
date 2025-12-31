import os
import glob
import sys
# Ensure project root is on path so we can import BACKEND package modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from BACKEND.gemini_utils import _strip_code_fences_and_markdown, _extract_first_json, _save_raw_gemini_response


def run_tests():
    failures = []

    try:
        text = "```json\n[1,2,3]\n```"
        assert _strip_code_fences_and_markdown(text).strip() == "[1,2,3]"
    except AssertionError:
        failures.append('test_strip_code_fences_basic')

    try:
        text = "```json\n{\"a\": 1, \"b\":2"
        assert _strip_code_fences_and_markdown(text).startswith('{')
    except AssertionError:
        failures.append('test_strip_unclosed_fence')

    try:
        text = "```json\n[ { \"segment\": \"0%\", \"engagement\": 65 } ]\n```"
        parsed = _extract_first_json(text)
        assert isinstance(parsed, list)
        assert parsed[0]["segment"] == "0%"
    except AssertionError:
        failures.append('test_extract_plain_array')

    try:
        text = "Some message\n```json\n{\"title\": \"Test\", \"points\": [\"a\"]}\n```\nmore"
        parsed = _extract_first_json(text)
        assert isinstance(parsed, dict)
        assert parsed["title"] == "Test"
    except AssertionError:
        failures.append('test_extract_embedded_json')

    try:
        text = "{\"title\": \"X\", \"points\": [\"one\", \"two\""
        parsed = _extract_first_json(text)
        assert isinstance(parsed, dict)
        assert parsed.get("title") == "X"
        assert parsed.get("points") == ["one", "two"]
    except Exception:
        failures.append('test_extract_truncated_json_autoclose')

    try:
        text = "{\"a\": 1,}\n"
        parsed = _extract_first_json(text)
        assert isinstance(parsed, dict)
        assert parsed.get('a') == 1
    except Exception:
        failures.append('test_strip_trailing_commas_and_parse')

    try:
        _save_raw_gemini_response('unit_test_helper', '{"ok": true}')
        logs_base = os.path.join(os.path.dirname(__file__), '..', 'logs', 'gemini_raw')
        files = glob.glob(os.path.join(logs_base, '*unit_test_helper.log'))
        assert len(files) >= 1
        # cleanup
        for f in files:
            os.remove(f)
    except Exception:
        failures.append('test_save_raw_response_creates_file')

    if failures:
        print('FAILURES:', failures)
        sys.exit(1)
    else:
        print('All gemini_utils tests passed')

if __name__ == '__main__':
    run_tests()
