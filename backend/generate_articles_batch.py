"""Script sinh nhiều bài viết với Mistral và xuất HTML.

Usage: python generate_articles_batch.py
"""

import sys
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

load_dotenv()

from app.llm_mistral.services.article_generator_official import (
    mistral_official_article_generator,
)


def generate_html_article(article: dict, index: int) -> str:
    """Tạo HTML cho một bài viết với template sạch và CSS cố định."""
    import re

    content = article.get("content", "") or ""

    # Loại bỏ dòng chỉ chứa dấu '#'
    content = re.sub(r"^\s*#\s*$", "", content, flags=re.MULTILINE)

    # Loại bỏ các dòng metadata (Slug/Category/Tags/Excerpt/Title) nếu nằm trong nội dung
    content = re.sub(
        r"^\s*#{0,6}\s*(Tiêu đề|TIEU DE|TITLE)\s*:.*$",
        "",
        content,
        flags=re.IGNORECASE | re.MULTILINE,
    )
    content = re.sub(
        r"^\s*#{0,6}\s*Slug\s*:.*$", "", content, flags=re.IGNORECASE | re.MULTILINE
    )
    content = re.sub(
        r"^\s*#{0,6}\s*Category\s*:.*$", "", content, flags=re.IGNORECASE | re.MULTILINE
    )
    content = re.sub(
        r"^\s*#{0,6}\s*Tags?\s*:.*$", "", content, flags=re.IGNORECASE | re.MULTILINE
    )
    content = re.sub(
        r"^\s*#{0,6}\s*Excerpt\s*:.*$", "", content, flags=re.IGNORECASE | re.MULTILINE
    )

    # Markdown-like headings -> HTML (h2/h3/h4). Ensure headings are on their own lines
    # so they won't be wrapped inside <p> later.
    content = re.sub(
        r"^\s*#{4,}\s+(.+)$", r"\n<h4>\1</h4>\n", content, flags=re.MULTILINE
    )
    content = re.sub(
        r"^\s*#{3}\s+(.+)$", r"\n<h3>\1</h3>\n", content, flags=re.MULTILINE
    )
    content = re.sub(r"^\s*##\s+(.+)$", r"\n<h2>\1</h2>\n", content, flags=re.MULTILINE)
    content = re.sub(r"^\s*#\s+(.+)$", r"\n<h2>\1</h2>\n", content, flags=re.MULTILINE)

    # Bold
    content = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", content)

    # Convert simple bullet lines to <ul>
    def bullets_to_ul(text: str) -> str:
        lines = text.split("\n")
        out = []
        in_ul = False
        for line in lines:
            if re.match(r"^\s*[-\*]\s+", line):
                if not in_ul:
                    out.append("<ul>")
                    in_ul = True
                out.append("<li>" + re.sub(r"^\s*[-\*]\s+", "", line).strip() + "</li>")
            else:
                if in_ul:
                    out.append("</ul>")
                    in_ul = False
                out.append(line)
        if in_ul:
            out.append("</ul>")
        return "\n".join(out)

    content = bullets_to_ul(content)

    # Transform simple numbered references or url lists into <ol> with links when possible
    def transform_references(html: str) -> str:
        import re as _re

        pat = _re.compile(
            r"(?is)(<h[2-4]>\s*(?:References|Tài liệu tham khảo)[^<]*</h[2-4]>)(.+?)(?=<h[2-4]>|$)"
        )
        m = pat.search(html)
        if not m:
            return html
        heading, tail = m.group(1), m.group(2)

        # try to find list items
        items = _re.findall(r"<li>(.+?)</li>", tail, _re.DOTALL)
        if items:
            lis = []
            for it in items:
                urlm = _re.search(r"(https?://\S+)", it)
                if urlm:
                    # strip trailing punctuation and angle brackets from url
                    url = urlm.group(1).rstrip(".,)<>\n\r ")
                    # remove url from text and strip stray angle brackets
                    text = _re.sub(r"https?://\S+", "", it)
                    text = _re.sub(r"[<>]+", "", text).strip(" -:()\n\r ") or url
                    lis.append(
                        f'<li><a href="{url}" target="_blank" rel="noopener">{text}</a></li>'
                    )
                else:
                    cleaned = _re.sub(r"[<>]+", "", it).strip()
                    lis.append(f"<li>{cleaned}</li>")
            return pat.sub(heading + "\n<ol>\n" + "\n".join(lis) + "\n</ol>\n", html)

        # fallback: numbered lines
        lines = [ln.strip() for ln in tail.splitlines() if ln.strip()]
        numbered = [
            re.sub(r"^\d+\.\s*", "", ln) for ln in lines if re.match(r"^\d+\.\s*", ln)
        ]
        if numbered:
            lis = []
            for it in numbered:
                urlm = re.search(r"(https?://\S+)", it)
                if urlm:
                    url = urlm.group(1).rstrip(".,)<>\n\r ")
                    text = re.sub(r"https?://\S+", "", it)
                    text = re.sub(r"[<>]+", "", text).strip(" -:()\n\r ") or url
                    lis.append(
                        f'<li><a href="{url}" target="_blank" rel="noopener">{text}</a></li>'
                    )
                else:
                    cleaned = re.sub(r"[<>]+", "", it).strip()
                    lis.append(f"<li>{cleaned}</li>")
            return pat.sub(heading + "\n<ol>\n" + "\n".join(lis) + "\n</ol>\n", html)

        return html

    content = transform_references(content)

    # Remove assistant/system prompt traces
    content = re.sub(r"⚠️.*?(?=\n\n|$)", "", content, flags=re.DOTALL)
    content = re.sub(r"YÊU CẦU.*?(?=\n\n|$)", "", content, flags=re.DOTALL)

    # Build paragraphs
    def normalize_text(txt: str) -> str:
        t = re.sub(r"<[^>]+>", "", txt or "").replace("**", "")
        t = re.sub(r"\s+", " ", t).strip()
        return t

    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", content) if p.strip()]
    formatted_parts = []
    excerpt_norm = normalize_text(article.get("excerpt", ""))
    for para in paragraphs:
        if re.match(
            r"^<strong>\s*(Slug|Category|Tags?|Excerpt)\s*:.*</strong>",
            para,
            re.IGNORECASE,
        ):
            continue
        if excerpt_norm and normalize_text(para) == excerpt_norm:
            continue
        if (
            para.startswith("<img")
            or para.startswith("<h2>")
            or para.startswith("<h3>")
            or para.startswith("<h4>")
            or para.startswith("<ul>")
            or para.startswith("<ol>")
        ):
            formatted_parts.append(para)
        else:
            if len(normalize_text(para)) > 5:
                formatted_parts.append(f"<p>{para}</p>")

    formatted_content = "\n\n".join(formatted_parts)

    # Collapse consecutive duplicate heading lines (e.g. repeated <h4>...)
    # This helps when the LLM outputs repeated headings which break the layout.
    def _collapse_duplicate_headings(text: str) -> str:
        out_lines = []
        prev_heading = None
        for ln in text.splitlines():
            s = ln.strip()
            if re.match(r"^<h[234]>", s):
                # if identical to previous heading line, skip to avoid repetition
                if s == prev_heading:
                    continue
                prev_heading = s
                out_lines.append(ln)
            else:
                prev_heading = None
                out_lines.append(ln)
        return "\n".join(out_lines)

    formatted_content = _collapse_duplicate_headings(formatted_content)

    # Determine display title: prefer first h2 in content, else slug/title
    m = re.search(r"<h2>(.+?)</h2>", formatted_content or "")
    if m:
        display_title = m.group(1).strip()
        # remove first h2 occurrence from content
        formatted_content = re.sub(
            r"^\s*<h2>\s*" + re.escape(display_title) + r"\s*</h2>\s*",
            "",
            formatted_content,
            count=1,
        )
    else:
        slug = (article.get("slug") or "").replace("-", " ").replace("_", " ").strip()
        display_title = slug.title() or (article.get("title") or "Untitled")

    # Safe values for optional fields
    # Process excerpt: remove markdown headings, keep main paragraphs,
    # make each paragraph its own <p>, and if article provides a source/url,
    # wrap each excerpt paragraph in a link to that source. Also append
    # a summary line 'Bài báo này sẽ phân tích: ...'.
    raw_excerpt = article.get("excerpt", "") or ""
    # remove markdown heading lines (starting with #), HTML heading tags and bold markers
    cleaned = re.sub(r"(?m)^\s*#{1,6}\s*.*$", "", raw_excerpt)
    cleaned = re.sub(r"(?i)<h[1-6]>.*?</h[1-6]>", "", cleaned, flags=re.DOTALL)
    cleaned = cleaned.replace("**", "")
    # split into non-empty lines/paragraphs
    parts = [p.strip() for p in re.split(r"\n\s*\n|\n", cleaned) if p.strip()]

    # determine topics for the appended summary
    topics = []
    if article.get("angles"):
        topics = [
            re.sub(r'^[\[\]\*\s"\'`]+|[\[\]\*\s"\'`]+$', "", str(x)).strip()
            for x in article.get("angles")
            if str(x).strip()
        ]
    elif article.get("tags"):
        topics = [
            re.sub(r'^[\[\]\*\s"\'`]+|[\[\]\*\s"\'`]+$', "", str(x)).strip()
            for x in article.get("tags")
            if str(x).strip()
        ]
    if not topics:
        topics = ["tổng quan", "ứng dụng", "thách thức", "giải pháp"]

    # source/url if available
    source_url = (
        article.get("source")
        or article.get("source_url")
        or article.get("url")
        or article.get("original_url")
    )

    excerpt_lines = []
    for p in parts:
        if source_url:
            excerpt_lines.append(
                f'<p><a href="{source_url}" target="_blank" rel="noopener">{p}</a></p>'
            )
        else:
            excerpt_lines.append(f"<p>{p}</p>")

    # Add summary line about what the article will analyze
    summary = ", ".join(topics[:6])
    excerpt_lines.append(f"<p><strong>Bài báo này sẽ phân tích:</strong> {summary}</p>")

    excerpt_html = "\n".join(excerpt_lines)
    thumbnail_html = ""
    if article.get("thumbnail"):
        thumb = article.get("thumbnail")
        alt = article.get("thumbnail_alt", "thumbnail")
        thumbnail_html = f'<img src="{thumb}" alt="{alt}" class="thumbnail" onerror="this.style.display=\'none\'">'

    # Clean tags: remove surrounding brackets, stars, quotes
    tags_html = ""
    if article.get("tags"):
        clean_tags = []
        for t in article.get("tags", []):
            ct = re.sub(r'^[\[\]\*\s"\'`]+|[\[\]\*\s"\'`]+$', "", str(t)).strip()
            if ct:
                clean_tags.append(ct)
        if clean_tags:
            tags_html = (
                '<div class="tags">'
                + " ".join([f'<span class="tag">{t}</span>' for t in clean_tags])
                + "</div>"
            )

    angles_html = ""
    if article.get("angles"):
        angles_html = (
            '<div class="angles"><h3>📌 Góc nhìn mở rộng</h3><ul>'
            + "".join([f"<li>• {a}</li>" for a in article.get("angles", [])])
            + "</ul></div>"
        )

    # sanitize slug for display
    display_slug_safe = re.sub(
        r"[^A-Za-z0-9\-_. ]+", "", (article.get("slug") or "").strip()
    )

    return f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{display_title}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f7fb;
            margin: 0;
            padding: 30px 20px;
            color: #1f2937;
        }}
        .container {{
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            padding: 28px;
            box-shadow: 0 6px 30px rgba(15, 23, 42, 0.08);
        }}
        .page-title {{
            color: #0b69d0;
            font-size: 1.9em;
            margin: 0 0 6px 0;
        }}
        .meta {{
            color: #6b7280;
            font-size: 0.9em;
            margin-bottom: 14px;
        }}
        .thumbnail {{
            width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 18px 0;
            object-fit: cover;
        }}
        .excerpt {{
            background: #fbfdff;
            border-left: 4px solid #0b69d0;
            padding: 14px 18px;
            color: #334155;
            margin: 12px 0 20px 0;
            font-style: italic;
        }}
        .content {{
            font-size: 1.02em;
            line-height: 1.8;
            color: #111827;
        }}
        .content p {{
            margin: 14px 0;
            text-align: justify;
        }}
        .content h2, .content h3, .content h4 {{
            color: #0b69d0;
            margin: 28px 0 12px 0;
        }}
        .tags {{ margin-top: 12px; }}
        .tag {{
            display: inline-block;
            background: #eef2ff;
            color: #0b69d0;
            padding: 6px 10px;
            border-radius: 999px;
            margin-right: 8px;
            font-size: 0.85em;
        }}
        .angles {{
            margin-top: 28px;
            padding: 16px;
            background: #fbfdff;
            border-radius: 8px;
        }}
        .angles ul {{ padding-left: 18px; }}
        .footer {{
            margin-top: 30px;
            padding-top: 18px;
            border-top: 1px solid #e6eef8;
            color: #6b7280;
            font-size: 0.9em;
            text-align: center;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1 class="page-title">{display_title}</h1>
        <div class="meta">Slug: <code>{display_slug_safe}</code> · Số từ: {article.get("word_count", 0)} · Thời gian: {article.get("generation_time", 0):.1f}s · {datetime.now().strftime("%d/%m/%Y %H:%M")}</div>

        {tags_html}

        {thumbnail_html}

        <div class="excerpt">{excerpt_html}</div>

        <div class="content">{formatted_content}</div>

        {angles_html}

        <div class="footer">Bài viết #{index} — Được tạo bởi Mistral AI</div>
    </div>
</body>
</html>"""


def extract_display_title(content_html: str, fallback: str) -> str:
    """Trích xuất tiêu đề từ h2 đầu tiên; fallback nếu không có."""
    import re as _re

    m = _re.search(r"<h2>(.+?)</h2>", content_html or "")
    if m:
        return m.group(1).strip()
    # Fallback: dùng chuỗi dự phòng (có thể là title hoặc slug Title Case)
    fb = (fallback or "").strip().strip('"').strip("'")
    if fb:
        return fb
    return ""


def main():
    # Keywords đa dạng - 20 chủ đề khác nhau
    keywords = [
        "Trí tuệ nhân tạo",
        "Blockchain",
        "Năng lượng tái tạo",
        "Y tế thông minh",
        "Giáo dục số",
        "An ninh mạng",
        "Ô tô điện",
        "Metaverse",
        "Công nghệ 5G",
        "Thương mại điện tử",
        "Robot và Tự động hóa",
        "Big Data",
        "Cloud Computing",
        "Fintech",
        "Smart City",
        "Biotechnology",
        "Space Technology",
        "Quantum Computing",
        "Nông nghiệp công nghệ cao",
        "Gaming và Esports",
    ]

    # Hỏi người dùng
    print("=" * 60)
    print("SINH BÀI VIẾT HÀNG LOẠT VỚI MISTRAL")
    print("=" * 60)

    try:
        count = int(input("\nNhập số lượng bài viết muốn tạo (5-10): ").strip())
        if count < 5 or count > 10:
            print("⚠️ Số lượng phải từ 5 đến 10. Mặc định: 5")
            count = 5
    except Exception:
        print("⚠️ Giá trị không hợp lệ. Mặc định: 5")
        count = 5

    # Tạo thư mục output
    output_dir = Path(__file__).parent / "output_articles"
    output_dir.mkdir(exist_ok=True)

    print(f"\n📝 Bắt đầu tạo {count} bài viết...")
    print(f"📁 Lưu vào: {output_dir}\n")

    articles_data = []

    for i in range(count):
        keyword = keywords[i % len(keywords)]
        print(f"[{i + 1}/{count}] Đang tạo bài về: {keyword}...", end=" ", flush=True)

        try:
            article = mistral_official_article_generator.generate_article(keyword)
            articles_data.append(article)

            # Tạo file HTML cho bài này
            html_content = generate_html_article(article, i + 1)
            # Loại bỏ ký tự đặc biệt khỏi slug
            safe_slug = (
                article["slug"][:30]
                .replace('"', "")
                .replace("'", "")
                .replace("\\", "")
                .replace("/", "")
                .replace(":", "")
                .replace("*", "")
                .replace("?", "")
                .replace("<", "")
                .replace(">", "")
                .replace("|", "")
            )
            filename = f"article_{i + 1:02d}_{safe_slug}.html"
            filepath = output_dir / filename

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(html_content)

            print("✅ Hoàn thành!")
            print(f"   → {filename}")

        except Exception as e:
            print(f"❌ Lỗi: {e}")
            continue

    # Tạo file index HTML với biểu đồ và bảng thống kê
    print("\n📄 Tạo file index với biểu đồ và thống kê...")

    # Tính toán thống kê
    total_words = sum(a.get("word_count", 0) for a in articles_data)
    avg_words = total_words // len(articles_data) if articles_data else 0
    max_words_article = (
        max(articles_data, key=lambda x: x.get("word_count", 0))
        if articles_data
        else None
    )
    min_words_article = (
        min(articles_data, key=lambda x: x.get("word_count", 0))
        if articles_data
        else None
    )

    # Đếm categories
    from collections import Counter

    category_counts = Counter(a["category"] for a in articles_data)

    # Tạo dữ liệu cho biểu đồ
    chart_data_words = [a.get("word_count", 0) for a in articles_data]
    chart_labels = [f"Bài {i + 1}" for i in range(len(articles_data))]
    # Thời gian tạo bài
    time_values = [a.get("generation_time", 0) for a in articles_data]
    total_time = sum(time_values)
    avg_time_s = round(total_time / len(time_values), 1) if time_values else 0.0

    index_html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phân tích Bài viết Mistral AI</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }}
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}
        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
        }}
        .header p {{
            font-size: 1.1em;
            opacity: 0.9;
        }}
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }}
        .stat-card {{
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s;
            position: relative;
            overflow: hidden;
        }}
        .stat-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }}
        .stat-card:nth-child(1) .number {{ color: #e74c3c; }}
        .stat-card:nth-child(2) .number {{ color: #3498db; }}
        .stat-card:nth-child(3) .number {{ color: #2ecc71; }}
        .stat-card:nth-child(4) .number {{ color: #f39c12; }}
        .stat-card:nth-child(5) .number {{ color: #9b59b6; }}
        .stat-card:nth-child(6) .number {{ color: #1abc9c; }}
        .stat-card .number {{
            font-size: 2.5em;
            font-weight: bold;
            display: block;
            margin: 10px 0;
        }}
        .stat-card .label {{
            color: #666;
            font-size: 1em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .chart-section {{
            padding: 40px;
        }}
        .chart-container {{
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }}
        .chart-container h2 {{
            color: #1976D2;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #2196F3;
        }}
        canvas {{
            max-height: 400px;
        }}
        .table-section {{
            padding: 40px;
        }}
        .table-container {{
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        .table-container h2 {{
            color: #1976D2;
            padding: 25px;
            margin: 0;
            background: #f8f9fa;
            border-bottom: 3px solid #2196F3;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
        }}
        thead {{
            background: #1976D2;
            color: white;
        }}
        thead th {{
            padding: 15px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 0.5px;
        }}
        tbody tr {{
            border-bottom: 1px solid #e0e0e0;
            transition: background 0.2s;
        }}
        tbody tr:hover {{
            background: #f8f9fa;
        }}
        tbody td {{
            padding: 15px;
            color: #333;
        }}
        tbody td:first-child {{
            font-weight: bold;
            color: #1976D2;
        }}
        .category-badge {{
            display: inline-block;
            color: white;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .category-badge[data-category="AI"] {{ background: linear-gradient(135deg, #667eea, #764ba2); }}
        .category-badge[data-category="Technology"] {{ background: linear-gradient(135deg, #f093fb, #f5576c); }}
        .category-badge[data-category="Environment"] {{ background: linear-gradient(135deg, #4facfe, #00f2fe); }}
        .category-badge[data-category="Health"] {{ background: linear-gradient(135deg, #43e97b, #38f9d7); }}
        .category-badge[data-category="Education"] {{ background: linear-gradient(135deg, #fa709a, #fee140); }}
        .category-badge[data-category="Security"] {{ background: linear-gradient(135deg, #30cfd0, #330867); }}
        .category-badge[data-category="Business"] {{ background: linear-gradient(135deg, #a8edea, #fed6e3); }}
        .category-badge[data-category="Science"] {{ background: linear-gradient(135deg, #ff9a9e, #fecfef); }}
        .category-badge[data-category="Finance"] {{ background: linear-gradient(135deg, #fbc2eb, #a6c1ee); }}
        tbody .category-badge {{ background: #3498db; }}
        .tags-cell {{
            max-width: 300px;
        }}
        .tag {{
            display: inline-block;
            background: #e0e0e0;
            color: #333;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 0.75em;
            margin: 2px;
        }}
        .article-link {{
            color: #1976D2;
            text-decoration: none;
            font-weight: bold;
        }}
        .article-link:hover {{
            text-decoration: underline;
        }}
        .word-count {{
            font-weight: bold;
            color: #43a047;
        }}
        .footer {{
            background: #333;
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .footer p {{
            margin: 5px 0;
            opacity: 0.8;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Phân tích Bài viết Mistral AI</h1>
            <p>Đánh giá chất lượng và hiệu suất tạo nội dung tự động</p>
            <p style="font-size: 0.9em; margin-top: 10px;">Tạo lúc: {
        datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    }</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <span class="label">Tổng số bài</span>
                <span class="number">{len(articles_data)}</span>
            </div>
            <div class="stat-card">
                <span class="label">Tổng số từ</span>
                <span class="number">{total_words:,}</span>
            </div>
            <div class="stat-card">
                <span class="label">Trung bình từ/bài</span>
                <span class="number">{avg_words:,}</span>
            </div>
            <div class="stat-card">
                <span class="label">Thời gian TB (s)</span>
                <span class="number">{avg_time_s}</span>
            </div>
            <div class="stat-card">
                <span class="label">Tổng thời gian (s)</span>
                <span class="number">{total_time:.1f}</span>
            </div>
            <div class="stat-card">
                <span class="label">Bài dài nhất</span>
                <span class="number">{
        max_words_article.get("word_count", 0) if max_words_article else 0:,}</span>
            </div>
            <div class="stat-card">
                <span class="label">Bài ngắn nhất</span>
                <span class="number">{
        min_words_article.get("word_count", 0) if min_words_article else 0:,}</span>
            </div>
            <div class="stat-card">
                <span class="label">Số danh mục</span>
                <span class="number">{len(category_counts)}</span>
            </div>
        </div>
        
        <div class="chart-section">
            <div class="chart-container">
                <h2>📈 Biểu đồ Số từ theo Bài viết</h2>
                <canvas id="wordsChart"></canvas>
            </div>
            
            <div class="chart-container">
                <h2>🎯 Phân bố Danh mục</h2>
                <canvas id="categoryChart"></canvas>
            </div>
        </div>
        
        <div class="table-section">
            <div class="table-container">
                <h2>📋 Bảng Chi tiết Bài viết</h2>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tiêu đề</th>
                            <th>Danh mục</th>
                            <th>Số từ</th>
                            <th>Thời gian (s)</th>
                            <th>Tags</th>
                            <th>Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
        "".join(
            [
                f'''<tr>
                            <td>{i + 1}</td>
                            <td style="max-width: 400px;">{extract_display_title(article.get('content', ''), article.get('title', ''))}</td>
                            <td><span class="category-badge">{article['category']}</span></td>
                            <td><span class="word-count">{article.get('word_count', 0):,}</span></td>
                            <td>{article.get('generation_time', 0):.1f}</td>
                            <td class="tags-cell">
                                {' '.join([f'<span class="tag">{tag}</span>' for tag in article.get('tags', [])[:5]])}
                            </td>
                            <td>
                                <a href="article_{i + 1:02d}_{article['slug'][:30].replace('"', '').replace("'", "").replace('\\\\', '').replace('/', '').replace(':', '').replace('*', '').replace('?', '').replace('<', '').replace('>', '').replace('|', '')}.html" 
                                   class="article-link" target="_blank">Xem bài →</a>
                            </td>
                        </tr>'''
                for i, article in enumerate(articles_data)
            ]
        )
    }
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Mistral AI Article Generator</strong></p>
            <p>Model: mistral-small-latest | Temperature: 0.85</p>
            <p>© 2024 Wischain AI Project</p>
        </div>
    </div>
    
    <script>
        // Biểu đồ số từ
        const wordsCtx = document.getElementById('wordsChart').getContext('2d');
        const barColors = [
            'rgba(231, 76, 60, 0.6)',
            'rgba(52, 152, 219, 0.6)',
            'rgba(46, 204, 113, 0.6)',
            'rgba(241, 196, 15, 0.6)',
            'rgba(155, 89, 182, 0.6)',
            'rgba(26, 188, 156, 0.6)',
            'rgba(230, 126, 34, 0.6)',
            'rgba(127, 140, 141, 0.6)',
            'rgba(52, 73, 94, 0.6)',
            'rgba(192, 57, 43, 0.6)'
        ];
        new Chart(wordsCtx, {{
            type: 'bar',
            data: {{
                labels: {chart_labels},
                datasets: [{{
                    label: 'Số từ',
                    data: {chart_data_words},
                    backgroundColor: barColors,
                    borderColor: barColors.map(c => c.replace('0.6', '1')),
                    borderWidth: 2,
                    borderRadius: 8
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {{
                    legend: {{
                        display: true,
                        position: 'top'
                    }},
                    title: {{
                        display: false
                    }}
                }},
                scales: {{
                    y: {{
                        beginAtZero: true,
                        title: {{
                            display: true,
                            text: 'Số từ'
                        }}
                    }},
                    x: {{
                        title: {{
                            display: true,
                            text: 'Bài viết'
                        }}
                    }}
                }}
            }}
        }});

        // Biểu đồ thời gian tạo bài
        const timeData = {articles_data}.map(a => a.generation_time || 0);
        const timeCtx = document.createElement('canvas').getContext('2d');
        document.querySelector('.chart-section').appendChild(timeCtx.canvas);
        new Chart(timeCtx, {{
            type: 'line',
            data: {{
                labels: {chart_labels},
                datasets: [{{
                    label: 'Thời gian tạo (s)',
                    data: timeData,
                    borderColor: 'rgba(231, 76, 60, 1)',
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    tension: 0.3,
                    fill: true
                }}]
            }},
            options: {{
                responsive: true,
                plugins: {{ legend: {{ position: 'top' }} }},
                scales: {{ y: {{ beginAtZero: true }} }}
            }}
        }});
        
        // Biểu đồ danh mục
        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        new Chart(categoryCtx, {{
            type: 'doughnut',
            data: {{
                labels: {list(category_counts.keys())},
                datasets: [{{
                    label: 'Số bài viết',
                    data: {list(category_counts.values())},
                    backgroundColor: [
                        'rgba(33, 150, 243, 0.8)',
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(156, 39, 176, 0.8)',
                        'rgba(244, 67, 54, 0.8)',
                        'rgba(0, 188, 212, 0.8)',
                        'rgba(255, 235, 59, 0.8)',
                        'rgba(121, 85, 72, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {{
                    legend: {{
                        position: 'right'
                    }}
                }}
            }}
        }});
    </script>
</body>
</html>"""

    with open(output_dir / "index.html", "w", encoding="utf-8") as f:
        f.write(index_html)

    print("\n" + "=" * 60)
    print("✅ HOÀN TẤT!")
    print("=" * 60)
    print(f"📁 Đã tạo {len(articles_data)} bài viết trong: {output_dir}")
    print(f"🌐 Mở file index.html để xem danh sách:\n   {output_dir / 'index.html'}")
    print("=" * 60)


if __name__ == "__main__":
    main()
