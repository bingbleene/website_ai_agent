"""
Chatbot API Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from loguru import logger

from app.models.schemas import ChatRequest, ChatResponse, ArticleResponse
from app.core.database import get_database

# 👇 THAY THẾ OPENAI BẰNG GEMINI 👇
from app.services.google_service import gemini_service 

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, db = Depends(get_database)):
    """Chat with AI assistant (RAG-based using Gemini)"""
    try:
        # 👇 ĐÃ ĐỔI SANG GEMINI 👇
        query_embedding = await gemini_service.create_embedding(request.message)
        
        try:
            pipeline = [
                {"$search": {
                    "knnBeta": {
                        "vector": query_embedding,
                        "path": "article_vector", 
                        "k": 3
                    }
                }},
                { "$match": { "status": "published" }},
                { "$project": { "title": 1, "summary": 1, "content": 1, "score": {"$meta": "searchScore"} }},
                {"$limit": 3}
            ]
            relevant_articles = await db.articles.aggregate(pipeline).to_list(length=3)
        except Exception as vector_error:
            logger.warning(f"⚠️ Vector search failed: {vector_error}, using text search")
            relevant_articles = await db.articles.find(
                {"$text": {"$search": request.message}, "status": "published"}
            ).limit(3).to_list(length=3)
        
        context = ""
        related_articles = []
        sources = []
        for article in relevant_articles:
            context += f"\nBài viết: {article['title']}\nNội dung: {article.get('content', '')[:500]}...\n"
            article['_id'] = str(article['_id'])
            related_articles.append(ArticleResponse(**article))
            sources.append(article['title'])
        
        # Format messages for Gemini service
        messages = []
        try:
            # Get last 5 messages from history
            for msg in request.conversation_history[-5:]:
                role = msg.role if hasattr(msg, 'role') else ('assistant' if getattr(msg, 'type', '') == 'bot' else 'user')
                content = msg.content if hasattr(msg, 'content') else str(msg)
                messages.append({"role": role, "content": content})
        except Exception as e:
            logger.warning(f"⚠️ Error processing history: {e}")
            # Continue with empty history if there's an error
            
        # Add current message
        messages.append({"role": "user", "content": request.message})
        
        # 👇 ĐÃ ĐỔI SANG GEMINI 👇
        ai_response = await gemini_service.chat_completion(
            messages=messages,
            context=context
        )
        
        response = ChatResponse(message=ai_response, related_articles=related_articles, sources=sources)
        logger.info(f"✅ Chatbot (Gemini) responded.")
        return response
        
    except Exception as e:
        logger.error(f"❌ Chatbot error: {e}")
        return ChatResponse(
            message="Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
            related_articles=[],
            sources=[]
        )

@router.get("/health")
async def chatbot_health():
    """Check chatbot health"""
    try:
        # 👇 ĐÃ ĐỔI SANG GEMINI 👇
        test_response = await gemini_service.generate_text("Say 'OK' if you are working", max_tokens=5)
        return {"status": "healthy", "ai_service": "Gemini (operational)", "test_response": test_response}
    except Exception as e:
        logger.error(f"❌ Chatbot health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}