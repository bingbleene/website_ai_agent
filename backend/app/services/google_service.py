"""
Google Cloud Services - Translation and Sentiment Analysis
"""
from google.cloud import translate_v2 as translate
from google.cloud import language_v1
from typing import Dict
from loguru import logger
import os

from app.core.config import settings


class GoogleCloudService:
    def __init__(self):
        self.enabled = bool(settings.GOOGLE_APPLICATION_CREDENTIALS or settings.GOOGLE_TRANSLATE_API_KEY)
        
        if not self.enabled:
            logger.warning("⚠️ Google Cloud disabled - will use fallback translation")
            self.translate_client = None
            self.language_client = None
            return
            
        # Set credentials if provided
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
    
    async def translate_text(
        self,
        text: str,
        target_language: str,
        source_language: str = "auto"
    ) -> Dict[str, str]:
        """Translate text using Google Cloud Translation API"""
        if not self.translate_client:
            raise Exception("Google Cloud Translation not configured")
        
        try:
            # Detect source language if auto
            if source_language == "auto":
                detection = self.translate_client.detect_language(text)
                source_language = detection['language']
            
            # Translate
            result = self.translate_client.translate(
                text,
                target_language=target_language,
                source_language=source_language
            )
            
            logger.info(f"✅ Translated {source_language} → {target_language}")
            
            return {
                "translated_text": result['translatedText'],
                "source_language": source_language,
                "target_language": target_language
            }
            
        except Exception as e:
            logger.error(f"❌ Google Translation error: {e}")
            raise
    
    async def analyze_sentiment(self, text: str) -> Dict[str, any]:
        """Analyze sentiment using Google Cloud Natural Language API"""
        if not self.enabled or not self.language_client:
            # Fallback: Simple sentiment analysis
            logger.info("⚠️ Using fallback sentiment analysis (Google Cloud disabled)")
            
            # Simple keyword-based sentiment
            negative_words = ['tệ', 'dở', 'kém', 'xấu', 'ghét', 'tồi', 'bad', 'terrible', 'hate']
            positive_words = ['tốt', 'hay', 'đẹp', 'tuyệt', 'xuất sắc', 'good', 'great', 'excellent', 'love']
            
            text_lower = text.lower()
            neg_count = sum(1 for word in negative_words if word in text_lower)
            pos_count = sum(1 for word in positive_words if word in text_lower)
            
            if pos_count > neg_count:
                return {"sentiment": "positive", "score": 0.5, "magnitude": 1.0}
            elif neg_count > pos_count:
                return {"sentiment": "negative", "score": -0.5, "magnitude": 1.0}
            else:
                return {"sentiment": "neutral", "score": 0.0, "magnitude": 0.5}
        
        try:
            document = language_v1.Document(
                content=text,
                type_=language_v1.Document.Type.PLAIN_TEXT,
                language="vi"
            )
            
            # Analyze sentiment
            sentiment_response = self.language_client.analyze_sentiment(
                request={'document': document}
            )
            
            sentiment = sentiment_response.document_sentiment
            
            # Classify sentiment
            score = sentiment.score  # Range: -1.0 (negative) to 1.0 (positive)
            magnitude = sentiment.magnitude  # 0.0 to infinity
            
            if score >= 0.25:
                sentiment_type = "positive"
            elif score <= -0.25:
                sentiment_type = "negative"
            else:
                sentiment_type = "neutral"
            
            logger.info(f"✅ Sentiment analyzed: {sentiment_type} (score: {score:.2f})")
            
            return {
                "sentiment": sentiment_type,
                "score": score,
                "magnitude": magnitude
            }
            
        except Exception as e:
            logger.error(f"❌ Google Sentiment analysis error: {e}")
            return {
                "sentiment": "neutral",
                "score": 0.0,
                "magnitude": 0.0
            }
    
    async def detect_language(self, text: str) -> str:
        """Detect language of text"""
        if not self.translate_client:
            return "vi"  # Default
        
        try:
            result = self.translate_client.detect_language(text)
            language = result['language']
            logger.info(f"✅ Detected language: {language}")
            return language
            
        except Exception as e:
            logger.error(f"❌ Language detection error: {e}")
            return "vi"


# Singleton instance
google_service = GoogleCloudService()
