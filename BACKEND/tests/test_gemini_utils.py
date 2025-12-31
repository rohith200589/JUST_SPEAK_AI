import os
import glob
import json
from BACKEND.gemini_utils import _strip_code_fences_and_markdown, _extract_first_json, _save_raw_gemini_response


def test_strip_code_fences_basic():
    text = "```json\n[1,2,3]\n```"
    assert _strip_code_fences_and_markdown(text).strip() == "[1,2,3]"


def test_strip_unclosed_fence():
    text = "```json\n{\"a\": 1, \"b\":2"
    assert _strip_code_fences_and_markdown(text).startswith('{')


def test_extract_plain_array():
    text = "```json\n[ { \"segment\": \"0%\", \"engagement\": 65 } ]\n```"
    parsed = _extract_first_json(text)
    assert isinstance(parsed, list)
    assert parsed[0]["segment"] == "0%"


def test_extract_embedded_json():
    text = "Some message\n```json\n{\"title\": \"Test\", \"points\": [\"a\"]}\n```\nmore"
    parsed = _extract_first_json(text)
    assert isinstance(parsed, dict)
    assert parsed["title"] == "Test"


def test_extract_truncated_json_autoclose():
    # Missing closing array and object
    text = "{\"title\": \"X\", \"points\": [\"one\", \"two\""
    parsed = _extract_first_json(text)
    assert isinstance(parsed, dict)
    assert parsed.get("title") == "X"
    assert parsed.get("points") == ["one", "two"]


def test_strip_trailing_commas_and_parse():
    text = "{\"a\": 1,}\n"
    parsed = _extract_first_json(text)
    assert isinstance(parsed, dict)
    assert parsed.get('a') == 1


def test_save_raw_response_creates_file(tmp_path, monkeypatch):
    # Temporarily set BACKEND path to temp dir to avoid writing into repo
    temp_logs_dir = tmp_path / "logs" / "gemini_raw"
    monkeypatch.setenv('PYTEST_TMPLOGS', str(temp_logs_dir))

    # call function (it uses file path relative to module, so just call and then check path exists)
    _save_raw_gemini_response('unit_test_helper', '{"ok": true}')

    # Look for any file starting with timestamp and helper name
    logs_base = os.path.join(os.path.dirname(__file__), '..', 'logs', 'gemini_raw')
    files = glob.glob(os.path.join(logs_base, '*unit_test_helper.log'))
    assert len(files) >= 1
    # cleanup: remove created files for test hygiene
    for f in files:
        os.remove(f)
