"""
generative_newspaper_mistral - Tự động tạo bài báo từ trending keywords (sử dụng Mistral AI)
"""

import random
import re
import time
import requests
from typing import List, Dict
from pytrends.request import TrendReq
from app.models.schemas import category_map, ArticleCategory
from app.services.mistral_service import MistralService


class generative_newspaper_mistral:
    """Class tự động lấy trending keywords và tạo bài viết sử dụng Mistral AI"""
    
    def __init__(self, api_key: str, unsplash_api_key: str = None):
        """
        Khởi tạo generative_newspaper_mistral
        
        Args:
            api_key: Mistral API key
            unsplash_api_key: Unsplash API key (optional)
        """
        # Khởi tạo pytrends với timeout cao
        self.pytrends = TrendReq(
            hl='vi-VN', 
            tz=420,
            timeout=(10, 30)
        )
        self.trending_keywords: List[str] = []
        
        # Khởi tạo Mistral
        self.mistral = MistralService(api_key=api_key)
        
        # Unsplash API key
        self.unsplash_api_key = unsplash_api_key
        
        print("✅ Khởi tạo generative_newspaper_mistral thành công")
    
    def get_trending_keywords(self) -> List[str]:
        """
        Lấy trending keywords từ Google Trends, chỉ giữ các từ khoá có trong category_map
        Returns:
            List trending keywords hợp lệ
        """
        print(f"\n{'='*80}")
        print("🔍 BẮT ĐẦU LẤY TRENDING KEYWORDS")
        print(f"{'='*80}")
        try:
            trending = self.pytrends.trending_searches(pn='vietnam')
            raw_keywords = trending[0].tolist()
        except Exception as e:
            print(f"⚠️ Lỗi lấy trending từ pytrends: {e}")
            raw_keywords = []
        filtered_keywords = [kw for kw in raw_keywords if kw in category_map]
        if not filtered_keywords:
            print("⚠️ Không có trending hợp lệ, dùng fallback từ category_map!")
            filtered_keywords = list(category_map.keys())
        print(f"✅ HOÀN THÀNH - Tổng cộng: {len(filtered_keywords)} trending hợp lệ")
        for kw in filtered_keywords:
            print(f"➕ Keyword: {kw}")
        return filtered_keywords
    
    def search_images_unsplash(self, keyword: str, count: int = 4) -> List[Dict]:
        """
        Tìm kiếm ảnh từ Unsplash API
        
        Args:
            keyword: Từ khóa tìm kiếm
            count: Số lượng ảnh cần lấy
        
        Returns:
            List các dict chứa url và alt (tiếng Việt)
        """
        if not self.unsplash_api_key:
            print("⚠️ Không có Unsplash API key, dùng ảnh placeholder")
            return [
                {
                    "url": f"https://via.placeholder.com/800x600.png?text={keyword.replace(' ', '+')}+{i}",
                    "alt": f"Hình minh họa {keyword} {i}"
                }
                for i in range(1, count + 1)
            ]
        
        try:
            headers = {"Authorization": f"Client-ID {self.unsplash_api_key}"}
            params = {"query": keyword, "per_page": count, "orientation": "landscape"}
            response = requests.get(
                "https://api.unsplash.com/search/photos",
                headers=headers,
                params=params,
                timeout=10
            )
            
            if response.status_code != 200:
                print(f"⚠️ Unsplash API error: {response.status_code}")
                return []
            
            data = response.json()
            results = data.get('results', [])
            
            images = []
            for idx, photo in enumerate(results[:count], 1):
                # Use Vietnamese caption instead of English alt_description
                images.append({
                    "url": photo['urls']['regular'],
                    "alt": f"Hình minh họa về {keyword}"
                })
            
            print(f"✅ Tìm thấy {len(images)} ảnh từ Unsplash")
            return images
            
        except Exception as e:
            print(f"⚠️ Lỗi tìm kiếm ảnh: {e}")
            return []
    
    def generate_article(self, keyword: str) -> Dict:
        """
        Tạo bài viết chi tiết từ một keyword
        
        Args:
            keyword: Từ khóa để tạo bài viết
        
        Returns:
            Dict chứa title, slug, category, excerpt, content, thumbnail
        """
        category_value = category_map.get(keyword, ArticleCategory.TECHNOLOGY.value)
        
        prompt = f"""Bạn là nhà báo chuyên nghiệp của một tờ báo lớn. Hãy viết một bài báo chi tiết, chuyên sâu về chủ đề: "{keyword}"

⚠️ YÊU CẦU QUAN TRỌNG VỀ NỘI DUNG:
- Viết về TIN TỨC MỚI NHẤT, SỰ KIỆN GÀN ĐÂY (2024-2025)
- NỘI DUNG PHẢI ĐỘC ĐÁO, KHÔNG TRÙNG LẶP với các bài báo khác
- Tập trung vào GÓC ĐỘ MỚI, PHÂN TÍCH SÂU, SỐ LIỆU CỤ THỂ
- Đưa ra CASE STUDY thực tế, SỐ LIỆU CỤ THỂ (nếu có)
- Tránh viết chung chung, sáo rỗng

QUAN TRỌNG - ĐỊNH DẠNG OUTPUT PHẢI ĐÚNG NHU SAU:

TITLE: [chỉ viết tiêu đề, không có dấu * ** hoặc ký tự đặc biệt, 10-15 từ]
SLUG: [slug-viet-thuong-khong-dau]
CATEGORY: {category_value}
EXCERPT: [chỉ viết tóm tắt 2-3 câu, không có dấu * **, 150-200 ký tự]

CONTENT:
[Viết nội dung bài báo ở đây]

VÍ DỤ ĐÚNG:
TITLE: Blockchain 2024 - Công nghệ tương lai của ngành tài chính
SLUG: blockchain-2024-cong-nghe-tuong-lai-cua-nganh-tai-chinh  
CATEGORY: Blockchain
EXCERPT: Năm 2024 chứng kiến sự bùng nổ của blockchain trong nhiều lĩnh vực. Công nghệ này không còn chỉ là nền tảng cho tiền mã hóa mà đang thâm nhập vào cả hệ thống tài chính truyền thống.

CONTENT:
Thế giới đang chứng kiến một cuộc cách mạng...

YÊU CẦU NỘI DUNG:

1. PHONG CÁCH:
   - Viết như báo chí chuyên nghiệp (VnExpress, Thanh Niên)
   - Độ dài: 2000-3000 từ
   - KHÔNG đánh số thứ tự 1.1, 1.2, 2.1
   - KHÔNG dùng **in đậm**
   - Chỉ dùng *in nghiêng* cho thuật ngữ tiếng Anh, tên công ty
   - ĐƯA RA SỐ LIỆU CỤ THỂ, CASE STUDY THỰC TẾ

2. CẤU TRÚC:
   - Mở đầu: 1 đoạn dẫn nhập với HOOK hấp dẫn (không heading)
   - Thân bài: 4-5 phần heading với GÓC NHÌN ĐỘC ĐÁO
   - Kết: Tổng kết triển vọng CỤTH Ể

3. HEADING:
   ## [Tên heading - VD: "Công nghệ blockchain trong tài chính"]
   KHÔNG viết: "## 1. Tên" hoặc "## Phần 1:"
   Mỗi heading phải có GÓC ĐỘ KHÁC NHAU (công nghệ, thị trường, tác động, rủi ro, tương lai)

4. CHÈN ẢNH (QUAN TRỌNG):
   - Chèn [IMG: mô tả tiếng Việt ngắn gọn] ở 3-4 vị trí
   - VÍ DỤ: [IMG: Biểu đồ tăng trưởng blockchain 2024]
   - VÍ DỤ: [IMG: Hệ thống thanh toán blockchain]
   - KHÔNG viết tiếng Anh trong chú thích ảnh

5. TRÍCH DẪN:
   - Nhắc nguồn trong câu: "Theo *McKinsey*, ..."
   - Đưa SỐ LIỆU CỤ THỂ: "Thị trường tăng trưởng 127% trong Q3/2024"

6. KẾT THÚC:
   NGUỒN THAM KHẢO:
   1. [Nguồn 1 - tổ chức uy tín, năm 2024-2025]
   2. [Nguồn 2]
   
   ALT_ANGLES:
   - [Góc nhìn 1 - quan điểm ủng hộ]
   - [Góc nhìn 2 - quan điểm phản biện]
   - [Góc nhìn 3 - góc độ khác]

BẮT ĐẦU VIẾT:"""

        print(f"🤖 Đang tạo bài viết cho: '{keyword}'", flush=True)
        
        try:
            raw_content = self.mistral.generate_content(prompt, max_tokens=8000, temperature=0.7)
            article_data = self._parse_article_response(raw_content, keyword)
            print(f"✅ Tạo nội dung hoàn thành!", flush=True)
        except Exception as e:
            print(f"❌ Lỗi tạo bài viết (Mistral API): {e}")
            return None
        
        # Tạo chú thích ảnh bằng AI dựa trên nội dung (8 ảnh: 1 thumbnail + 7 content)
        image_captions = self._generate_image_captions(article_data['content'], keyword)
        print(f"🖼️  Tạo {len(image_captions)} chú thích ảnh", flush=True)
        
        # Tìm kiếm 8 ảnh từ Unsplash dựa trên chú thích
        images = self._search_images_with_captions(image_captions, keyword)
        
        # 1 ảnh làm thumbnail
        thumbnail = images[0] if images else {"url": "", "alt": keyword}
        
        # 7 ảnh còn lại chèn vào content
        content_with_images = self._insert_images_to_content(
            article_data['content'], 
            images[1:8] if len(images) >= 8 else images[1:]
        )
        
        print(f"✅ Xử lý ảnh hoàn thành!", flush=True)
        
        return {
            "title": article_data['title'],
            "slug": article_data['slug'],
            "category": article_data['category'],
            "status": "draft",
            "excerpt": article_data['excerpt'],
            "content": content_with_images,
            "thumbnail": thumbnail['url'],
            "thumbnail_alt": thumbnail.get('caption_vi', thumbnail['alt']),
            "images": images[1:8] if len(images) >= 8 else images[1:],  # Trả về 7 content images
            "angles": article_data.get('angles', [])
        }
    
    def _generate_image_captions(self, content: str, keyword: str) -> List[str]:
        """
        Tạo chú thích ảnh tiếng Việt dựa trên nội dung bài viết
        
        Args:
            content: Nội dung bài viết
            keyword: Từ khóa chính
        
        Returns:
            List các chú thích tiếng Việt (8 chú thích)
        """
        prompt = f"""Dựa vào nội dung bài báo về '{keyword}', tạo 8 chú thích hình ảnh NGẮN GỌN (5-8 từ) bằng tiếng Việt.

NỘi dung bài:
{content[:3000]}...

Yêu cầu:
- Mỗi chú thích 5-8 từ tiếng Việt
- Phản ánh nội dung chính của bài
- Phù hợp với từ khóa '{keyword}'
- KHÔNG dùng tiếng Anh
- Đa dạng các khía cạnh (công nghệ, ứng dụng, tác động, tương lai, v.v.)

Trả về format:
1. [Chú thích 1]
2. [Chú thích 2]
3. [Chú thích 3]
4. [Chú thích 4]
5. [Chú thích 5]
6. [Chú thích 6]
7. [Chú thích 7]
8. [Chú thích 8]"""
        
        try:
            response = self.mistral.generate_content(prompt, max_tokens=300, temperature=0.7)
            # Parse ra các dòng có số thứ tự
            captions = []
            for line in response.split('\n'):
                match = re.match(r'^\d+\.\s*(.+)$', line.strip())
                if match:
                    caption = match.group(1).strip()
                    # Loại bỏ dấu ngoặc [] và dấu ** nếu có
                    caption = re.sub(r'^\[|\]$', '', caption)
                    caption = re.sub(r'\*\*([^*]+)\*\*', r'\1', caption)  # Loại bỏ **text**
                    caption = re.sub(r'\*([^*]+)\*', r'\1', caption)  # Loại bỏ *text*
                    captions.append(caption)
            
            # Đảm bảo luôn có 8 chú thích
            while len(captions) < 8:
                captions.append(f"Hình minh họa về {keyword}")
            
            return captions[:8]
        except Exception as e:
            print(f"⚠️ Lỗi tạo chú thích: {e}")
            # Fallback
            return [
                f"Biểu đồ {keyword}",
                f"Công nghệ {keyword}",
                f"Hệ thống {keyword}",
                f"Phân tích {keyword}",
                f"Ứng dụng {keyword}",
                f"Tương lai {keyword}",
                f"Phát triển {keyword}",
                f"Giải pháp {keyword}"
            ]
    
    def _search_images_with_captions(self, captions: List[str], keyword: str) -> List[Dict]:
        """
        Tìm ảnh dựa trên chú thích tiếng Việt với đa dạng query
        
        Args:
            captions: List chú thích tiếng Việt (8 captions)
            keyword: Từ khóa chính
        
        Returns:
            List các dict {'url': '...', 'alt': '...', 'caption_vi': '...'}
        """
        all_images = []
        seen_urls = set()
        
        # Tạo các query đa dạng dựa trên keyword (20+ variations - trending topics)
        search_queries = [
            keyword,
            # Tech & Innovation
            f"{keyword} technology",
            f"{keyword} innovation",
            f"{keyword} digital transformation",
            f"{keyword} ai artificial intelligence",
            f"{keyword} future trends",
            # Business & Finance
            f"{keyword} business",
            f"{keyword} finance investment",
            f"{keyword} market analysis",
            f"{keyword} economy growth",
            f"{keyword} startup entrepreneur",
            # Lifestyle & Entertainment
            f"{keyword} lifestyle",
            f"{keyword} entertainment",
            f"{keyword} culture social",
            f"{keyword} travel tourism",
            f"{keyword} fashion style",
            # Health & Sports
            f"{keyword} health wellness",
            f"{keyword} sports fitness",
            f"{keyword} medical healthcare",
            # General trending
            f"{keyword} news latest",
            f"{keyword} trending viral",
            f"{keyword} modern contemporary",
            f"{keyword} global international",
            f"{keyword} sustainability green"
        ]
        
        # Tìm 1 ảnh cho mỗi query khác nhau
        for i, query in enumerate(search_queries[:8]):
            try:
                images = self.search_images_unsplash(query, count=2)  # Lấy 2 để có backup
                if images:
                    for img in images:
                        if img['url'] not in seen_urls:
                            seen_urls.add(img['url'])
                            # Gắn chú thích tiếng Việt tương ứng
                            if i < len(captions):
                                img['caption_vi'] = captions[i]
                            else:
                                img['caption_vi'] = f"Hình minh họa về {keyword}"
                            all_images.append(img)
                            break  # Chỉ lấy 1 ảnh unique cho mỗi query
                        
                # Ngủ ngắn giữa các request
                time.sleep(0.5)
                
                # Nếu đã đủ 8 ảnh thì dừng
                if len(all_images) >= 8:
                    break
                    
            except Exception as e:
                print(f"⚠️ Lỗi tìm ảnh cho '{query}': {e}")
        
        # Nếu vẫn chưa đủ 8 ảnh, bổ sung bằng search chung
        while len(all_images) < 8:
            try:
                fallback_images = self.search_images_unsplash(keyword, count=8 - len(all_images))
                for img in fallback_images:
                    if img['url'] not in seen_urls:
                        seen_urls.add(img['url'])
                        idx = len(all_images)
                        if idx < len(captions):
                            img['caption_vi'] = captions[idx]
                        else:
                            img['caption_vi'] = f"Hình minh họa về {keyword}"
                        all_images.append(img)
                        if len(all_images) >= 8:
                            break
                break
            except:
                break
        
        return all_images[:8]
    
    def _parse_article_response(self, raw_text: str, keyword: str) -> Dict:
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
        
        # Extract và clean
        title = title_match.group(1).strip() if title_match else f"Bài viết về {keyword}"
        # Remove markdown formatting from title
        title = re.sub(r'\*\*|\*|__|_', '', title).strip()
        
        slug = slug_match.group(1).strip() if slug_match else keyword.lower().replace(' ', '-')
        category_raw = category_match.group(1).strip() if category_match else keyword
        
        # Normalize category
        category = None
        if category_raw in category_map:
            category = category_map[category_raw]
        else:
            raw_lower = category_raw.lower()
            for c in ArticleCategory:
                if c.value.lower() == raw_lower:
                    category = c.value
                    break
            if not category:
                category = ArticleCategory.TECHNOLOGY.value
        
        excerpt = excerpt_match.group(1).strip() if excerpt_match else raw_text[:200]
        # Remove markdown formatting from excerpt
        excerpt = re.sub(r'\*\*|\*|__|_', '', excerpt).strip()
        # Remove any leftover format labels like "TITLE:", "SLUG:", etc from excerpt
        excerpt = re.sub(r'^(---|TITLE:|SLUG:|CATEGORY:|EXCERPT:).*', '', excerpt, flags=re.MULTILINE).strip()
        # Take first 300 chars if still too long
        if len(excerpt) > 300:
            excerpt = excerpt[:300].rsplit('.', 1)[0] + '.'
        
        content = content_match.group(1).strip() if content_match else raw_text

        # Parse ALT_ANGLES
        angles = []
        angles_match = re.search(r'ALT_ANGLES:\s*(.+)$', raw_text, re.IGNORECASE | re.DOTALL)
        if angles_match:
            angles_block = angles_match.group(1).strip()
            lines = [l.strip() for l in angles_block.splitlines()]
            for line in lines:
                m = re.match(r'^[\-\*\d\.\)\s]*(.+)$', line)
                if m:
                    text = m.group(1).strip()
                    if text:
                        angles.append(text)

        return {
            "title": title,
            "slug": slug,
            "category": category,
            "excerpt": excerpt,
            "content": content,
            "angles": angles
        }
    
    def _translate_image_caption(self, alt_text: str, keyword: str = "") -> str:
        """Dịch chú thích ảnh sang tiếng Việt"""
        translations = {
            'bitcoin': 'Bitcoin', 'cryptocurrency': 'Tiền điện tử', 'crypto': 'Crypto',
            'blockchain': 'Blockchain', 'technology': 'Công nghệ', 'computer': 'Máy tính',
            'illustration': 'Minh họa', 'image': 'Hình ảnh', 'chart': 'Biểu đồ',
            'coin': 'Đồng tiền', 'phone': 'Điện thoại', 'screen': 'Màn hình',
            'person': 'Người', 'hand': 'Tay', 'cube': 'Khối', 'blue': 'xanh', 'red': 'đỏ',
            'golden': 'vàng', 'black': 'đen', 'holding': 'cầm', 'showing': 'hiển thị',
        }
        
        if not alt_text or len(alt_text.strip()) < 3:
            return f"Hình minh họa về {keyword}"
        
        caption_lower = alt_text.lower()
        vietnamese = caption_lower
        for en, vi in translations.items():
            vietnamese = vietnamese.replace(en, vi)
        
        english_words = len([w for w in vietnamese.split() if w.isalpha() and not any(ord(c) > 127 for c in w)])
        if english_words > len(vietnamese.split()) * 0.5:
            return f"Hình minh họa liên quan đến {keyword}"
        
        return vietnamese.strip().capitalize()
    
    def _insert_images_to_content(self, content: str, images: List[Dict]) -> str:
        """
        Tìm và thay thế [IMG: ...] placeholders bằng ảnh thực tế
        
        Args:
            content: Nội dung bài viết có chứa [IMG: mô tả]
            images: List các dict chứa url và alt của ảnh
        
        Returns:
            Content đã thay thế placeholders bằng ảnh
        """
        if not images:
            return content
        
        # Loại bỏ ảnh trùng URL
        unique_images = []
        seen_urls = set()
        for img in images:
            url = img.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_images.append(img)
        
        if not unique_images:
            return content
        
        # Tìm tất cả [IMG: ...] placeholders
        img_pattern = re.compile(r'\[IMG:\s*([^\]]+)\]', re.IGNORECASE)
        placeholders = list(img_pattern.finditer(content))
        
        if not placeholders:
            # Nếu không có placeholder, return nguyên content
            return content
        
        # Thay thế từng placeholder bằng ảnh tương ứng
        result = content
        for idx, match in enumerate(reversed(placeholders)):  # Reverse để không ảnh hưởng index
            if idx < len(unique_images):
                image = unique_images[idx]
                img_url = image["url"]
                
                # Lấy mô tả từ placeholder hoặc dùng caption_vi
                placeholder_text = match.group(1).strip()
                vietnamese_caption = image.get("caption_vi", placeholder_text)
                
                image_figure = (
                    f'\n\n<figure class="content-img">'
                    f'<img src="{img_url}" alt="{image["alt"]}">'
                    f'<figcaption>{vietnamese_caption}</figcaption>'
                    f'</figure>\n\n'
                )
                
                # Thay thế placeholder
                result = result[:match.start()] + image_figure + result[match.end():]
        
        return result
    
    def _generate_contextual_caption(self, paragraph_text: str, alt_text: str) -> str:
        """Tạo chú thích dựa vào nội dung đoạn văn"""
        # Từ khóa mapping theo ngữ cảnh
        context_keywords = {
            'bitcoin': 'Biểu đồ giá Bitcoin',
            'blockchain': 'Công nghệ blockchain',
            'giao dịch': 'Hệ thống giao dịch',
            'crypto': 'Thị trường crypto',
            'ai': 'Trí tuệ nhân tạo',
            'model': 'Mô hình AI',
            'software': 'Phát triển phần mềm',
            'code': 'Lập trình code',
            'máy tính': 'Hệ thống máy tính',
            'dữ liệu': 'Phân tích dữ liệu',
            'mạng': 'Mạng lưới kết nối',
            'bảo mật': 'An ninh mạng',
            'đầu tư': 'Đầu tư tài chính',
            'kinh tế': 'Phân tích kinh tế',
        }
        
        paragraph_lower = paragraph_text.lower()
        
        # Tìm từ khóa phù hợp nhất trong paragraph
        for keyword, caption in context_keywords.items():
            if keyword in paragraph_lower:
                return caption
        
        # Fallback: dịch alt_text
        return self._translate_image_caption(alt_text, "")
    
    def run(self):
        """
        Chạy quy trình tự động:
        1. Lấy trending keywords
        2. Random chọn 1 keyword  
        3. Tạo bài viết
        4. Log kết quả
        """
        print(f"\n{'#'*80}")
        print("🚀 BẮT ĐẦU QUY TRÌNH TỰ ĐỘNG TẠO BÀI VIẾT (MISTRAL AI)")
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
        
        if not article:
            print("❌ Không tạo được bài viết!")
            return None
        
        # Bước 4: Log kết quả
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
        print(f"🔤 Word count: ~{len(article['content'].split())} từ")
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
