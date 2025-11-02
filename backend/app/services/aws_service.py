"""
AWS Services - Personalize and SES
"""
import boto3
from botocore.exceptions import ClientError
from typing import List, Dict
from loguru import logger

from app.core.config import settings


class AWSService:
    def __init__(self):
        self.enabled = bool(settings.AWS_ACCESS_KEY_ID and settings.AWS_ACCESS_KEY_ID.strip())
        
        if not self.enabled:
            logger.warning("⚠️ AWS disabled - will use fallback recommendations")
            self.personalize_runtime = None
            self.ses_client = None
            return
            
        # Initialize AWS clients
        self.session = boto3.Session(
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        
        try:
            self.personalize_runtime = self.session.client('personalize-runtime')
            self.ses_client = self.session.client('ses')
            logger.info("✅ Initialized AWS services")
        except Exception as e:
            logger.warning(f"⚠️ AWS initialization failed: {e}")
            self.personalize_runtime = None
            self.ses_client = None
            self.enabled = False
    
    async def get_recommendations(
        self,
        user_id: str,
        limit: int = 10,
        context: Dict = None
    ) -> List[str]:
        """Get personalized article recommendations using Amazon Personalize"""
        if not self.personalize_runtime:
            logger.warning("Amazon Personalize not configured")
            return []
        
        try:
            response = self.personalize_runtime.get_recommendations(
                campaignArn=settings.AWS_PERSONALIZE_CAMPAIGN_ARN,
                userId=user_id,
                numResults=limit,
                context=context or {}
            )
            
            # Extract recommended article IDs
            recommended_items = [item['itemId'] for item in response['itemList']]
            
            logger.info(f"✅ Got {len(recommended_items)} recommendations for user {user_id}")
            return recommended_items
            
        except ClientError as e:
            logger.error(f"❌ Amazon Personalize error: {e}")
            return []
    
    async def send_email(
        self,
        to_addresses: List[str],
        subject: str,
        html_body: str,
        text_body: str = None
    ) -> bool:
        """Send email using Amazon SES"""
        if not self.ses_client:
            logger.warning("Amazon SES not configured")
            return False
        
        try:
            response = self.ses_client.send_email(
                Source=settings.AWS_SES_SENDER_EMAIL,
                Destination={'ToAddresses': to_addresses},
                Message={
                    'Subject': {'Data': subject, 'Charset': 'UTF-8'},
                    'Body': {
                        'Html': {'Data': html_body, 'Charset': 'UTF-8'},
                        'Text': {'Data': text_body or html_body, 'Charset': 'UTF-8'}
                    }
                }
            )
            
            logger.info(f"✅ Email sent to {len(to_addresses)} recipients")
            return True
            
        except ClientError as e:
            logger.error(f"❌ Amazon SES error: {e}")
            return False
    
    async def send_bulk_email(
        self,
        recipients: List[Dict[str, str]],  # [{"email": "...", "article_ids": [...]}]
        template_data: Dict
    ) -> Dict[str, int]:
        """Send personalized bulk emails"""
        success_count = 0
        fail_count = 0
        
        for recipient in recipients:
            email = recipient['email']
            article_ids = recipient.get('article_ids', [])
            
            # Generate personalized content (simplified)
            subject = f"Tin tức hôm nay dành cho bạn - {len(article_ids)} bài viết mới"
            html_body = self._generate_email_html(article_ids, template_data)
            
            success = await self.send_email(
                to_addresses=[email],
                subject=subject,
                html_body=html_body
            )
            
            if success:
                success_count += 1
            else:
                fail_count += 1
        
        logger.info(f"📧 Bulk email: {success_count} sent, {fail_count} failed")
        
        return {
            "success": success_count,
            "failed": fail_count
        }
    
    def _generate_email_html(self, article_ids: List[str], template_data: Dict) -> str:
        """Generate HTML email content"""
        # Simplified email template
        articles_html = ""
        
        for article in template_data.get('articles', []):
            if article['id'] in article_ids:
                articles_html += f"""
                <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd;">
                    <h2>{article['title']}</h2>
                    <p>{article['summary']}</p>
                    <a href="{template_data.get('base_url')}/articles/{article['id']}" 
                       style="color: #007bff;">Đọc thêm →</a>
                </div>
                """
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Tin tức hôm nay</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Chào bạn! 👋</h1>
            <p>Dưới đây là những tin tức được chọn riêng cho bạn:</p>
            {articles_html}
            <hr>
            <p style="color: #666; font-size: 12px;">
                Bạn nhận được email này vì đã đăng ký nhận tin từ hệ thống của chúng tôi.
            </p>
        </body>
        </html>
        """
        
        return html


# Singleton instance
aws_service = AWSService()
