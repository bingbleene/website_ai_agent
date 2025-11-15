"""
generative_newspaper - Tự động tạo bài báo từ trending keywords
"""
import random
import time
import requests
from typing import List, Dict
from pytrends.request import TrendReq
import google.generativeai as genai


class generative_newspaper:
    """Class tự động lấy trending keywords và tạo bài viết"""
    
    def __init__(self, api_key: str, unsplash_api_key: str = None):
        """
        Khởi tạo generative_newspaper
        
        Args:
            api_key: Google Gemini API key
            unsplash_api_key: Unsplash API key (optional)
        """
        # Khởi tạo pytrends với timeout cao
        self.pytrends = TrendReq(
            hl='vi-VN', 
            tz=420,
            timeout=(10, 30)  # connection timeout, read timeout
        )
        self.trending_keywords: List[str] = []
        
        # Khởi tạo Gemini
        genai.configure(api_key=api_key)
        # Sử dụng model mới nhất: gemini-2.5-flash
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        # Unsplash API key
        self.unsplash_api_key = unsplash_api_key
        
        print("✅ Khởi tạo generative_newspaper thành công")
    
    def get_trending_keywords(self) -> List[str]:
        """
        Lấy 20 từ khóa hot trending về: Việt Nam, Công Nghệ, Crypto, Du lịch
        
        Returns:
            List 20 từ khóa trending
        """
        # Fallback keywords nếu API bị rate limit
        fallback_keywords = [
            # Việt Nam
            "công nghệ AI", "bóng đá việt nam", "AI trong học đường", "giá vàng việt nam", "chứng khoán",
            # Công nghệ
            "AI 2025", "chatgpt", "trí tuệ nhân tạo", "điện thoại mới", "công nghệ blockchain", "AI Agent",
            # Crypto
            "bitcoin", "crypto 2025", "ethereum", "giá bitcoin", "đầu tư crypto",
            # Du lịch
            "tour du lịch", "du lịch việt nam", "khu du lịch", "du lịch hè", "điểm du lịch hot"
        ]
        
        topics = ["Việt Nam", "Công Nghệ", "Crypto", "Du lịch"]
        all_keywords = []
        
        print(f"\n{'='*80}")
        print("🔍 BẮT ĐẦU LẤY TRENDING KEYWORDS")
        print(f"{'='*80}")
        
        def _pytrends_call(name, *args, retries: int = 4, initial_delay: float = 2.0, **kwargs):
            """Helper to call pytrends methods with retry + exponential backoff.

            name: method name on self.pytrends (str)
            args/kwargs: forwarded to the method
            retries: number of attempts
            initial_delay: base delay in seconds
            """
            for attempt in range(1, retries + 1):
                try:
                    method = getattr(self.pytrends, name)
                    return method(*args, **kwargs)
                except Exception as e:
                    # If last attempt, re-raise so caller can fallback
                    if attempt == retries:
                        print(f"   ❌ pytrends.{name} failed after {retries} attempts: {e}")
                        raise
                    # Exponential backoff with jitter
                    delay = initial_delay * (2 ** (attempt - 1)) + random.random()
                    print(f"   ⚠️ pytrends.{name} failed (attempt {attempt}/{retries}): {e}")
                    print(f"      → Retrying in {delay:.1f}s...")
                    time.sleep(delay)

        for topic in topics:
            try:
                print(f"\n📊 Đang tìm trending cho: {topic}")

                # Increase delay to reduce chance of 429 (randomize a bit)
                wait = random.uniform(3.0, 6.0)
                print(f"   ⏳ Đợi {wait:.1f} giây để tránh rate limit...")
                time.sleep(wait)

                # Build payload with retries
                _pytrends_call('build_payload', [topic], timeframe='now 7-d', retries=4, initial_delay=2.0)

                # Get related queries with retries
                related = _pytrends_call('related_queries', retries=4, initial_delay=2.0)

                if topic in related:
                    top = related[topic].get('top')
                    if top is not None and not top.empty:
                        keywords = top['query'].tolist()[:5]
                        all_keywords.extend(keywords)
                        print(f"   ✅ Lấy được {len(keywords)} keywords:")
                        for kw in keywords:
                            print(f"      • {kw}")

            except Exception:
                # Don't print the low-level stack here; helper already logged attempts
                print(f"   ⚠️ Sử dụng fallback keywords cho {topic}")
        
        # Nếu không lấy được từ API, dùng fallback NGAY
        if len(all_keywords) < 10:  # Giảm threshold xuống 10
            print(f"\n⚠️ API chậm hoặc bị rate limit (chỉ có {len(all_keywords)} keywords)")
            print(f"   → Sử dụng fallback keywords")
            all_keywords = fallback_keywords
        # Nếu không đủ 20, lấy thêm từ trending searches Vietnam
        elif len(all_keywords) < 20:
            try:
                print(f"\n📊 Lấy thêm từ Trending Searches Vietnam...")
                time.sleep(2)  # Giảm từ 3 xuống 2
                trending = self.pytrends.trending_searches(pn='vietnam')
                extra_keywords = trending[0].tolist()
                all_keywords.extend(extra_keywords)
                print(f"   ✅ Lấy thêm được {len(extra_keywords)} keywords")
            except Exception as e:
                print(f"   ❌ Lỗi: {e}")
        
        # Loại bỏ duplicate, lấy 20 đầu tiên
        self.trending_keywords = list(dict.fromkeys(all_keywords))[:20]
        
        print(f"\n{'='*80}")
        print(f"✅ HOÀN THÀNH - Tổng cộng: {len(self.trending_keywords)} unique keywords")
        print(f"{'='*80}")
        
        return self.trending_keywords
    
    def search_images_unsplash(self, keyword: str, count: int = 4) -> List[Dict]:
        """
        Tìm kiếm ảnh từ Unsplash API
        
        Args:
            keyword: Từ khóa tìm kiếm
            count: Số lượng ảnh cần lấy
        
        Returns:
            List các dict chứa image_url và alt_description
        """
        if not self.unsplash_api_key:
            print("⚠️ Không có Unsplash API key, dùng ảnh placeholder")
            return [
                {
                    "url": f"https://via.placeholder.com/1200x800?text={keyword.replace(' ', '+')}+{i+1}",
                    "alt": f"Image about {keyword} {i+1}"
                }
                for i in range(count)
            ]
        
        try:
            print(f"🖼️ Đang tìm {count} ảnh cho keyword: '{keyword}'")
            
            headers = {
                "Authorization": f"Client-ID {self.unsplash_api_key}"
            }
            
            params = {
                "query": keyword,
                "per_page": count,
                "orientation": "landscape",
                "order_by": "latest"  # Latest photos thay vì relevant để có ảnh đa dạng hơn
            }
            
            response = requests.get(
                "https://api.unsplash.com/search/photos",
                headers=headers,
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                images = []
                
                for photo in data.get('results', [])[:count]:
                    images.append({
                        "url": photo['urls']['regular'],  # 1080px width
                        "alt": photo.get('alt_description') or photo.get('description') or keyword
                    })
                
                print(f"✅ Lấy được {len(images)} ảnh từ Unsplash")
                return images
            else:
                print(f"⚠️ Unsplash API error: {response.status_code}, dùng placeholder")
                return [
                    {
                        "url": f"https://via.placeholder.com/1200x800?text={keyword.replace(' ', '+')}+{i+1}",
                        "alt": f"Image about {keyword} {i+1}"
                    }
                    for i in range(count)
                ]
        
        except Exception as e:
            print(f"❌ Lỗi tìm ảnh: {e}, dùng placeholder")
            return [
                {
                    "url": f"https://via.placeholder.com/1200x800?text={keyword.replace(' ', '+')}+{i+1}",
                    "alt": f"Image about {keyword} {i+1}"
                }
                for i in range(count)
            ]

    
    def generate_article(self, keyword: str) -> dict:
        """
        Tạo bài viết từ keyword sử dụng Gemini AI (sync)
        
        Args:
            keyword: Từ khóa để tạo bài viết
        
        Returns:
            Dict chứa: title, slug, excerpt, content, category, status, thumbnail, images
        """
        prompt = f"""Viết một bài viết chi tiết về chủ đề: "{keyword}"

Yêu cầu format trả về CHÍNH XÁC theo mẫu sau (bắt buộc):

TITLE: [Tiêu đề hấp dẫn 80-100 ký tự]
SLUG: [url-slug-khong-dau]
CATEGORY: [Chọn 1 trong: Technology, Business, Health, Travel, Entertainment, Sports, Science, Politics, Lifestyle, Education]
EXCERPT: [Tóm tắt ngắn 150-200 từ]
CONTENT:
[Nội dung chính đầy đủ 1000-1500 từ, chia thành 3-4 phần với tiêu đề phụ rõ ràng. 
Mỗi phần cách nhau bằng 2 dòng trống để dễ chèn ảnh.]

Lưu ý:
- TITLE: Tiêu đề hấp dẫn, thu hút người đọc
- SLUG: Viết liền không dấu, cách nhau bằng dấu gạch ngang (ví dụ: bitcoin-tang-gia-manh)
- CATEGORY: Phân loại chính xác theo nội dung bài viết
- EXCERPT: Tóm tắt ngắn gọn nội dung bài viết
- CONTENT: Nội dung đầy đủ, chuyên nghiệp, có cấu trúc rõ ràng
- Ngôn ngữ: Tiếng Việt
- Phong cách: Chuyên nghiệp, dễ hiểu

Bắt đầu viết ngay bây giờ theo ĐÚNG format trên:"""

        print(f"🤖 Đang tạo bài viết cho: '{keyword}'", flush=True)
        
        config = genai.types.GenerationConfig(
            max_output_tokens=8000,
            temperature=0.7
        )
        
        response = self.model.generate_content(prompt, generation_config=config)
        raw_content = response.text
        
        # Parse response thành structured data
        article_data = self._parse_article_response(raw_content, keyword)
        
        print(f"✅ Tạo nội dung hoàn thành!", flush=True)
        
        # Tìm kiếm 4 ảnh từ Unsplash
        images = self.search_images_unsplash(keyword, count=4)
        
        # 1 ảnh làm thumbnail
        thumbnail = images[0] if images else {"url": "", "alt": keyword}
        
        # 3 ảnh còn lại chèn vào content
        content_with_images = self._insert_images_to_content(
            article_data['content'], 
            images[1:4] if len(images) >= 4 else images[1:]
        )
        
        print(f"✅ Xử lý ảnh hoàn thành!", flush=True)
        
        return {
            "title": article_data['title'],
            "slug": article_data['slug'],
            "category": article_data['category'],
            "status": "draft",  # Mặc định là draft
            "excerpt": article_data['excerpt'],
            "content": content_with_images,
            "thumbnail": thumbnail['url'],
            "thumbnail_alt": thumbnail['alt']
        }
    
    def _parse_article_response(self, raw_text: str, keyword: str) -> dict:
        """
        Parse response từ AI thành structured data
        
        Args:
            raw_text: Raw text từ AI
            keyword: Keyword gốc (dùng làm fallback)
        
        Returns:
            Dict chứa title, slug, category, excerpt, content
        """
        import re
        
        # Tìm các phần trong response
        title_match = re.search(r'TITLE:\s*(.+?)(?:\n|$)', raw_text, re.IGNORECASE)
        slug_match = re.search(r'SLUG:\s*(.+?)(?:\n|$)', raw_text, re.IGNORECASE)
        category_match = re.search(r'CATEGORY:\s*(.+?)(?:\n|$)', raw_text, re.IGNORECASE)
        excerpt_match = re.search(r'EXCERPT:\s*(.+?)(?=\nCONTENT:|\n\n)', raw_text, re.IGNORECASE | re.DOTALL)
        content_match = re.search(r'CONTENT:\s*(.+)', raw_text, re.IGNORECASE | re.DOTALL)
        
        # Extract hoặc dùng fallback
        title = title_match.group(1).strip() if title_match else f"Bài viết về {keyword}"
        slug = slug_match.group(1).strip() if slug_match else keyword.lower().replace(' ', '-')
        category = category_match.group(1).strip() if category_match else "Technology"
        excerpt = excerpt_match.group(1).strip() if excerpt_match else raw_text[:200]
        content = content_match.group(1).strip() if content_match else raw_text
        
        return {
            "title": title,
            "slug": slug,
            "category": category,
            "excerpt": excerpt,
            "content": content
        }
    
    def _insert_images_to_content(self, content: str, images: List[Dict]) -> str:
        """
        Chèn ảnh ngẫu nhiên vào giữa các đoạn trong content
        
        Args:
            content: Nội dung bài viết
            images: List các dict chứa url và alt của ảnh
        
        Returns:
            Content đã được chèn ảnh
        """
        if not images:
            return content
        
        # Tách content thành các đoạn (split bằng 2 dòng trống hoặc tiêu đề)
        paragraphs = content.split('\n\n')
        
        # Nếu có ít hơn 3 đoạn, không chèn ảnh
        if len(paragraphs) < 3:
            return content
        
        # Chọn vị trí ngẫu nhiên để chèn ảnh (không chèn ở đoạn đầu và cuối)
        available_positions = list(range(1, len(paragraphs) - 1))
        
        # Chọn tối đa 3 vị trí ngẫu nhiên
        insert_positions = random.sample(
            available_positions, 
            min(len(images), len(available_positions), 3)
        )
        insert_positions.sort(reverse=True)  # Sort ngược để chèn từ cuối
        
        # Chèn ảnh vào các vị trí đã chọn
        for idx, position in enumerate(insert_positions):
            if idx < len(images):
                image = images[idx]
                image_html = f'\n\n<img src="{image["url"]}" alt="{image["alt"]}" style="width:100%; max-width:800px; height:auto; margin:20px 0;">\n\n'
                paragraphs.insert(position + 1, image_html)
        
        return '\n\n'.join(paragraphs)
    
    def run(self):
        """
        Chạy quy trình tự động:
        1. Lấy 20 trending keywords
        2. Random chọn 1 keyword  
        3. Tạo bài viết
        4. Log kết quả
        """
        print(f"\n{'#'*80}")
        print("🚀 BẮT ĐẦU QUY TRÌNH TỰ ĐỘNG TẠO BÀI VIẾT")
        print(f"{'#'*80}")
        
        # Bước 1: Lấy trending keywords
        print("\n[BƯỚC 1] Lấy trending keywords...")
        keywords = self.get_trending_keywords()
        
        if not keywords:
            print("❌ Không lấy được keywords!")
            return None
        
        print(f"\n📋 Danh sách {len(keywords)} trending keywords:")
        for i, kw in enumerate(keywords, 1):
            print(f"   {i:2d}. {kw}")
        
        # Bước 2: Random chọn 1 keyword
        print(f"\n[BƯỚC 2] Random chọn keyword...")
        selected = random.choice(keywords)
        print(f"🎲 Đã chọn: '{selected}'")
        
        # Bước 3: Tạo bài viết và xử lý ảnh
        print(f"\n[BƯỚC 3] Tạo bài viết và xử lý ảnh...")
        print("⏳ Đang xử lý, vui lòng đợi...\n", flush=True)
        
        article = self.generate_article(selected)
        
        # Bước 4: Log kết quả SAU KHI xử lý xong HẾT
        print(f"\n{'='*80}")
        print("📝 KẾT QUẢ CUỐI CÙNG")
        print(f"{'='*80}")
        print(f"🔑 Keyword: {selected}")
        print(f"📰 Title: {article['title']}")
        print(f"🔗 Slug: {article['slug']}")
        print(f"📂 Category: {article['category']}")
        print(f"📊 Status: {article['status']}")
        print(f"🖼️ Thumbnail: {article['thumbnail'][:80]}...")
        print(f"📝 Excerpt: {len(article['excerpt'])} ký tự")
        print(f"📄 Content: {len(article['content'])} ký tự")
        print(f"{'='*80}")
        print("✅ HOÀN THÀNH QUY TRÌNH")
        print(f"{'='*80}\n")
        
        return {
            "keyword": selected,
            "title": article['title'],
            "slug": article['slug'],
            "category": article['category'],
            "status": article['status'],
            "excerpt": article['excerpt'],
            "content": article['content'],
            "thumbnail": article['thumbnail'],
            "thumbnail_alt": article['thumbnail_alt'],
            "content_length": len(article['content']),
            "word_count": len(article['content'].split())
        }
    
    def generate_full_article(self, keyword: str) -> Dict:
        """
        Tạo bài viết HOÀN CHỈNH từ 1 keyword cho scheduler
        
        Args:
            keyword: Từ khóa để tạo bài viết
            
        Returns:
            Dict chứa tất cả fields cần thiết cho MongoDB
        """
        print(f"📝 Generating article for keyword: {keyword}")
        
        # Sinh article cơ bản
        article = self.generate_article(keyword)
        
        # Map category AI sang enum backend
        category_map = {
            "AI Models": "technology",
            "Tech Innovations": "technology", 
            "Blockchain": "technology",
            "Software": "technology",
            "Healthcare": "health",
            "Finance": "business",
            "Economy": "business",
            "Politics": "politics",
            "Sports": "sports",
            "Entertainment": "entertainment",
            "Science": "science",
            "World News": "world",
            "Local News": "local",
            "Technology": "technology",
            "Công nghệ": "technology",
            "Kinh tế": "business",
            "Chính trị": "politics",
            "Thể thao": "sports",
            "Giải trí": "entertainment",
            "Sức khỏe": "health",
            "Khoa học": "science"
        }
        
        api_category = category_map.get(article.get('category', 'Technology'), 'technology')
        
        return {
            "title": article['title'],
            "slug": article['slug'],
            "excerpt": article['excerpt'],
            "content": article['content'],  # Đã có 3 ảnh
            "category": api_category,
            "status": "published",
            "thumbnail": article['thumbnail'],
            "tags": [keyword] + article.get('tags', [])
        }


# Main để chạy script
if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    
    # Load environment variables
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    unsplash_key = os.getenv("UNSPLASH_ACCESS_KEY")
    
    if not api_key:
        print("❌ Thiếu GEMINI_API_KEY trong .env file!")
        print("💡 Thêm vào file .env: GEMINI_API_KEY=your_api_key_here")
        exit(1)
    
    print("🚀 Starting generative_newspaper...")
    print(f"📁 Script: {__file__}")
    print(f"📁 Unsplash API: {'✅ Configured' if unsplash_key else '⚠️ Not configured (will use placeholders)'}")
    print(f"{'-'*80}\n")
    
    # Khởi tạo và chạy
    newspaper = generative_newspaper(api_key=api_key, unsplash_api_key=unsplash_key)
    result = newspaper.run()
    
    if result:
        print(f"\n{'#'*80}")
        print("✅ SCRIPT CHẠY THÀNH CÔNG!")
        print(f"{'#'*80}")
        print(f"Keyword: {result['keyword']}")
        print(f"Title: {result['title']}")
        print(f"Slug: {result['slug']}")
        print(f"Category: {result['category']}")
        print(f"Status: {result['status']}")
        print(f"Excerpt length: {len(result['excerpt'])} chars")
        print(f"Content length: {result['content_length']} chars")
        print(f"Word count: ~{result['word_count']} words")
        print(f"{'#'*80}\n")
        
        # In JSON output
        import json
        print("\n" + "="*80)
        print("📄 JSON OUTPUT:")
        print("="*80)
        json_output = {
            "title": result['title'],
            "slug": result['slug'],
            "category": result['category'],
            "status": result['status'],
            "excerpt": result['excerpt'],
            "content": result['content'],
            "thumbnail": result['thumbnail'],
            "thumbnail_alt": result['thumbnail_alt']
        }
        print(json.dumps(json_output, ensure_ascii=False, indent=2))
        print("="*80)
