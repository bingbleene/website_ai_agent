"""
Test tạo bài báo đầy đủ từ trending keywords và xuất ra HTML (sử dụng Mistral AI)
"""
import os
import time
from dotenv import load_dotenv
from app.services.generative_newspaper_mistral import generative_newspaper_mistral
from app.services.html_export_service import HTMLExportService

# Load environment variables
load_dotenv()

# ============================================================
# CẤU HÌNH: Số lượng bài báo muốn tạo
# ============================================================
NUM_ARTICLES = 2  # Thay đổi số này để tạo nhiều/ít bài hơn
# ============================================================

def test_full_workflow():
    """Test quy trình đầy đủ: trending -> generate article -> export HTML"""
    
    print("="*80)
    print(f"🚀 TẠO {NUM_ARTICLES} BÀI BÁO TỪ TRENDING KEYWORDS (MISTRAL AI)")
    print("="*80)
    
    # Get API keys
    mistral_key = os.getenv("GEMINI_API_KEY")  # Đang dùng tạm biến GEMINI_API_KEY cho Mistral key
    unsplash_key = os.getenv("UNSPLASH_ACCESS_KEY")
    
    if not mistral_key:
        print("❌ Thiếu GEMINI_API_KEY (Mistral key) trong .env file!")
        return
    
    print(f"\n✅ Mistral API: Configured")
    print(f"✅ Unsplash API: {'Configured' if unsplash_key else 'Not configured (will use placeholders)'}")
    
    # Initialize services
    print("\n📦 Khởi tạo services...")
    newspaper = generative_newspaper_mistral(
        api_key=mistral_key,
        unsplash_api_key=unsplash_key
    )
    html_exporter = HTMLExportService(output_dir='./article-html/bich')
    
    print("\n" + "="*80)
    print("BƯỚC 1: LẤY TRENDING KEYWORDS")
    print("="*80)
    
    # Get trending keywords
    keywords = newspaper.get_trending_keywords()
    
    if not keywords:
        print("❌ Không lấy được trending keywords!")
        return
    
    print(f"\n✅ Tìm thấy {len(keywords)} trending keywords")
    print("\n📋 Top 10 trending:")
    for i, kw in enumerate(keywords[:10], 1):
        print(f"   {i:2d}. {kw}")
    
    # Chọn keywords để tạo bài (theo số lượng cấu hình)
    import random
    selected_keywords = []
    available_keywords = keywords[:min(20, len(keywords))]  # Lấy trong top 20
    
    if NUM_ARTICLES <= len(available_keywords):
        # Nếu đủ keyword, chọn random
        selected_keywords = random.sample(available_keywords, NUM_ARTICLES)
    else:
        # Nếu không đủ, lấy tất cả + lặp lại
        selected_keywords = available_keywords * (NUM_ARTICLES // len(available_keywords) + 1)
        selected_keywords = selected_keywords[:NUM_ARTICLES]
    
    print("\n" + "="*80)
    print(f"BƯỚC 2: TẠO {NUM_ARTICLES} BÀI VIẾT")
    print("="*80)
    print(f"\n🎯 Keywords được chọn:")
    for i, kw in enumerate(selected_keywords, 1):
        print(f"   {i:2d}. {kw}")
    
    # Generate articles
    results = []
    success_count = 0
    failed_keywords = []
    
    for idx, keyword in enumerate(selected_keywords, 1):
        try:
            print("\n" + "-"*80)
            print(f"📰 [{idx}/{NUM_ARTICLES}] Đang tạo bài về: '{keyword}'")
            print("-"*80)
            print("⏳ Đang tạo bài viết (30-60s)...")
            
            start_time = time.time()
            
            # Generate article
            article = newspaper.generate_article(keyword)
            
            if not article:
                print(f"❌ Không tạo được bài viết cho keyword: {keyword}")
                failed_keywords.append(keyword)
                continue
            
            elapsed = time.time() - start_time
            
            print(f"\n✅ TẠO BÀI VIẾT THÀNH CÔNG!")
            print(f"📰 Title: {article['title']}")
            print(f"📂 Category: {article['category']}")
            print(f"🔤 Word count: ~{len(article['content'].split())} từ")
            
            print("\n📤 Đang xuất HTML...")
            
            # Get images from article
            content_images = article.get('images', [])
            
            # Export to HTML
            html_path = html_exporter.export_article(
                title=article['title'],
                category=article['category'],
                excerpt=article['excerpt'],
                content=article['content'],
                thumbnail_url=article['thumbnail'],
                thumbnail_alt=article.get('thumbnail_alt', f"Hình minh họa về {keyword}"),
                images=content_images,
                keyword=keyword
            )
            
            print(f"✅ Xuất HTML thành công: {os.path.basename(html_path)}")
            print(f"⏱️  Thời gian: {elapsed:.1f}s")
            
            results.append({
                "keyword": keyword,
                "article": article,
                "html_path": html_path,
                "elapsed_time": elapsed
            })
            success_count += 1
            
            # Delay giữa các bài để tránh rate limit
            if idx < NUM_ARTICLES:
                print("\n⏳ Chờ 3s trước khi tạo bài tiếp theo...")
                time.sleep(3)
                
        except Exception as e:
            print(f"\n❌ Lỗi khi tạo bài về '{keyword}': {e}")
            failed_keywords.append(keyword)
            continue
    
    print("\n" + "="*80)
    print("✅ HOÀN THÀNH TẤT CẢ!")
    print("="*80)
    
    print(f"\n📊 KẾT QUẢ:")
    print(f"   ✅ Thành công: {success_count}/{NUM_ARTICLES} bài")
    if failed_keywords:
        print(f"   ❌ Thất bại: {', '.join(failed_keywords)}")
    print(f"   📁 Thư mục output: ./article-html/")
    
    if results:
        print(f"\n📋 DANH SÁCH BÀI VIẾT:")
        for i, r in enumerate(results, 1):
            print(f"   {i:2d}. [{r['keyword']}] {r['article']['title'][:60]}...")
            print(f"       File: {os.path.basename(r['html_path'])}")
    
    print("="*80)
    
    return {
        "total": NUM_ARTICLES,
        "success": success_count,
        "failed": len(failed_keywords),
        "results": results
    }


if __name__ == "__main__":
    try:
        result = test_full_workflow()
        if result:
            print("\n✅ Test hoàn thành thành công!")
    except KeyboardInterrupt:
        print("\n\n⚠️ Bị dừng bởi người dùng")
    except Exception as e:
        print(f"\n\n❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
