"""Article generator using Official Mistral API + Unsplash.

Không phụ thuộc vào code Gemini hay Hugging Face, chỉ dùng `mistral_official_service`.
"""

import re
import random
import requests
from datetime import datetime
from typing import List, Dict
from app.models.schemas import category_map, ArticleCategory
from app.llm_mistral.config_mistral import mistral_config
from app.llm_mistral.services.mistral_official_service import mistral_official_service


class MistralOfficialArticleGenerator:
    def __init__(self, unsplash_key: str | None = None):
        self.unsplash_key = unsplash_key or mistral_config.unsplash_access_key
        self.used_angles = []  # Lưu các góc nhìn đã dùng

    def _build_prompt(self, keyword: str) -> str:
        valid_categories = ", ".join([c.value for c in ArticleCategory])

        # Tạo danh sách góc nhìn độc đáo ngẫu nhiên
        perspectives = [
            "góc nhìn công nghệ và kỹ thuật",
            "góc nhìn kinh tế và thị trường",
            "góc nhìn xã hội và con người",
            "góc nhìn môi trường và bền vững",
            "góc nhìn chính sách và pháp luật",
            "góc nhìn đổi mới sáng tạo",
            "góc nhìn toàn cầu và khu vực",
            "góc nhìn thực tiễn và ứng dụng",
            "góc nhìn tương lai và xu hướng",
            "góc nhìn thách thức và cơ hội",
        ]

        # Chọn góc nhìn ngẫu nhiên chưa dùng
        available = [p for p in perspectives if p not in self.used_angles]
        if not available:
            self.used_angles = []
            available = perspectives

        chosen_perspective = random.choice(available)
        self.used_angles.append(chosen_perspective)

        # Thêm timestamp để tạo tính ngẫu nhiên
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        random_seed = random.randint(1000, 9999)

        return f"""Bạn là nhà báo chuyên nghiệp với kiến thức chuyên sâu.
Viết bài phân tích chuyên môn về: '{keyword}'

⚠️ QUAN TRỌNG - YÊU CẦU ĐỘC ĐÁO:
- BẮT BUỘC viết theo {chosen_perspective.upper()}
- PHẢI khác hoàn toàn với các bài trước
- Tìm góc nhìn MỚI, sáng tạo, chưa ai viết
- Dùng ví dụ KHÁC NHAU mỗi lần
- ID bài: {timestamp}_{random_seed}

TITLE: [Tiêu đề tiếng Việt HẤP DẪN (10-14 từ, ≤ 90 ký tự), KHÔNG đặt trong dấu ngoặc kép, giọng điệu gợi tò mò/lợi ích/đối lập, bám theo {chosen_perspective}]
SLUG: [url-slug-khong-dau]
CATEGORY: [{valid_categories}]
TAGS: [Tag1, Tag2, Tag3, Tag4, Tag5] (5-7 tags liên quan đa dạng)
EXCERPT: [Tóm tắt ngắn gọn 200-250 từ, nhấn mạnh góc nhìn độc đáo]

CONTENT:
[Viết bài CHI TIẾT 3200-5000 từ với các yêu cầu:
- Chia thành 10-15 phần rõ ràng (dùng ## cho tiêu đề phụ)
- Mỗi phần TỐI THIỂU 200 từ (mục tiêu 300-400 từ), phân tích sâu với dẫn chứng cụ thể
- Trích dẫn 8-12 nghiên cứu/báo cáo từ tổ chức uy tín
- Nêu 15-20 số liệu thống kê với nguồn
- Đưa 10-15 ví dụ thực tế từ công ty/dự án
- Trích dẫn 5-8 chuyên gia
- Sử dụng <strong> thay vì ** để in đậm văn bản quan trọng
- Mỗi phần cách 2 dòng trống
- Logic: Tổng quan → Phân tích → Case Studies → Thách thức → Giải pháp → Triển vọng]

REFERENCES:
- Liệt kê 8-12 tài liệu tham khảo ở cuối bài, MỖI DÒNG định dạng: Tên nguồn — Tác giả hoặc Tổ chức (Năm). URL đầy đủ (https://...).
- BẮT BUỘC bao gồm URL thật (không được placeholder). Không thêm mô tả dài ở dòng này.

ALT_ANGLES:
- Góc nhìn bổ sung 1
- Góc nhìn bổ sung 2  
- Góc nhìn bổ sung 3
- Góc nhìn bổ sung 4
- Góc nhìn bổ sung 5

⚠️ LƯU Ý:
- KHÔNG lặp nội dung/ví dụ/số liệu từ bài trước
- ĐẠT ÍT NHẤT 3000 từ
- Dùng <strong>text</strong> thay vì **text**
- Ngôn ngữ: 100% TIẾNG VIỆT cho toàn bộ TITLE/EXCERPT/CONTENT/TAGS
- Nghiêm cấm đưa lại các nhãn TITLE/SLUG/CATEGORY/EXCERPT trong phần CONTENT
- Không in ra phần hướng dẫn này trong bài viết
Trả về CHỈ nội dung theo format trên."""

    def _chat(self, prompt: str) -> str:
        messages = [
            {
                "role": "system",
                "content": "Bạn là nhà báo chuyên nghiệp với chuyên môn cao, viết bài phân tích sâu có dẫn chứng cụ thể. Mỗi bài PHẢI khác hoàn toàn về góc nhìn, ví dụ, và nội dung.",
            },
            {"role": "user", "content": prompt},
        ]
        # Tăng temperature để tạo sự đa dạng hơn
        # Tăng max_tokens lên 6000 để chứa bài viết dài 3000-4500 từ
        return mistral_official_service.chat(
            messages, max_tokens=7000, temperature=0.85
        )

    def generate_article(self, keyword: str) -> Dict:
        import time

        start_time = time.time()

        raw = self._chat(self._build_prompt(keyword))
        parsed = self._parse(raw, keyword)
        images = self._unsplash_images(keyword, 9)  # Tăng từ 4 lên 9 ảnh
        thumb = images[0] if images else {"url": "", "alt": keyword}
        content_with_imgs = self._insert_images(
            parsed["content"], images[1:]
        )  # 8 ảnh cho content

        # Đếm số từ trong nội dung
        word_count = len(content_with_imgs.split())

        # Tính thời gian tạo bài
        generation_time = round(time.time() - start_time, 2)

        return {
            "title": parsed["title"],
            "slug": parsed["slug"],
            "excerpt": parsed["excerpt"],
            "content": content_with_imgs,
            "category": parsed["category"],
            "tags": parsed.get("tags", []),
            "word_count": word_count,
            "generation_time": generation_time,
            "thumbnail": thumb["url"],
            "thumbnail_alt": thumb["alt"],
            "angles": parsed.get("angles", []),
        }

    def _parse(self, raw_text: str, keyword: str) -> Dict:
        def find(pattern, default=""):
            m = re.search(pattern, raw_text, re.IGNORECASE | re.DOTALL)
            return m.group(1).strip() if m else default

        title = find(r"TITLE:\s*(.+?)(?:\n|$)", f"Bài viết về {keyword}")
        # Chuẩn hóa tiêu đề: bỏ ngoặc kép nếu có
        title = title.strip('"').strip("'")
        slug = find(r"SLUG:\s*(.+?)(?:\n|$)", keyword.lower().replace(" ", "-"))
        category_raw = find(r"CATEGORY:\s*(.+?)(?:\n|$)", keyword)
        tags_raw = find(r"TAGS:\s*(.+?)(?:\n|$)", "")
        excerpt = find(r"EXCERPT:\s*(.+?)(?=\nCONTENT:|\n\n)", raw_text[:500])
        content = find(r"CONTENT:\s*(.+)", raw_text)

        # Phân loại category thông minh dựa trên keyword
        keyword_category_map = {
            "Trí tuệ nhân tạo": "AI",
            "Blockchain": "Technology",
            "Năng lượng tái tạo": "Environment",
            "Y tế thông minh": "Health",
            "Giáo dục số": "Education",
            "An ninh mạng": "Security",
            "Ô tô điện": "Automotive",
            "Metaverse": "Technology",
            "Công nghệ 5G": "Technology",
            "Thương mại điện tử": "Business",
            "Robot và Tự động hóa": "Technology",
            "Big Data": "Data Science",
            "Cloud Computing": "Technology",
            "Fintech": "Finance",
            "Smart City": "Urban",
            "Biotechnology": "Science",
            "Space Technology": "Space",
            "Quantum Computing": "Science",
            "Nông nghiệp công nghệ cao": "Agriculture",
            "Gaming và Esports": "Entertainment",
        }

        if category_raw in category_map:
            category = category_map[category_raw]
        elif keyword in keyword_category_map:
            category = keyword_category_map[keyword]
        else:
            lower = category_raw.lower()
            category = next(
                (c.value for c in ArticleCategory if c.value.lower() == lower),
                keyword_category_map.get(keyword, "Technology"),
            )
        angles_block = find(r"ALT_ANGLES:\s*(.+)$", "")
        angles = []
        for line in angles_block.splitlines():
            line = line.strip("- *\t ")
            if line:
                angles.append(line)

        # Parse tags
        tags = []
        if tags_raw:
            tags = [t.strip() for t in re.split(r"[,;]", tags_raw) if t.strip()]
        if not tags:
            tags = [keyword, category, "AI", "Technology", "Innovation"]

        return {
            "title": title,
            "slug": slug,
            "excerpt": excerpt,
            "content": content,
            "category": category,
            "tags": tags,
            "angles": angles,
        }

    def _unsplash_images(self, keyword: str, count: int) -> List[Dict]:
        if not self.unsplash_key:
            print("⚠️ Không có Unsplash API key, dùng ảnh placeholder")
            return [
                {
                    "url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
                    "alt": f"{keyword} {i + 1}",
                }
                for i in range(count)
            ]
        try:
            # Chuyển keyword tiếng Việt sang tiếng Anh để tìm ảnh tốt hơn
            keyword_map = {
                "Trí tuệ nhân tạo": "artificial intelligence technology",
                "Blockchain": "blockchain cryptocurrency digital",
                "Năng lượng tái tạo": "renewable energy solar wind",
                "Y tế thông minh": "smart healthcare medical technology",
                "Giáo dục số": "digital education online learning",
                "An ninh mạng": "cybersecurity network security",
                "Ô tô điện": "electric vehicle car automotive",
                "Metaverse": "metaverse virtual reality digital",
                "Công nghệ 5G": "5G technology wireless network",
                "Thương mại điện tử": "ecommerce online shopping",
                "Robot và Tự động hóa": "robotics automation manufacturing",
                "Big Data": "big data analytics visualization",
                "Cloud Computing": "cloud computing servers technology",
                "Fintech": "financial technology banking digital",
                "Smart City": "smart city urban technology",
                "Biotechnology": "biotechnology science research",
                "Space Technology": "space technology satellite rocket",
                "Quantum Computing": "quantum computing technology",
                "Nông nghiệp công nghệ cao": "agriculture technology farming",
                "Gaming và Esports": "gaming esports technology",
            }
            search_keyword = keyword_map.get(keyword, keyword)

            headers = {"Authorization": f"Client-ID {self.unsplash_key}"}
            params = {
                "query": search_keyword,
                "per_page": count,
                "orientation": "landscape",
            }
            r = requests.get(
                "https://api.unsplash.com/search/photos",
                headers=headers,
                params=params,
                timeout=12,
            )
            if r.status_code != 200:
                print(f"⚠️ Unsplash API lỗi {r.status_code}, dùng ảnh mặc định")
                # Dùng ảnh mẫu đẹp từ Unsplash thay vì placeholder
                default_images = [
                    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200",
                    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200",
                    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200",
                    "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200",
                    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
                    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200",
                    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200",
                    "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=1200",
                    "https://images.unsplash.com/photo-1620825937374-87fc7d6bddc2?w=1200",
                ]
                return [
                    {
                        "url": default_images[i % len(default_images)],
                        "alt": f"{keyword} {i + 1}",
                    }
                    for i in range(count)
                ]
            data = r.json()
            out = []
            results = data.get("results", [])
            if not results:
                print(f"⚠️ Không tìm thấy ảnh cho '{search_keyword}', dùng ảnh mặc định")
                default_images = [
                    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200",
                    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200",
                    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200",
                    "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200",
                    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
                    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200",
                    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200",
                    "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=1200",
                    "https://images.unsplash.com/photo-1620825937374-87fc7d6bddc2?w=1200",
                ]
                return [
                    {
                        "url": default_images[i % len(default_images)],
                        "alt": f"{keyword} {i + 1}",
                    }
                    for i in range(count)
                ]
            for p in results[:count]:
                out.append(
                    {
                        "url": p["urls"]["regular"],
                        "alt": p.get("alt_description") or keyword,
                    }
                )
            print(f"✅ Lấy được {len(out)} ảnh từ Unsplash cho '{search_keyword}'")
            return out
        except Exception as e:
            print(f"❌ Lỗi Unsplash: {e}, dùng ảnh mặc định")
            default_images = [
                "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200",
                "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200",
                "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200",
                "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200",
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
                "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200",
                "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200",
                "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=1200",
                "https://images.unsplash.com/photo-1620825937374-87fc7d6bddc2?w=1200",
            ]
            return [
                {
                    "url": default_images[i % len(default_images)],
                    "alt": f"{keyword} {i + 1}",
                }
                for i in range(count)
            ]

    def _insert_images(self, content: str, images: List[Dict]) -> str:
        if not images:
            return content
        parts = content.split("\n\n")
        if len(parts) < 3:
            return content
        positions = list(range(1, len(parts) - 1))
        # Tăng số ảnh chèn từ 3 lên 6-8 ảnh
        num_images = min(len(images), len(positions), 8)
        chosen = random.sample(positions, num_images)
        chosen.sort(reverse=True)
        for idx, pos in enumerate(chosen):
            if idx < len(images):
                img = images[idx]
                html = f'\n\n<img src="{img["url"]}" alt="{img["alt"]}" style="width:100%;max-width:800px;margin:20px 0;">\n\n'
                parts.insert(pos + 1, html)
        return "\n\n".join(parts)


mistral_official_article_generator = MistralOfficialArticleGenerator()
