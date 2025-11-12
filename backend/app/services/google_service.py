"""
Google Cloud Services & Google AI (Gemini) Service
"""
from google.cloud import translate_v2 as translate
from google.cloud import language_v1
import google.generativeai as genai
from typing import Dict, List
from loguru import logger
import os
import asyncio
from datetime import datetime

from app.core.config import settings

# ==========================================================
# DỊCH VỤ GOOGLE CLOUD (Dịch thuật, Cảm xúc)
# ==========================================================
class GoogleCloudService:
    # ... (Giữ nguyên toàn bộ class GoogleCloudService của bạn) ...
    def __init__(self):
        self.enabled = bool(settings.GOOGLE_APPLICATION_CREDENTIALS or settings.GOOGLE_TRANSLATE_API_KEY)
        
        if not self.enabled:
            logger.warning("⚠️ Google Cloud disabled - will use fallback translation")
            self.translate_client = None
            self.language_client = None
            return
            
        if settings.GOOGLE_APPLICATION_CREDENTIALS:
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = settings.GOOGLE_APPLICATION_CREDENTIALS
        
        try:
            self.translate_client = translate.Client()
            self.language_client = language_v1.LanguageServiceClient()
            logger.info("✅ Initialized Google Cloud services")
        except Exception as e:
            logger.warning(f"⚠️ Google Cloud initialization failed: {e}")
            self.translate_client = None
            self.language_client = None
            self.enabled = False
    
    async def translate_text(self, text: str, target_language: str, source_language: str = "auto") -> Dict[str, str]:
        if not self.translate_client: raise Exception("Google Cloud Translation not configured")
        try:
            def _translate_sync():
                detected_lang = source_language
                if source_language == "auto":
                    detection = self.translate_client.detect_language(text)
                    detected_lang = detection['language']
                result = self.translate_client.translate(text, target_language=target_language, source_language=detected_lang)
                return {"translated_text": result['translatedText'], "source_language": detected_lang, "target_language": target_language}
            result_dict = await asyncio.to_thread(_translate_sync)
            logger.info(f"✅ Translated {result_dict['source_language']} → {target_language}")
            return result_dict
        except Exception as e:
            logger.error(f"❌ Google Translation error: {e}")
            raise

    async def analyze_sentiment(self, text: str) -> Dict[str, any]:
        if not self.enabled or not self.language_client:
            logger.info("⚠️ Using fallback sentiment analysis (Google Cloud disabled)")
            negative_words = ['tệ', 'dở', 'kém', 'xấu', 'ghét', 'tồi', 'bad', 'terrible', 'hate']
            positive_words = ['tốt', 'hay', 'đẹp', 'tuyệt', 'xuất sắc', 'good', 'great', 'excellent', 'love']
            text_lower = text.lower()
            neg_count = sum(1 for word in negative_words if word in text_lower)
            pos_count = sum(1 for word in positive_words if word in text_lower)
            if pos_count > neg_count: return {"sentiment": "positive", "score": 0.5, "magnitude": 1.0}
            elif neg_count > pos_count: return {"sentiment": "negative", "score": -0.5, "magnitude": 1.0}
            else: return {"sentiment": "neutral", "score": 0.0, "magnitude": 0.5}
        try:
            def _analyze_sync():
                document = language_v1.Document(content=text, type_=language_v1.Document.Type.PLAIN_TEXT, language="vi")
                sentiment_response = self.language_client.analyze_sentiment(request={'document': document})
                sentiment = sentiment_response.document_sentiment
                score = sentiment.score
                magnitude = sentiment.magnitude
                if score >= 0.25: sentiment_type = "positive"
                elif score <= -0.25: sentiment_type = "negative"
                else: sentiment_type = "neutral"
                return {"sentiment": sentiment_type, "score": score, "magnitude": magnitude}
            result_dict = await asyncio.to_thread(_analyze_sync)
            logger.info(f"✅ Sentiment analyzed: {result_dict['sentiment']} (score: {result_dict['score']:.2f})")
            return result_dict
        except Exception as e:
            logger.error(f"❌ Google Sentiment analysis error: {e}")
            return {"sentiment": "neutral", "score": 0.0, "magnitude": 0.0}

    async def detect_language(self, text: str) -> str:
        if not self.translate_client: return "vi"
        try:
            def _detect_sync():
                result = self.translate_client.detect_language(text)
                return result['language']
            language = await asyncio.to_thread(_detect_sync)
            logger.info(f"✅ Detected language: {language}")
            return language
        except Exception as e:
            logger.error(f"❌ Language detection error: {e}")
            return "vi"

google_service = GoogleCloudService()


# ==========================================================
# DỊCH VỤ GOOGLE GEMINI (AI CHÍNH)
# ==========================================================

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = None
        self.model_name = None
        self.chat_model = None
        self.quota_exceeded = False
        self.last_error_time = None
        self.last_error = None
        self.request_count = 0
        self.last_reset = datetime.now()
        self.max_requests_per_minute = 30
        self.using_fallback = False
        self.last_restart = None
        
        if not self.api_key:
            logger.warning("⚠️ GEMINI_API_KEY is not set")
            return
            
        try:
            genai.configure(api_key=self.api_key)
            # Chọn model nhẹ nhất có sẵn để tránh hit quota
            model_preferences = [
                "gemini-pro",  # Model cơ bản
                "models/gemini-pro",  # Thử tên đầy đủ
                "gemini-pro-vision"  # Model dự phòng
            ]
            
            available_models = genai.list_models()
            models = [m.name for m in available_models]
            logger.info(f"Available models: {models}")
            
            # Chọn model đầu tiên có trong danh sách ưu tiên
            for preferred_model in model_preferences:
                if preferred_model in models:
                    self.model = genai.GenerativeModel(model_name=preferred_model)
                    self.model_name = preferred_model
                    logger.info(f"✅ Using model: {preferred_model}")
                    break
            else:
                # Nếu không tìm thấy model nào, dùng model mặc định
                self.model = genai.GenerativeModel("gemini-pro")
                self.model_name = "gemini-pro"
                logger.info("✅ Using default model: gemini-pro")
                
        except Exception as e:
            logger.error(f"❌ Failed to initialize Gemini: {e}")
            self.model = None
        
        if not self.api_key:
            logger.warning("⚠️ Chưa có GEMINI_API_KEY")
            return
            
        try:
            genai.configure(api_key=self.api_key)
            
            # Chọn model nhẹ để tránh hit quota
            model_preferences = [
                "gemini-flash-lite-latest",  # Nhẹ nhất
                "gemini-2.5-flash-lite",
                "gemini-2.0-flash-lite",
                "gemini-pro"  # Fallback cuối
            ]
            
            # List models có sẵn
            try:
                available_models = genai.list_models()
                models = [m.name.lower() for m in available_models]
                logger.info(f"✅ Models có sẵn: {models}")
                
                # Chọn model đầu tiên trong danh sách ưu tiên
                for model_name in model_preferences:
                    model_name_lower = model_name.lower()
                    if any(m for m in models if model_name_lower in m):
                        # Tìm tên model chính xác từ danh sách có sẵn
                        exact_name = next(m for m in models if model_name_lower in m)
                        self.model = genai.GenerativeModel(model_name=exact_name)
                        self.model_name = exact_name
                        logger.info(f"✅ Dùng model: {exact_name}")
                        break
                else:
                    # Nếu không tìm được model nào, thử dùng API trực tiếp
                    self.model = genai.GenerativeModel("gemini-pro")
                    self.model_name = "gemini-pro"
                    logger.info("✅ Thử dùng model mặc định: gemini-pro")
            except Exception as e:
                logger.error(f"❌ Lỗi list models: {e}")
                # Thử dùng model mặc định
                try:
                    self.model = genai.GenerativeModel("gemini-pro")
                    self.model_name = "gemini-pro"
                    logger.info("✅ Dùng model mặc định do lỗi list")
                except Exception as e2:
                    logger.error(f"❌ Lỗi khởi tạo model mặc định: {e2}")
                    self.model = None
                    self.model_name = None
            
        except Exception as e:
            logger.error(f"❌ Lỗi khởi tạo Gemini: {e}")
            self.model = None

    async def _run_in_thread(self, sync_func, *args, **kwargs):
        """Hàm helper để chạy code đồng bộ (sync) trong thread."""
        if not self.model:
            raise Exception("Chưa cấu hình API key.")
        try:
            return await asyncio.to_thread(sync_func, *args, **kwargs)
        except Exception as e:
            error_str = str(e).lower()
            logger.error(f"❌ Lỗi Gemini: {error_str}")
            if "quota" in error_str or "rate" in error_str:
                self.quota_exceeded = True
                self.last_error_time = datetime.now()
            raise e

    async def generate_text(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        """Tạo văn bản từ một prompt đơn giản."""
        if not self.model:
            raise Exception("Gemini API key not configured.")
        try:
            def _generate_sync():
                config = genai.types.GenerationConfig(
                    max_output_tokens=max_tokens,
                    temperature=temperature
                )
                response = self.model.generate_content(prompt, generation_config=config)
                return response.text
            return await self._run_in_thread(_generate_sync)
        except Exception as e:
            logger.error(f"❌ Gemini generation error: {e}")
            raise

    async def summarize_text(self, text: str) -> str:
        """Tóm tắt văn bản."""
        prompt = f"Tóm tắt đoạn văn bản sau một cách ngắn gọn, tập trung vào các ý chính: \n\n{text}"
        return await self.generate_text(prompt, max_tokens=250)

    async def categorize_text(self, text: str) -> str:
        """Phân loại văn bản."""
        prompt = f"Phân loại đoạn văn bản sau vào 1 trong các chủ đề (ví dụ: Tin tức, Phân tích, Hướng dẫn): \n\n{text}"
        return await self.generate_text(prompt, max_tokens=50)

    async def create_embedding(self, text: str) -> List[float]:
        """Tạo embedding cho văn bản (dùng cho RAG)."""
        # Temporarily return dummy embedding to avoid quota issues
        return [0.0] * 768  # Standard embedding size
        
    async def create_document_embedding(self, text: str) -> List[float]:
        """Tạo embedding cho văn bản (dùng để lưu trữ)."""
        # Temporarily return dummy embedding to avoid quota issues
        return [0.0] * 768  # Standard embedding size

    def _check_rate_limit(self) -> bool:
        """Check and update rate limits."""
        current_time = datetime.now()
        
        # Kiểm tra nếu đang trong thời gian chờ
        if self.quota_exceeded and self.last_error_time:
            cooldown = 10  # Chỉ chờ 10 giây
            cooldown_remaining = cooldown - (current_time - self.last_error_time).total_seconds()
            if cooldown_remaining > 0:
                logger.warning(f"⚠️ Đợi {cooldown_remaining:.0f}s")
                return False
                
            # Hết thời gian chờ
            self.quota_exceeded = False
            self.last_error_time = None
            self.last_error = None
            logger.info("✅ Tiếp tục gọi API")
            
        # Reset counter mỗi phút
        if (current_time - self.last_reset).total_seconds() >= 60:
            self.request_count = 0
            self.last_reset = current_time
            
        # Kiểm tra giới hạn requests/phút
        if self.request_count >= self.max_requests_per_minute:
            logger.warning(f"⚠️ Quá {self.max_requests_per_minute} requests/phút")
            self.quota_exceeded = True
            self.last_error_time = current_time
            return False
            
        self.request_count += 1
        return True

    async def chat_completion(self, messages: list[dict], context: str = "") -> str:
        """Tạo phản hồi chat."""
        try:
            # Validate input
            if not messages:
                return "Xin lỗi, tôi không nhận được câu hỏi của bạn. Vui lòng thử lại."

            # Check rate limits and quota
            if not self._check_rate_limit():
                if self.quota_exceeded and self.last_error_time:
                    current_time = datetime.now()
                    cooldown_remaining = 60 - (current_time - self.last_error_time).total_seconds()
                    if cooldown_remaining > 0:
                        return f"Hệ thống đang tạm nghỉ để đảm bảo chất lượng. Vui lòng thử lại sau {cooldown_remaining:.0f} giây."
                return "Hệ thống đang bận. Vui lòng thử lại sau vài giây."

            def _chat_sync():
                try:
                    # Create content list for the model
                    contents = []
                    
                    # Add system prompt
                    contents.append({
                        "role": "user",
                        "parts": ["Bạn là trợ lý AI chuyên về tin tức crypto/blockchain. Trả lời ngắn gọn, chính xác."]
                    })
                    contents.append({
                        "role": "model",
                        "parts": ["Xin chào! Tôi sẽ trả lời các câu hỏi về crypto/blockchain một cách ngắn gọn và chính xác."]
                    })
                    
                    # Add previous messages for context
                    for msg in messages[:-1]:  # All except the latest
                        content = msg.get("content", "")
                        if content:
                            contents.append({
                                "role": "user" if msg.get("role") != "assistant" else "model",
                                "parts": [content]
                            })
                    
                    # Lấy nội dung tin nhắn
                    user_message = messages[-1].get('content', '')
                    if not user_message:
                        return "Xin lỗi, tôi không nhận được nội dung câu hỏi. Vui lòng thử lại."

                    # Lấy tin nhắn mới nhất
                    user_message = messages[-1].get('content', '')
                    if not user_message:
                        return "Xin lỗi, tôi không nhận được nội dung câu hỏi. Vui lòng thử lại."
                    
                    # Add latest message
                    contents.append({"role": "user", "parts": [user_message]})
                    
                    # Add context if available
                    if context:
                        contents.append({"role": "user", "parts": [f"Thông tin bổ sung: {context}"]})
                    
                    try:
                        # Generate response using content history
                        response = self.model.generate_content(
                            contents=contents,
                            generation_config={
                                "temperature": 0.7,
                                "max_output_tokens": 250,
                            }
                        )
                    except Exception as e:
                        logger.error(f"❌ Lỗi tạo phản hồi: {str(e)}")
                        # Try simpler format without history
                        try:
                            simple_prompt = f"Bạn là trợ lý AI chuyên về tin tức crypto/blockchain. Trả lời ngắn gọn, chính xác.\n\nCâu hỏi: {user_message}"
                            response = self.model.generate_content(simple_prompt)
                        except Exception as e2:
                            logger.error(f"❌ Lỗi thử lại: {str(e2)}")
                            return "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau."

                    # Xử lý phản hồi
                    if not hasattr(response, 'candidates') or not response.candidates:
                        return "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử câu hỏi khác."

                    candidate = response.candidates[0]
                    if not hasattr(candidate, 'content') or not candidate.content.parts:
                        return "Xin lỗi, tôi không nhận được phản hồi đầy đủ. Vui lòng thử lại."

                    # Ghép các phần text
                    text_parts = []
                    for part in candidate.content.parts:
                        if hasattr(part, 'text') and part.text:
                            text_parts.append(part.text)

                    if not text_parts:
                        return "Không nhận được phản hồi từ AI. Vui lòng thử lại."

                    return "\n".join(text_parts).strip()

                except Exception as e:
                    error_str = str(e).lower()
                    logger.error(f"❌ Lỗi chat: {str(e)}")
                    
                    if "429" in error_str or "quota" in error_str or "rate" in error_str:
                        self.quota_exceeded = True
                        self.last_error_time = datetime.now()
                        return f"API đang bận. Vui lòng thử lại sau 10 giây."
                        
                    return "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau."

            try:
                return await self._run_in_thread(_chat_sync)
            except Exception as e:
                if "Rate limit" in str(e):
                    return "Hệ thống đang tạm nghỉ để đảm bảo chất lượng. Vui lòng thử lại sau 1 phút."
                return "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau."
        
        except Exception as e:
            logger.error(f"❌ Gemini error: {str(e)}")
            return "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau."

# Tạo một instance để các file khác import và sử dụng
gemini_service = GeminiService()