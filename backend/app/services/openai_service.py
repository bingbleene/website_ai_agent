"""
OpenAI Service - GPT-4o and Embeddings
"""
from openai import AsyncOpenAI
from typing import List, Dict, Optional
from loguru import logger

from app.core.config import settings


class OpenAIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.embedding_model = settings.OPENAI_EMBEDDING_MODEL
    
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7
    ) -> str:
        """Generate text using GPT-4o"""
        try:
            messages = []
            
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            messages.append({"role": "user", "content": prompt})
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            result = response.choices[0].message.content
            logger.info(f"✅ OpenAI generated {len(result)} characters")
            return result
            
        except Exception as e:
            logger.error(f"❌ OpenAI generation error: {e}")
            raise
    
    async def generate_summary(self, content: str, max_length: int = 200) -> str:
        """Generate article summary"""
        prompt = f"""Tóm tắt nội dung sau trong khoảng {max_length} từ, bằng tiếng Việt:

{content[:3000]}

Tóm tắt:"""
        
        return await self.generate_text(
            prompt=prompt,
            max_tokens=int(max_length * 1.5),
            temperature=0.5
        )
    
    async def generate_hashtags(self, title: str, content: str, limit: int = 10) -> List[str]:
        """Generate hashtags for article"""
        prompt = f"""Tạo {limit} hashtag phù hợp cho bài viết sau:

Tiêu đề: {title}
Nội dung: {content[:500]}

Trả về danh sách hashtag, mỗi hashtag trên một dòng, không có ký tự #:"""
        
        result = await self.generate_text(
            prompt=prompt,
            max_tokens=200,
            temperature=0.7
        )
        
        # Parse hashtags
        hashtags = [line.strip().strip('#').strip() for line in result.split('\n') if line.strip()]
        return hashtags[:limit]
    
    async def classify_category(self, title: str, content: str) -> str:
        """Classify article category"""
        categories = ["politics", "technology", "business", "sports", "entertainment", 
                     "health", "science", "world", "local"]
        
        prompt = f"""Phân loại bài viết sau vào một trong các danh mục: {', '.join(categories)}

Tiêu đề: {title}
Nội dung: {content[:500]}

Chỉ trả về tên danh mục (không giải thích):"""
        
        result = await self.generate_text(
            prompt=prompt,
            max_tokens=10,
            temperature=0.3
        )
        
        # Extract category
        category = result.strip().lower()
        if category in categories:
            return category
        return "local"
    
    async def extract_key_points(self, content: str, limit: int = 5) -> List[str]:
        """Extract key points from article"""
        prompt = f"""Liệt kê {limit} điểm chính của bài viết sau:

{content[:2000]}

Trả về danh sách, mỗi điểm trên một dòng:"""
        
        result = await self.generate_text(
            prompt=prompt,
            max_tokens=300,
            temperature=0.5
        )
        
        # Parse key points
        points = [line.strip().lstrip('- ').lstrip('* ').lstrip('• ') 
                 for line in result.split('\n') if line.strip()]
        return points[:limit]
    
    async def create_embedding(self, text: str) -> List[float]:
        """Create text embedding for vector search"""
        try:
            response = await self.client.embeddings.create(
                model=self.embedding_model,
                input=text[:8000]  # Limit input size
            )
            
            embedding = response.data[0].embedding
            logger.info(f"✅ Created embedding: {len(embedding)} dimensions")
            return embedding
            
        except Exception as e:
            logger.error(f"❌ OpenAI embedding error: {e}")
            raise
    
    async def moderate_content(self, text: str) -> Dict[str, any]:
        """Check content for policy violations"""
        try:
            response = await self.client.moderations.create(input=text)
            
            result = response.results[0]
            
            return {
                "flagged": result.flagged,
                "categories": {k: v for k, v in result.categories.model_dump().items() if v},
                "scores": result.category_scores.model_dump()
            }
            
        except Exception as e:
            logger.error(f"❌ OpenAI moderation error: {e}")
            return {"flagged": False, "categories": {}, "scores": {}}
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        context: Optional[str] = None
    ) -> str:
        """RAG-based chat completion"""
        # Add context if provided
        if context:
            system_message = {
                "role": "system",
                "content": f"Bạn là trợ lý AI của trang tin tức. Sử dụng thông tin sau để trả lời:\n\n{context}"
            }
            messages = [system_message] + messages
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"❌ OpenAI chat error: {e}")
            raise


# Singleton instance
openai_service = OpenAIService()
