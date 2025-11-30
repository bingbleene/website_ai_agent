"""Article generator using Mistral + Unsplash (isolated).

Does not modify or depend on existing Gemini implementation.
"""

import re
import random
import requests
from typing import List, Dict, Optional
from app.models.schemas import category_map, ArticleCategory
from app.llm_mistral.config_mistral import mistral_config
from app.llm_mistral.services.mistral_service import mistral_service


class MistralArticleGenerator:
    def __init__(self, unsplash_api_key: Optional[str] = None):
        self.unsplash_api_key = unsplash_api_key or mistral_config.unsplash_access_key

    def search_images_unsplash(self, keyword: str, count: int = 4) -> List[Dict]:
        if not self.unsplash_api_key:
            return [
                {
                    "url": f"https://via.placeholder.com/1200x800?text={keyword.replace(' ', '+')}+{i + 1}",
                    "alt": f"{keyword} {i + 1}",
                }
                for i in range(count)
            ]
        try:
            headers = {"Authorization": f"Client-ID {self.unsplash_api_key}"}
            params = {"query": keyword, "per_page": count, "orientation": "landscape"}
            resp = requests.get(
                "https://api.unsplash.com/search/photos",
                headers=headers,
                params=params,
                timeout=12,
            )
            if resp.status_code != 200:
                return [
                    {
                        "url": f"https://via.placeholder.com/1200x800?text={keyword.replace(' ', '+')}+{i + 1}",
                        "alt": f"{keyword} {i + 1}",
                    }
                    for i in range(count)
                ]
            data = resp.json()
            out = []
            for photo in data.get("results", [])[:count]:
                out.append(
                    {
                        "url": photo["urls"]["regular"],
                        "alt": photo.get("alt_description") or keyword,
                    }
                )
            return out
        except Exception:
            return [
                {
                    "url": f"https://via.placeholder.com/1200x800?text={keyword.replace(' ', '+')}+{i + 1}",
                    "alt": f"{keyword} {i + 1}",
                }
                for i in range(count)
            ]

    def generate_article(self, keyword: str) -> Dict:
        valid_categories = [c.value for c in ArticleCategory]
        prompt = f"""Viết một bài viết chi tiết về chủ đề: '{keyword}'\n\nYêu cầu format đúng mẫu sau:\n\nTITLE: [Tiêu đề hấp dẫn 80-100 ký tự]\nSLUG: [url-slug-khong-dau]\nCATEGORY: [{", ".join(valid_categories)}]\nEXCERPT: [Tóm tắt 150-200 từ]\nCONTENT:\n[Nội dung 800-1400 từ, chia 3-4 phần, mỗi phần cách 2 dòng trống]\n\nALT_ANGLES:\n- 1 góc nhìn mới\n- 2 góc nhìn mới\n- 3 góc nhìn mới\n\nLưu ý: Không lặp lại nội dung phổ biến; ngôn ngữ tiếng Việt; phong cách chuyên nghiệp. Bắt đầu."""
        raw = mistral_service.generate_text(prompt, max_tokens=1200, temperature=0.7)
        parsed = self._parse(raw, keyword)
        images = self.search_images_unsplash(keyword, count=4)
        thumbnail = images[0] if images else {"url": "", "alt": keyword}
        content_with_images = self._insert_images(parsed["content"], images[1:])
        return {
            "title": parsed["title"],
            "slug": parsed["slug"],
            "excerpt": parsed["excerpt"],
            "content": content_with_images,
            "category": parsed["category"],
            "thumbnail": thumbnail["url"],
            "thumbnail_alt": thumbnail["alt"],
            "angles": parsed.get("angles", []),
        }

    def _parse(self, raw_text: str, keyword: str) -> Dict:
        def find(pattern, default=""):
            m = re.search(pattern, raw_text, re.IGNORECASE | re.DOTALL)
            return m.group(1).strip() if m else default

        title = find(r"TITLE:\s*(.+?)(?:\n|$)", f"Bài viết về {keyword}")
        slug = find(r"SLUG:\s*(.+?)(?:\n|$)", keyword.lower().replace(" ", "-"))
        category_raw = find(r"CATEGORY:\s*(.+?)(?:\n|$)", keyword)
        excerpt = find(r"EXCERPT:\s*(.+?)(?=\nCONTENT:|\n\n)", raw_text[:200])
        content = find(r"CONTENT:\s*(.+)", raw_text)
        # Category normalization
        if category_raw in category_map:
            category = category_map[category_raw]
        else:
            lower = category_raw.lower()
            cat_match = next(
                (c.value for c in ArticleCategory if c.value.lower() == lower),
                ArticleCategory.TECHNOLOGY.value,
            )
            category = cat_match
        angles_block = find(r"ALT_ANGLES:\s*(.+)$", "")
        angles = []
        for line in angles_block.splitlines():
            line = line.strip("- *\t ")
            if line:
                angles.append(line)
        return {
            "title": title,
            "slug": slug,
            "category": category,
            "excerpt": excerpt,
            "content": content,
            "angles": angles,
        }

    def _insert_images(self, content: str, images: List[Dict]) -> str:
        if not images:
            return content
        parts = content.split("\n\n")
        if len(parts) < 3:
            return content
        positions = list(range(1, len(parts) - 1))
        chosen = random.sample(positions, min(3, len(images)))
        chosen.sort(reverse=True)
        for idx, pos in enumerate(chosen):
            img = images[idx]
            html = f'\n\n<img src="{img["url"]}" alt="{img["alt"]}" style="width:100%;max-width:800px;margin:20px 0;">\n\n'
            parts.insert(pos + 1, html)
        return "\n\n".join(parts)


mistral_article_generator = MistralArticleGenerator()
