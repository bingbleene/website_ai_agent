"""Utilities for cleaning and converting translated text to HTML.

This module provides a small helper to:
- remove common leading phrases like "Here is the English translation..."
- convert simple Markdown bold (**text**) to <strong>
- convert markdown headings (#, ##, ###) to <h1>/<h2>/<h3>
- convert paragraphs (double newlines) to <p> blocks

Keep this small and robust — it avoids heavy markdown deps.
"""
import re


def clean_translated_text(text: str) -> str:
    if not text:
        return ""

    s = text.strip()

    # Remove a common preface line like "Here is the English translation..." (case-insensitive)
    s = re.sub(r'(?i)^here is the english translation.*\n+', '', s)

    # Remove occasional leading labels (TITLE:, SLUG:, CATEGORY:, EXCERPT:, CONTENT:)
    s = re.sub(r'(?m)^(TITLE:|SLUG:|CATEGORY:|EXCERPT:|CONTENT:)\s*', '', s)

    # Convert Markdown bold **bold** to <strong>
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)

    # Convert headings (#, ##, ###) to html headings
    s = re.sub(r'(?m)^###\s*(.+)$', r'<h3>\1</h3>', s)
    s = re.sub(r'(?m)^##\s*(.+)$', r'<h2>\1</h2>', s)
    s = re.sub(r'(?m)^#\s*(.+)$', r'<h1>\1</h1>', s)

    # Normalize windows newlines
    s = s.replace('\r\n', '\n')

    # Split into paragraphs on double newlines
    parts = [p.strip() for p in re.split(r'\n\s*\n', s) if p.strip()]

    html_parts = []
    for p in parts:
        # If the paragraph already starts with a heading tag or block-level tag, keep as-is
        if re.match(r'^<h[1-6]>', p) or re.match(r'^<blockquote>', p) or re.match(r'^<ul>|^<ol>|^<pre>', p):
            html_parts.append(p)
        else:
            # Replace single newlines inside paragraph with <br /> for soft breaks
            p_html = p.replace('\n', '<br />')
            html_parts.append(f'<p>{p_html}</p>')

    result = '\n'.join(html_parts)

    # Tidy up excessive spaces
    result = re.sub(r'\n{2,}', '\n', result)

    return result
