"""
HTML Export Service - Export articles to static HTML files
"""
from typing import Dict, Optional, List
from pathlib import Path
from loguru import logger
import re
import html


class HTMLExportService:
    def __init__(self, output_dir: str = "./article-html"):
        """Initialize HTML export service"""
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        logger.info(f"✅ HTML Export directory: {self.output_dir.absolute()}")
    
    def _sanitize_filename(self, title: str, is_keyword: bool = False) -> str:
        """Convert title to safe filename"""
        # Remove special characters, keep Vietnamese
        filename = re.sub(r'[^\w\s-]', '', title.lower())
        filename = re.sub(r'[-\s]+', '-', filename)
        # Limit length
        if is_keyword:
            filename = filename[:30]  # Shorter for keyword part
            return filename.strip('-')
        else:
            filename = filename[:70]  # Title part
            return f"{filename.strip('-')}.html"
    
    def _escape_html(self, text: str) -> str:
        """Escape HTML special characters"""
        return html.escape(text)
    
    def _translate_caption_to_vietnamese(self, caption: str, keyword: str = "") -> str:
        """
        Dịch chú thích ảnh sang tiếng Việt hoặc tạo mô tả phù hợp
        
        Args:
            caption: Chú thích gốc (tiếng Anh từ Unsplash)
            keyword: Từ khóa bài viết để tạo mô tả phù hợp
        
        Returns:
            Chú thích tiếng Việt
        """
        # Dictionary để dịch nhanh một số từ phổ biến
        translations = {
            # Tech/Crypto
            'bitcoin': 'Bitcoin',
            'cryptocurrency': 'Tiền điện tử',
            'crypto': 'Crypto',
            'blockchain': 'Blockchain',
            'technology': 'Công nghệ',
            'computer': 'Máy tính',
            'code': 'Mã nguồn',
            'data': 'Dữ liệu',
            'network': 'Mạng lưới',
            'digital': 'Kỹ thuật số',
            'ai': 'Trí tuệ nhân tạo',
            'artificial intelligence': 'Trí tuệ nhân tạo',
            'machine learning': 'Học máy',
            'robot': 'Robot',
            
            # Objects
            'illustration': 'Minh họa',
            'image': 'Hình ảnh',
            'chart': 'Biểu đồ',
            'graph': 'Đồ thị',
            'coin': 'Đồng tiền',
            'phone': 'Điện thoại',
            'smartphone': 'Điện thoại thông minh',
            'screen': 'Màn hình',
            'person': 'Người',
            'hand': 'Tay',
            'cube': 'Khối',
            'cubes': 'Khối',
            'surface': 'Bề mặt',
            'background': 'Nền',
            
            # Colors
            'blue': 'xanh',
            'red': 'đỏ',
            'golden': 'vàng',
            'black': 'đen',
            'white': 'trắng',
            
            # Actions
            'holding': 'cầm',
            'showing': 'hiển thị',
            'displaying': 'trưng bày',
            'surrounded': 'bao quanh',
            'sitting': 'nằm',
            'pile': 'đống',
        }
        
        # Nếu không có caption hoặc caption ngắn, dùng keyword
        if not caption or len(caption.strip()) < 3:
            return f"Hình minh họa về {keyword}"
        
        # Dịch từng từ
        caption_lower = caption.lower()
        vietnamese_caption = caption_lower
        
        for en, vi in translations.items():
            vietnamese_caption = vietnamese_caption.replace(en, vi)
        
        # Nếu không dịch được nhiều (vẫn còn quá nhiều tiếng Anh), dùng mô tả tổng quát
        english_words = len([w for w in vietnamese_caption.split() if w.isalpha() and not any(ord(c) > 127 for c in w)])
        if english_words > len(vietnamese_caption.split()) * 0.5:
            return f"Hình minh họa liên quan đến {keyword}"
        
        # Viết hoa chữ cái đầu
        vietnamese_caption = vietnamese_caption.strip().capitalize()
        return vietnamese_caption
    
    def _format_content(self, content: str, images: List[Dict] = None) -> str:
        """Format article content with proper HTML structure"""
        if not content:
            return ""
        
        # BƯỚC 1: Extract REFERENCES và ALT_ANGLES trước khi xóa
        references_html = ""
        references_match = re.search(r'(?:##?\s*)?NGUỒN THAM KHẢO[:\s]*(.*?)(?=(?:##?\s*)?ALT_ANGLES|$)', content, re.DOTALL | re.IGNORECASE)
        if references_match:
            refs = references_match.group(1).strip()
            ref_lines = [line.strip() for line in refs.split('\n') if line.strip() and re.match(r'^\d+\.', line.strip())]
            if ref_lines:
                references_html = '<div class="references"><h3>Nguồn tham khảo</h3><ol>'
                for line in ref_lines:
                    text = re.sub(r'^\d+\.\s*', '', line)
                    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
                    text = re.sub(r'\*([^*]+)\*', r'\1', text)
                    references_html += f'<li>{self._escape_html(text)}</li>'
                references_html += '</ol></div>'
        
        angles_html = ""
        angles_match = re.search(r'(?:##?\s*)?ALT_ANGLES[:\s]*(.*?)$', content, re.DOTALL | re.IGNORECASE)
        if angles_match:
            angles = angles_match.group(1).strip()
            angle_lines = [line.strip().lstrip('-*• ') for line in angles.split('\n') if line.strip() and line.strip().startswith(('-', '*', '•'))]
            if angle_lines:
                angles_html = '<div class="alt-angles"><h3>Góc nhìn khác</h3><ul>'
                for line in angle_lines:
                    clean_line = re.sub(r'^\*\*|\*\*$', '', line)
                    clean_line = re.sub(r'\*\*([^*]+)\*\*', r'\1', clean_line)
                    clean_line = re.sub(r'\*([^*]+)\*', r'\1', clean_line)
                    if clean_line.strip():
                        angles_html += f'<li>{self._escape_html(clean_line)}</li>'
                angles_html += '</ul></div>'
        
        # BƯỚC 2: Remove metadata
        content = re.sub(r'^---.*?---\s*', '', content, flags=re.DOTALL)
        content = re.sub(r'^\*\*?TITLE\*\*?:.*?$', '', content, flags=re.MULTILINE)
        content = re.sub(r'^\*\*?SLUG\*\*?:.*?$', '', content, flags=re.MULTILINE)
        content = re.sub(r'^\*\*?CATEGORY\*\*?:.*?$', '', content, flags=re.MULTILINE)
        content = re.sub(r'^\*\*?EXCERPT\*\*?:.*?$', '', content, flags=re.MULTILINE)
        content = re.sub(r'^#\s*\*\*?CONTENT\*\*?\s*$', '', content, flags=re.MULTILINE)
        
        # BƯỚC 3: XÓA HOÀN TOÀN references và angles khỏi content (sau khi đã extract)
        # Phương pháp: Tìm vị trí đầu tiên và cắt toàn bộ phần sau
        
        # Tìm vị trí bắt đầu sớm nhất của NGUỒN hoặc ALT_ANGLES
        cut_position = len(content)  # Mặc định là cuối string
        
        # Thử tất cả patterns cho NGUỒN THAM KHẢO
        nguon_patterns = [
            r'NGUỒN\s+THAM\s+KHẢO\s*:',
            r'##?\s*NGUỒN\s+THAM\s+KHẢO',
            r'Nguồn\s+tham\s+khảo\s*:',
            r'NGUỒN THAM KHẢO',
        ]
        
        for pattern in nguon_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match and match.start() < cut_position:
                cut_position = match.start()
        
        # Thử tất cả patterns cho ALT_ANGLES
        alt_patterns = [
            r'ALT_ANGLES\s*:',
            r'##?\s*ALT_ANGLES',
            r'Góc\s+nhìn\s+khác\s*:',
            r'ALT_ANGLES',
        ]
        
        for pattern in alt_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match and match.start() < cut_position:
                cut_position = match.start()
        
        # Cắt content tại vị trí tìm được
        if cut_position < len(content):
            content = content[:cut_position].rstrip()
        
        # Split content into paragraphs
        paragraphs = content.split('\n')
        formatted_html = []
        
        for para in paragraphs:
            para = para.strip()
            if not para or para == '---':
                continue
            
            # Skip metadata lines
            if re.match(r'^\*\*?(TITLE|SLUG|CATEGORY|EXCERPT|CONTENT)\*\*?:', para, re.IGNORECASE):
                continue
            
            # Skip NGUỒN THAM KHẢO và ALT_ANGLES nếu vẫn còn sót
            if re.match(r'^(?:##?\s*)?(?:NGUỒN\s+THAM\s+KHẢO|ALT_ANGLES|Nguồn\s+tham\s+khảo|Góc\s+nhìn\s+khác)\s*[:\n]?$', para, re.IGNORECASE):
                continue
            
            # Check if already a figure tag (content đã có ảnh rồi từ _insert_images_to_content)
            if para.startswith('<figure') and '</figure>' in para:
                formatted_html.append(para)
                continue
            
            # Check if paragraph is a header with **
            if para.startswith('**') and para.endswith('**'):
                header_text = para.strip('*').strip()
                formatted_html.append(f"<h2>{self._escape_html(header_text)}</h2>")
            elif para.startswith('## '):
                header_text = para.replace('## ', '').strip().strip('*')
                formatted_html.append(f"<h2>{self._escape_html(header_text)}</h2>")
            elif para.startswith('### '):
                header_text = para.replace('### ', '').strip().strip('*')
                formatted_html.append(f"<h3>{self._escape_html(header_text)}</h3>")
            else:
                # Regular paragraph - handle formatting
                # Remove bold ** markers (we don't want bold in content per requirements)
                formatted_para = re.sub(r'\*\*([^*]+)\*\*', r'\1', para)
                # Remove italic * markers (no em tags)
                formatted_para = re.sub(r'\*([^*]+)\*', r'\1', formatted_para)
                formatted_para = re.sub(r'_([^_]+)_', r'\1', formatted_para)
                
                # Skip empty paragraphs after formatting
                if formatted_para.strip():
                    formatted_html.append(f"<p>{formatted_para}</p>")
        
        # Thêm references và angles vào cuối
        if references_html:
            formatted_html.append(references_html)
        if angles_html:
            formatted_html.append(angles_html)
        
        return '\n'.join(formatted_html)
    
    def _generate_context_caption(self, recent_content: List[str], default_alt: str) -> str:
        """Tạo chú thích dựa vào nội dung gần đây"""
        # Lấy text từ các đoạn gần nhất (loại bỏ HTML tags)
        context_text = ' '.join([re.sub(r'<[^>]+>', '', item) for item in recent_content])
        
        # Map từ khóa sang chú thích
        keywords_map = {
            'bitcoin': 'Biểu đồ giá Bitcoin',
            'crypto': 'Thị trường tiền mã hóa',
            'blockchain': 'Công nghệ blockchain',
            'ai': 'Trí tuệ nhân tạo',
            'software': 'Phát triển phần mềm',
            'code': 'Lập trình code',
            'máy tính': 'Hệ thống máy tính',
            'technology': 'Công nghệ hiện đại',
            'data': 'Phân tích dữ liệu',
            'network': 'Mạng lưới kết nối',
            'digital': 'Chuyển đổi số',
            'cloud': 'Điện toán đám mây',
            'security': 'An ninh mạng',
        }
        
        context_lower = context_text.lower()
        for keyword, caption in keywords_map.items():
            if keyword in context_lower:
                return caption
        
        # Fallback về alt text gốc
        return default_alt

    
    def export_article(
        self,
        title: str,
        category: str,
        excerpt: str,
        content: str,
        thumbnail_url: Optional[str] = None,
        thumbnail_alt: Optional[str] = None,
        images: Optional[List[Dict]] = None,
        metadata: Optional[Dict] = None,
        keyword: str = ""
    ) -> str:
        """
        Export article to HTML file
        
        Args:
            title: Article title
            category: Article category
            excerpt: Article excerpt/summary
            content: Article main content (markdown-like)
            thumbnail_url: Hero image URL
            thumbnail_alt: Hero image alt text
            images: List of content images [{'url': '...', 'alt': '...'}]
            metadata: Additional metadata (author, date, etc.)
        
        Returns:
            Path to generated HTML file
        """
        try:
            # Generate filename: [keyword] title.html
            if keyword:
                # Sanitize keyword và title riêng
                safe_keyword = re.sub(r'[^\w\s-]', '', keyword.lower())
                safe_keyword = re.sub(r'[-\s]+', '-', safe_keyword)[:30].strip('-')
                
                safe_title = re.sub(r'[^\w\s-]', '', title.lower())
                safe_title = re.sub(r'[-\s]+', '-', safe_title)[:70].strip('-')
                
                # Format: [keyword] title.html
                filename = f"[{safe_keyword}] {safe_title}.html"
            else:
                filename = self._sanitize_filename(title, is_keyword=False)
            filepath = self.output_dir / filename
            
            # Clean title and excerpt from markdown formatting
            clean_title = re.sub(r'\*\*([^*]+)\*\*', r'\1', title)  # Remove bold
            clean_title = re.sub(r'\*([^*]+)\*', r'\1', clean_title)  # Remove italic markers
            clean_excerpt = re.sub(r'\*\*([^*]+)\*\*', r'\1', excerpt)
            clean_excerpt = re.sub(r'\*([^*]+)\*', r'\1', clean_excerpt)
            
            # Escape HTML in text fields
            safe_title = self._escape_html(clean_title)
            safe_category = self._escape_html(category)
            safe_excerpt = self._escape_html(clean_excerpt)
            
            # Format content with images
            formatted_content = self._format_content(content, images)
            
            # Build hero image section
            hero_html = ""
            if thumbnail_url:
                safe_thumb_alt = self._escape_html(thumbnail_alt or "Article thumbnail")
                # Thumbnail_alt đã là tiếng Việt từ caption_vi
                hero_html = f"""
            <figure class="hero">
              <img src="{thumbnail_url}" alt="{safe_thumb_alt}">
              <figcaption>{safe_thumb_alt}</figcaption>
            </figure>
            """
            
            # Build complete HTML
            html_content = f"""<!doctype html>
        <html lang="vi">
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{safe_title}</title>
        <style>
            body {{
            max-width: 900px;
            margin: 40px auto;
            padding: 0 20px;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif,'Georgia', 'Times New Roman', serif;
            line-height: 1.8;
            font-size: 18px;
            color: #1a1a1a;
            background: #fafafa;
            }}
            h1 {{
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 16px;
            line-height: 1.3;
            color: #000;
            }}
            h2 {{
            margin-top: 40px;
            margin-bottom: 16px;
            font-size: 26px;
            font-weight: 600;
            color: #1a1a1a;
            border-left: 4px solid #2563eb;
            padding-left: 16px;
            }}
            h3 {{
            margin-top: 28px;
            margin-bottom: 12px;
            font-size: 22px;
            font-weight: 600;
            color: #333;
            }}
            .meta {{
            color: #666;
            font-size: 14px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            }}
            .excerpt {{
            font-size: 20px;
            line-height: 1.6;
            margin-bottom: 32px;
            padding: 20px;
            background: #f0f4ff;
            border-left: 4px solid #2563eb;
            color: #1a1a1a;
            }}
            figure.hero {{
            margin: 32px 0;
            }}
            figure.hero img {{
            width: 100%;
            max-height: 500px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }}
            figure.hero figcaption {{
            font-size: 14px;
            color: #666;
            margin-top: 8px;
            text-align: center;
            font-style: italic;
            }}
            img {{
            width: 100%;
            max-width: 800px;
            height: auto;
            display: block;
            margin: 28px auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }}
            figure.content-img {{
            margin: 32px auto;
            text-align: center;
            max-width: 800px;
            }}
            figure.content-img img {{
            width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }}
            figure.content-img figcaption {{
            font-size: 14px;
            color: #666;
            margin-top: 8px;
            font-style: italic;
            text-align: center;
            }}
            article p {{
            margin: 0 0 18px 0;
            text-align: justify;
            }}
            article em {{
            font-style: italic;
            color: #2563eb;
            }}
            .references, .alt-angles {{
            margin-top: 48px;
            padding: 24px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
            }}
            .references h3, .alt-angles h3 {{
            margin-top: 0;
            font-size: 20px;
            color: #1a1a1a;
            }}
            .references ol {{
            margin: 16px 0;
            padding-left: 24px;
            }}
            .references li, .alt-angles li {{
            margin: 8px 0;
            line-height: 1.6;
            }}
            .alt-angles ul {{
            margin: 16px 0;
            padding-left: 24px;
            list-style-type: disc;
            }}
        </style>
        </head>
        <body>
        <h1>{safe_title}</h1>
        <div class="meta">Category: {safe_category}</div>
        <p class="excerpt">{safe_excerpt}</p>

        {hero_html}

        <article>
            {formatted_content}
        </article>
        </body>
        </html>
        """
            
            # Write to file
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            logger.info(f"✅ Exported article to: {filepath}")
            return str(filepath)
            
        except Exception as e:
            logger.error(f"❌ HTML export error: {e}")
            raise


# Singleton instance
html_export_service = HTMLExportService()
