"""
unsplash_service.py - Service lấy ảnh từ Unsplash API và tự động gán cho bài viết
"""

import os
import requests
from typing import List, Dict, Optional
from datetime import datetime
from bson import ObjectId


class UnsplashService:
    """Service để tìm, tải ảnh từ Unsplash và tự động gán cho bài viết"""
    
    def __init__(self, access_key: str = None):
        """
        Khởi tạo Unsplash service
        
        Args:
            access_key: Unsplash Access Key (nếu không truyền sẽ lấy từ env)
        """
        self.access_key = access_key or os.getenv("UNSPLASH_ACCESS_KEY")
        
        if not self.access_key:
            print("⚠️ UNSPLASH_ACCESS_KEY chưa được cấu hình")
        else:
            print("🖼️ Unsplash Service đã được khởi tạo")
    
    def search_images(self, query: str, count: int = 3, orientation: str = "landscape") -> List[Dict]:
        """
        Tìm ảnh trên Unsplash theo query
        
        Args:
            query: Từ khóa tìm kiếm (tiêu đề bài viết, chủ đề, keywords)
            count: Số lượng ảnh muốn lấy (mặc định 3)
            orientation: landscape, portrait, squarish
            
        Returns:
            List các dict chứa thông tin ảnh:
            {
                "id": "abc123",
                "description": "A beautiful sunset",
                "urls": {
                    "raw": "https://...",
                    "full": "https://...",
                    "regular": "https://...",
                    "small": "https://...",
                    "thumb": "https://..."
                },
                "width": 4000,
                "height": 3000,
                "user": {
                    "name": "John Doe",
                    "username": "johndoe",
                    "link": "https://unsplash.com/@johndoe"
                },
                "download_link": "https://...",
                "source": "unsplash"
            }
        """
        if not self.access_key:
            print("⚠️ Không thể tìm ảnh: thiếu UNSPLASH_ACCESS_KEY")
            return []
        
        url = "https://api.unsplash.com/photos/random"
        params = {
            "query": query,
            "count": min(count, 30),  # Unsplash API giới hạn max 30
            "orientation": orientation
        }
        headers = {
            "Authorization": f"Client-ID {self.access_key}"
        }
        
        try:
            print(f"🔍 Đang tìm ảnh trên Unsplash với query: '{query}'")
            resp = requests.get(url, headers=headers, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            
            # Nếu count=1, API trả về dict thay vì list
            if isinstance(data, dict):
                data = [data]
            
            results = []
            for item in data:
                results.append({
                    "id": item.get("id"),
                    "description": item.get("alt_description") or item.get("description") or "No description",
                    "urls": item.get("urls", {}),
                    "width": item.get("width"),
                    "height": item.get("height"),
                    "user": {
                        "name": item.get("user", {}).get("name"),
                        "username": item.get("user", {}).get("username"),
                        "link": item.get("user", {}).get("links", {}).get("html")
                    },
                    "download_link": item.get("links", {}).get("download_location"),
                    "source": "unsplash"
                })
            
            print(f"✅ Tìm thấy {len(results)} ảnh từ Unsplash")
            return results
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Lỗi khi tìm ảnh từ Unsplash: {e}")
            return []
        except Exception as e:
            print(f"❌ Lỗi không xác định: {e}")
            return []
    
    def download_image(self, url: str, dest_path: str) -> bool:
        """
        Tải ảnh từ URL về máy
        
        Args:
            url: URL của ảnh (thường dùng urls.regular hoặc urls.full)
            dest_path: Đường dẫn lưu file ảnh
            
        Returns:
            True nếu tải thành công, False nếu thất bại
        """
        try:
            print(f"📥 Đang tải ảnh về: {dest_path}")
            resp = requests.get(url, stream=True, timeout=15)
            resp.raise_for_status()
            
            with open(dest_path, "wb") as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            
            print(f"✅ Tải ảnh thành công: {dest_path}")
            return True
            
        except Exception as e:
            print(f"❌ Lỗi khi tải ảnh: {e}")
            return False
    
    def trigger_download(self, download_link: str) -> bool:
        """
        Gọi endpoint download của Unsplash để trigger download tracking
        (Bắt buộc theo Unsplash API guidelines khi dùng ảnh)
        
        Args:
            download_link: Link download từ image["download_link"]
            
        Returns:
            True nếu trigger thành công
        """
        if not self.access_key or not download_link:
            return False
        
        headers = {
            "Authorization": f"Client-ID {self.access_key}"
        }
        
        try:
            requests.get(download_link, headers=headers, timeout=5)
            return True
        except:
            return False
    
    def extract_keywords(self, article: Dict) -> str:
        """
        Trích xuất keywords từ bài viết để tìm ảnh
        
        Args:
            article: Dict chứa thông tin bài viết (title, content, category, etc.)
            
        Returns:
            Query string để tìm ảnh trên Unsplash
        """
        # Ưu tiên theo thứ tự: title > category > content snippet
        if article.get("title"):
            return article["title"]
        
        if article.get("category"):
            return article["category"]
        
        if article.get("content"):
            # Lấy 50 ký tự đầu của content làm query
            content_snippet = article["content"][:50].strip()
            return content_snippet
        
        return "news article"
    
    def find_thumbnail(self, article: Dict, count: int = 3) -> Optional[str]:
        """
        Tìm ảnh thumbnail phù hợp cho bài viết
        
        Args:
            article: Dict chứa thông tin bài viết
            count: Số lượng ảnh tìm kiếm (sẽ chọn ảnh đầu tiên)
            
        Returns:
            URL của ảnh thumbnail (regular size), hoặc None nếu không tìm thấy
        """
        query = self.extract_keywords(article)
        print(f"🔍 Tìm ảnh cho bài viết với query: '{query}'")
        
        images = self.search_images(query=query, count=count, orientation="landscape")
        
        if not images:
            print("⚠️ Không tìm thấy ảnh phù hợp")
            return None
        
        # Chọn ảnh đầu tiên
        selected_image = images[0]
        thumbnail_url = selected_image["urls"].get("regular")
        
        # Trigger download tracking (bắt buộc theo Unsplash guidelines)
        if selected_image.get("download_link"):
            self.trigger_download(selected_image["download_link"])
        
        print(f"✅ Đã chọn ảnh thumbnail: {thumbnail_url}")
        print(f"   📸 Photographer: {selected_image['user']['name']}")
        
        return thumbnail_url
    
    def find_multiple_images(self, article: Dict, count: int = 5) -> List[str]:
        """
        Tìm nhiều ảnh cho bài viết (dùng cho gallery hoặc content images)
        
        Args:
            article: Dict chứa thông tin bài viết
            count: Số lượng ảnh muốn lấy
            
        Returns:
            List các URL ảnh (regular size)
        """
        query = self.extract_keywords(article)
        print(f"🔍 Tìm {count} ảnh cho bài viết với query: '{query}'")
        
        images = self.search_images(query=query, count=count, orientation="landscape")
        
        if not images:
            print("⚠️ Không tìm thấy ảnh phù hợp")
            return []
        
        image_urls = []
        for img in images:
            url = img["urls"].get("regular")
            if url:
                image_urls.append(url)
                # Trigger download tracking
                if img.get("download_link"):
                    self.trigger_download(img["download_link"])
        
        print(f"✅ Tìm thấy {len(image_urls)} ảnh")
        return image_urls
    
    def assign_thumbnail_to_article(self, article: Dict) -> Dict:
        """
        Tự động tìm và gán thumbnail vào bài viết
        
        Args:
            article: Dict chứa thông tin bài viết
            
        Returns:
            Article đã được gán thumbnail_url (hoặc giữ nguyên nếu không tìm thấy)
        """
        if article.get("thumbnail_url"):
            print("ℹ️ Bài viết đã có thumbnail, bỏ qua")
            return article
        
        thumbnail_url = self.find_thumbnail(article)
        
        if thumbnail_url:
            article["thumbnail_url"] = thumbnail_url
            print(f"✅ Đã gán thumbnail cho bài viết: {article.get('title', 'Untitled')}")
        else:
            print(f"⚠️ Không thể gán thumbnail cho bài viết: {article.get('title', 'Untitled')}")
        
        return article
    
    async def save_images_to_db(self, article_id: str, images: List[Dict], db, mark_first_as_primary: bool = True) -> List[str]:
        """
        Lưu danh sách ảnh vào collection images
        
        Args:
            article_id: ID của bài viết
            images: List các dict ảnh từ search_images()
            db: Database instance
            mark_first_as_primary: Đánh dấu ảnh đầu tiên là ảnh chính
            
        Returns:
            List các image_id đã được tạo
        """
        image_ids = []
        
        for idx, img in enumerate(images):
            image_doc = {
                "article_id": article_id,
                "url": img["urls"].get("regular"),
                "thumbnail_url": img["urls"].get("thumb"),
                "full_url": img["urls"].get("full"),
                "source": "unsplash",
                "description": img.get("description", ""),
                "photographer_name": img["user"].get("name"),
                "photographer_link": img["user"].get("link"),
                "width": img.get("width"),
                "height": img.get("height"),
                "is_primary": (idx == 0 and mark_first_as_primary),
                "created_at": datetime.utcnow()
            }
            
            result = await db.images.insert_one(image_doc)
            image_ids.append(str(result.inserted_id))
            
            # Trigger download tracking
            if img.get("download_link"):
                self.trigger_download(img["download_link"])
        
        print(f"✅ Đã lưu {len(image_ids)} ảnh vào collection images")
        return image_ids
    
    async def create_and_save_images_for_article(self, article: Dict, db, count: int = 3) -> List[str]:
        """
        Tìm ảnh từ Unsplash và lưu vào collection images
        
        Args:
            article: Dict chứa thông tin bài viết (phải có _id hoặc id)
            db: Database instance
            count: Số lượng ảnh muốn lấy
            
        Returns:
            List các image_id đã được tạo
        """
        article_id = str(article.get("_id") or article.get("id"))
        query = self.extract_keywords(article)
        
        print(f"🔍 Tìm {count} ảnh cho article_id: {article_id}")
        images = self.search_images(query=query, count=count, orientation="landscape")
        
        if not images:
            print("⚠️ Không tìm thấy ảnh")
            return []
        
        return await self.save_images_to_db(article_id, images, db, mark_first_as_primary=True)


# Hàm tiện ích để sử dụng nhanh
def add_thumbnail_to_article(article: Dict, unsplash_api_key: str = None) -> Dict:
    """
    Hàm helper để nhanh chóng thêm thumbnail vào bài viết
    
    Args:
        article: Dict chứa thông tin bài viết
        unsplash_api_key: Unsplash Access Key (optional)
        
    Returns:
        Article đã được gán thumbnail
        
    Example:
        >>> article = {"title": "AI Technology News", "content": "..."}
        >>> article_with_image = add_thumbnail_to_article(article)
    """
    service = UnsplashService(access_key=unsplash_api_key)
    return service.assign_thumbnail_to_article(article)
