"""
Chatbot API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from bson import ObjectId
from loguru import logger

from app.models.schemas import ChatRequest, ChatResponse, ArticleResponse
from app.core.database import get_database
from app.services.openai_service import openai_service

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    db = Depends(get_database)
):
    """Chat with AI assistant (RAG-based)"""
    try:
        # Convert user message to embedding
        query_embedding = await openai_service.create_embedding(request.message)
        
        # Vector search for relevant articles
        # Note: Requires MongoDB Atlas Vector Search index
        try:
            pipeline = [
                {
                    "$search": {
                        "knnBeta": {
                            "vector": query_embedding,
                            "path": "article_vector",
                            "k": 3
                        }
                    }
                },
                {
                    "$match": {
                        "status": "published"
                    }
                },
                {
                    "$project": {
                        "title": 1,
                        "summary": 1,
                        "content": 1,
                        "score": {"$meta": "searchScore"}
                    }
                },
                {"$limit": 3}
            ]
            
            relevant_articles = await db.articles.aggregate(pipeline).to_list(length=3)
            
        except Exception as vector_error:
            logger.warning(f"⚠️ Vector search failed: {vector_error}, using text search")
            # Fallback to text search
            relevant_articles = await db.articles.find({
                "$text": {"$search": request.message},
                "status": "published"
            }).limit(3).to_list(length=3)
        
        # Build context from articles
        context = ""
        related_articles = []
        sources = []
        
        for article in relevant_articles:
            context += f"\nBài viết: {article['title']}\n"
            context += f"Tóm tắt: {article.get('summary', '')}\n"
            context += f"Nội dung: {article.get('content', '')[:500]}...\n"
            
            article['_id'] = str(article['_id'])
            related_articles.append(ArticleResponse(**article))
            sources.append(article['title'])
        
        # Prepare messages for chat
        messages = []
        
        # Add conversation history
        for msg in request.conversation_history[-5:]:  # Last 5 messages
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # Get AI response with context
        ai_response = await openai_service.chat_completion(
            messages=messages,
            context=context
        )
        
        response = ChatResponse(
            message=ai_response,
            related_articles=related_articles[:3],
            sources=sources
        )
        
        logger.info(f"✅ Chatbot responded with {len(related_articles)} related articles")
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Chatbot error: {e}")
        # Return fallback response
        return ChatResponse(
            message="Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
            related_articles=[],
            sources=[]
        )


@router.get("/health")
async def chatbot_health():
    """Check chatbot health"""
    try:
        # Test OpenAI connection
        test_response = await openai_service.generate_text(
            prompt="Say 'OK' if you are working",
            max_tokens=5,
            temperature=0
        )
        
        return {
            "status": "healthy",
            "ai_service": "operational",
            "test_response": test_response
        }
        
    except Exception as e:
        logger.error(f"❌ Chatbot health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }
