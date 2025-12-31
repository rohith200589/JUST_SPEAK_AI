import sys
import os
# Ensure project root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from BACKEND.server import analyze_text_helper


def test_analyze_text_helper_empty():
    out = analyze_text_helper("")
    assert out['analysis_data'] is not None
    assert hasattr(out['analysis_data'], 'metrics')


def test_analyze_text_helper_sample():
    sample = "This is a short test transcript. The speaker discusses AI, testing, and reliability."
    out = analyze_text_helper(sample)
    assert out['analysis_data'] is not None
    assert hasattr(out['analysis_data'], 'metrics')
    assert isinstance(out['analysis_data'].metrics, list)
    assert isinstance(out['analysis_data'].rephraseSuggestions, list)

if __name__ == '__main__':
    print('Running analyze_text_helper tests...')
    test_analyze_text_helper_empty()
    test_analyze_text_helper_sample()
    print('analyze_text_helper tests passed')
