"""
Mistral AI Service - Alternative to Gemini
"""
import requests
from typing import List, Dict, Optional
from loguru import logger


class MistralService:
    """Service để tương tác với Mistral AI API"""
    
    def __init__(self, api_key: str):
        """
        Khởi tạo Mistral service
        
        Args:
            api_key: Mistral API key
        """
        self.api_key = api_key
        self.base_url = "https://api.mistral.ai/v1"
        self.model = "mistral-large-latest"  # Sử dụng model tốt nhất
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        logger.info(f"✅ Initialized Mistral AI service with model: {self.model}")
    
    def generate_content(self, prompt: str, max_tokens: int = 8000, temperature: float = 0.7) -> str:
        """
        Tạo nội dung từ prompt
        
        Args:
            prompt: Prompt để generate
            max_tokens: Số token tối đa
            temperature: Độ sáng tạo (0-1)
        
        Returns:
            Generated text
        """
        try:
            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=120
            )
            
            if response.status_code != 200:
                logger.error(f"❌ Mistral API error: {response.status_code} - {response.text}")
                raise Exception(f"Mistral API error: {response.status_code}")
            
            data = response.json()
            content = data['choices'][0]['message']['content']
            
            logger.info(f"✅ Mistral generated {len(content)} characters")
            return content
            
        except Exception as e:
            logger.error(f"❌ Mistral generation error: {e}")
            raise
    
    def chat_completion(self, messages: List[Dict], max_tokens: int = 500, temperature: float = 0.7) -> str:
        """
        Chat completion với lịch sử hội thoại
        
        Args:
            messages: List các message [{"role": "user/assistant", "content": "..."}]
            max_tokens: Số token tối đa
            temperature: Độ sáng tạo
        
        Returns:
            Response text
        """
        try:
            payload = {
                "model": self.model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code != 200:
                logger.error(f"❌ Mistral chat error: {response.status_code} - {response.text}")
                return "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau."
            
            data = response.json()
            return data['choices'][0]['message']['content']
            
        except Exception as e:
            logger.error(f"❌ Mistral chat error: {e}")
            return "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau."


# Singleton instance (will be initialized with API key from settings)
mistral_service = None

def initialize_mistral_service(api_key: str):
    """Initialize global mistral service instance"""
    global mistral_service
    mistral_service = MistralService(api_key=api_key)
    return mistral_service
