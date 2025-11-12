"""
Seed Database Script
Tự động insert mock data vào MongoDB để thay thế mockData.js
Run: python seed_database.py
"""

import os
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "ai_news_db")

print(f"🔗 Đang kết nối MongoDB: {MONGODB_DB_NAME}...")
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB_NAME]

# ==================== USERS DATA ====================
users_data = [
    {
        "_id": 1,
        "username": "johnsmithMMM",
        "password": "$2b$12$wI6QwQJQwQJQwQJQwQJQwOeQwQJQwQJQwQJQwQJQwQJQwQJQwQJq",
        "name": "John Smith",
        "email": "john.smith@example.com",
        "role": "admin",
        "avatar": "https://ui-avatars.com/api/?name=John+Smith&background=3b82f6&color=fff",
        "status": "active",
        "articlesCount": 25,
        "commentsCount": 150,
        "joinedAt": "2024-01-15",
        "lastActive": "2025-10-27"
    },
    {
        "_id": 2,
        "username": "sarahchen",
        "password": "$2b$12$wI6QwQJQwQJQwQJQwQJQwOeQwQJQwQJQwQJQwQJQwQJQwQJQwQJq",
        "name": "Sarah Chen",
        "email": "sarah.chen@example.com",
        "role": "editor",
        "avatar": "https://ui-avatars.com/api/?name=Sarah+Chen&background=8b5cf6&color=fff",
        "status": "active",
        "articlesCount": 32,
        "commentsCount": 210,
        "joinedAt": "2024-02-20",
        "lastActive": "2025-10-26"
    },
    {
        "_id": 3,
        "username": "michaelbrown",
        "password": "$2b$12$wI6QwQJQwQJQwQJQwQJQwOeQwQJQwQJQwQJQwQJQwQJQwQJQwQJq",
        "name": "Michael Brown",
        "email": "michael.brown@example.com",
        "role": "editor",
        "avatar": "https://ui-avatars.com/api/?name=Michael+Brown&background=ec4899&color=fff",
        "status": "active",
        "articlesCount": 18,
        "commentsCount": 95,
        "joinedAt": "2024-03-10",
        "lastActive": "2025-10-25"
    },
    {
        "_id": 4,
        "username": "emilywong",
        "password": "$2b$12$wI6QwQJQwQJQwQJQwQJQwOeQwQJQwQJQwQJQwQJQwQJQwQJQwQJq",
        "name": "Dr. Emily Wong",
        "email": "emily.wong@example.com",
        "role": "author",
        "avatar": "https://ui-avatars.com/api/?name=Emily+Wong&background=10b981&color=fff",
        "status": "active",
        "articlesCount": 15,
        "commentsCount": 80,
        "joinedAt": "2024-04-05",
        "lastActive": "2025-10-24"
    },
    {
        "_id": 5,
        "username": "alexjohnson",
        "password": "$2b$12$wI6QwQJQwQJQwQJQwQJQwOeQwQJQwQJQwQJQwQJQwQJQwQJQwQJq",
        "name": "Alex Johnson",
        "email": "alex.johnson@example.com",
        "role": "author",
        "avatar": "https://ui-avatars.com/api/?name=Alex+Johnson&background=f59e0b&color=fff",
        "status": "active",
        "articlesCount": 22,
        "commentsCount": 130,
        "joinedAt": "2024-05-12",
        "lastActive": "2025-10-23"
    },   
]

# ==================== CATEGORIES DATA ====================
categories_data = [
    {"_id": 1, "name": "AI Models", "slug": "ai-models", "articlesCount": 15, "color": "#3b82f6"},
    {"_id": 2, "name": "Quantum AI", "slug": "quantum-ai", "articlesCount": 8, "color": "#8b5cf6"},
    {"_id": 3, "name": "AI Ethics", "slug": "ai-ethics", "articlesCount": 12, "color": "#ec4899"},
    {"_id": 4, "name": "Healthcare AI", "slug": "healthcare-ai", "articlesCount": 10, "color": "#10b981"},
    {"_id": 5, "name": "AutoML", "slug": "automl", "articlesCount": 7, "color": "#f59e0b"},
    {"_id": 6, "name": "Climate Tech", "slug": "climate-tech", "articlesCount": 9, "color": "#06b6d4"},
    {"_id": 7, "name": "Multimodal AI", "slug": "multimodal-ai", "articlesCount": 11, "color": "#8b5cf6"},
    {"_id": 8, "name": "Edge Computing", "slug": "edge-computing", "articlesCount": 6, "color": "#3b82f6"},
    {"_id": 9, "name": "Developer Tools", "slug": "developer-tools", "articlesCount": 13, "color": "#ec4899"}
]

# ==================== ARTICLES DATA ====================
articles_data = [
    {
        "_id": 1,
        "title": "GPT-5 Released: A New Era of AI Language Models",
        "slug": "gpt-5-released-new-era-ai-language-models",
        "excerpt": "OpenAI announces the release of GPT-5, featuring unprecedented capabilities in natural language understanding and generation with breakthrough improvements in reasoning and multimodal processing.",
        "content": """<p>OpenAI has officially announced the release of GPT-5, marking a significant milestone in the evolution of artificial intelligence. This latest iteration brings unprecedented capabilities in natural language understanding and generation, setting new benchmarks across various AI tasks.</p>

<img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop" alt="AI Technology Visualization" />

<h2>Key Features and Improvements</h2>

<p>GPT-5 introduces several groundbreaking features that distinguish it from its predecessors:</p>

<ul>
  <li><strong>Enhanced Reasoning:</strong> The model demonstrates remarkable improvements in logical reasoning and problem-solving capabilities, approaching human-level performance on complex cognitive tasks.</li>
  <li><strong>Multimodal Processing:</strong> Seamlessly integrates text, images, audio, and video understanding in a unified architecture.</li>
  <li><strong>Context Window:</strong> Expanded to 1 million tokens, enabling analysis of entire books or codebases in a single prompt.</li>
  <li><strong>Reduced Hallucinations:</strong> Novel training techniques have dramatically reduced factual errors and improved reliability.</li>
</ul>

<img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop" alt="Neural Network Visualization" />

<h2>Performance Benchmarks</h2>

<p>In extensive testing across academic and industry benchmarks, GPT-5 has achieved remarkable results:</p>

<blockquote>
  "GPT-5 represents a quantum leap in AI capabilities. Its performance on reasoning tasks is truly unprecedented." - Dr. Sarah Chen, AI Research Lead
</blockquote>

<p>The model scored 95% on the MMLU benchmark, 98% on coding challenges, and demonstrated near-perfect performance on multilingual tasks across 100+ languages.</p>

<h2>Implications for Industry</h2>

<p>The release of GPT-5 is expected to have far-reaching implications across multiple sectors:</p>

<ul>
  <li>Healthcare: Enhanced diagnostic assistance and personalized treatment planning</li>
  <li>Education: Adaptive learning systems with unprecedented personalization</li>
  <li>Software Development: AI-powered coding assistants approaching expert-level capabilities</li>
  <li>Scientific Research: Accelerated discovery through advanced data analysis and hypothesis generation</li>
</ul>

<img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop" alt="Future Technology" />

<h2>Ethical Considerations</h2>

<p>OpenAI has implemented robust safety measures and ethical guidelines for GPT-5 deployment. The company emphasizes responsible AI development and has introduced new alignment techniques to ensure the model's outputs align with human values and intentions.</p>

<p>Beta access is now available to select partners, with general availability expected in early 2026. The AI community eagerly anticipates exploring the full potential of this revolutionary language model.</p>""",
        "categoryId": 1,
        "category": "AI Models",
        "authorId": 1,
        "author": "John Smith",
        "authorAvatar": "https://ui-avatars.com/api/?name=John+Smith&background=3b82f6&color=fff",
        "status": "published",
        "featured": True,
        "views": 15420,
        "likes": 892,
        "commentsCount": 145,
        "readTime": "8 min",
        "tags": ["GPT-5", "OpenAI", "Language Models", "NLP"],
        "thumbnail": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop",
        "publishedAt": "2025-10-25T10:30:00Z",
        "updatedAt": "2025-10-25T10:30:00Z",
        "createdAt": "2025-10-24T15:20:00Z"
    },
    {
        "_id": 2,
        "title": "Quantum Computing Breakthrough: AI Training 100x Faster",
        "slug": "quantum-computing-breakthrough-ai-training-faster",
        "excerpt": "Researchers achieve quantum advantage in machine learning, dramatically reducing training time for large neural networks through novel quantum-classical hybrid approaches.",
        "content": """<p>A team of researchers has achieved a groundbreaking milestone in quantum computing, demonstrating that quantum processors can train large neural networks up to 100 times faster than classical supercomputers.</p>

<img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop" alt="Quantum Computing" />

<h2>The Breakthrough</h2>
<p>This achievement represents years of research in quantum machine learning. The team successfully implemented a quantum-classical hybrid approach that leverages the unique properties of quantum mechanics to accelerate the most computationally intensive parts of neural network training.</p>

<h2>Technical Details</h2>
<p>The quantum advantage was achieved through:</p>
<ul>
  <li>Novel quantum circuits optimized for matrix operations</li>
  <li>Advanced error correction techniques</li>
  <li>Efficient quantum-classical data transfer protocols</li>
  <li>Optimized quantum gate sequences for gradient computation</li>
</ul>

<img src="https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&auto=format&fit=crop" alt="Quantum Circuit" />

<h2>Implications for AI Development</h2>
<p>This breakthrough could revolutionize how we develop and deploy AI models, making it possible to train models that would take months in just days or even hours. Industries from drug discovery to climate modeling stand to benefit enormously.</p>

<h2>Next Steps</h2>
<p>The research team is now working on scaling up the system and making it accessible to more researchers through cloud-based quantum computing platforms.</p>""",
        "categoryId": 2,
        "category": "Quantum AI",
        "authorId": 2,
        "author": "Sarah Chen",
        "authorAvatar": "https://ui-avatars.com/api/?name=Sarah+Chen&background=8b5cf6&color=fff",
        "status": "published",
        "featured": True,
        "views": 12850,
        "likes": 756,
        "commentsCount": 98,
        "readTime": "6 min",
        "tags": ["Quantum Computing", "Machine Learning", "Neural Networks"],
        "thumbnail": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop",
        "publishedAt": "2025-10-24T14:20:00Z",
        "updatedAt": "2025-10-24T14:20:00Z",
        "createdAt": "2025-10-23T09:15:00Z"
    },
    {
        "_id": 3,
        "title": "Ethical AI: New Framework for Responsible Development",
        "slug": "ethical-ai-framework-responsible-development",
        "excerpt": "Major tech companies collaborate on comprehensive guidelines for ethical AI development and deployment, addressing bias, transparency, and accountability.",
        "content": """<p>Leading technology companies have come together to establish a comprehensive framework for ethical AI development. This collaborative effort aims to address growing concerns about AI bias, transparency, and accountability.</p>

<h2>Key Principles</h2>
<p>The framework is built on five core principles:</p>
<ul>
  <li>Fairness and bias mitigation</li>
  <li>Transparency and explainability</li>
  <li>Privacy and data protection</li>
  <li>Accountability and governance</li>
  <li>Social benefit and harm prevention</li>
</ul>

<h2>Implementation Guidelines</h2>
<p>The framework provides detailed guidelines for implementing these principles throughout the AI development lifecycle, from data collection to model deployment and monitoring.</p>""",
        "categoryId": 3,
        "category": "AI Ethics",
        "authorId": 3,
        "author": "Michael Brown",
        "authorAvatar": "https://ui-avatars.com/api/?name=Michael+Brown&background=ec4899&color=fff",
        "status": "draft",
        "featured": False,
        "views": 0,
        "likes": 0,
        "commentsCount": 0,
        "readTime": "10 min",
        "tags": ["Ethics", "AI Governance", "Responsible AI"],
        "thumbnail": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop",
        "publishedAt": None,
        "updatedAt": "2025-10-23T16:45:00Z",
        "createdAt": "2025-10-22T11:30:00Z"
    },
    {
        "_id": 4,
        "title": "AI in Healthcare: Detecting Diseases Before Symptoms Appear",
        "slug": "ai-healthcare-detecting-diseases-early",
        "excerpt": "Revolutionary AI system can predict and diagnose diseases months before traditional symptoms manifest, potentially saving millions of lives.",
        "content": """<p>A revolutionary AI system developed by researchers can now detect diseases months before symptoms appear, marking a major breakthrough in preventive healthcare.</p>

<h2>How It Works</h2>
<p>The system analyzes multiple data sources including:</p>
<ul>
  <li>Blood biomarkers</li>
  <li>Genetic information</li>
  <li>Medical imaging</li>
  <li>Lifestyle data</li>
</ul>

<h2>Clinical Trials</h2>
<p>Initial clinical trials have shown remarkable accuracy in predicting conditions like diabetes, cardiovascular disease, and certain cancers up to 6 months before conventional diagnosis methods.</p>""",
        "categoryId": 4,
        "category": "Healthcare AI",
        "authorId": 4,
        "author": "Dr. Emily Wong",
        "authorAvatar": "https://ui-avatars.com/api/?name=Emily+Wong&background=10b981&color=fff",
        "status": "published",
        "featured": True,
        "views": 11200,
        "likes": 684,
        "commentsCount": 76,
        "readTime": "7 min",
        "tags": ["Healthcare", "Medical AI", "Disease Detection"],
        "thumbnail": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop",
        "publishedAt": "2025-10-22T09:00:00Z",
        "updatedAt": "2025-10-22T09:00:00Z",
        "createdAt": "2025-10-21T14:20:00Z"
    },
    {
        "_id": 5,
        "title": "Neural Architecture Search: AutoML Goes Mainstream",
        "slug": "neural-architecture-search-automl-mainstream",
        "excerpt": "Latest advances in Neural Architecture Search make automated machine learning accessible to everyone, democratizing AI development.",
        "content": """<p>Neural Architecture Search (NAS) has evolved from a research curiosity to a practical tool that's making AI development accessible to non-experts.</p>

<h2>What is NAS?</h2>
<p>NAS automates the process of designing neural network architectures, finding optimal configurations that would take human experts months to discover.</p>

<h2>Recent Improvements</h2>
<p>New algorithms have reduced search time by 90% while improving model performance, making NAS practical for real-world applications.</p>""",
        "categoryId": 5,
        "category": "AutoML",
        "authorId": 5,
        "author": "Alex Johnson",
        "authorAvatar": "https://ui-avatars.com/api/?name=Alex+Johnson&background=f59e0b&color=fff",
        "status": "draft",
        "featured": False,
        "views": 0,
        "likes": 0,
        "commentsCount": 0,
        "readTime": "9 min",
        "tags": ["AutoML", "NAS", "Neural Networks"],
        "thumbnail": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop",
        "publishedAt": None,
        "updatedAt": "2025-10-21T13:10:00Z",
        "createdAt": "2025-10-20T10:45:00Z"
    },
    {
        "_id": 6,
        "title": "AI-Powered Climate Models Predict Weather with 95% Accuracy",
        "slug": "ai-climate-models-weather-prediction-accuracy",
        "excerpt": "New deep learning approach revolutionizes weather forecasting, offering unprecedented precision in climate prediction and extreme weather alerts.",
        "content": """<p>Deep learning models are transforming weather prediction, achieving 95% accuracy in short-term forecasts and dramatically improving long-term climate projections.</p>

<h2>The Technology</h2>
<p>The system combines multiple data sources and uses transformer-based architectures to capture complex atmospheric patterns.</p>

<h2>Real-World Impact</h2>
<p>Improved weather predictions are already helping farmers, disaster management teams, and renewable energy operators make better decisions.</p>""",
        "categoryId": 6,
        "category": "Climate Tech",
        "authorId": 6,
        "author": "Lisa Green",
        "authorAvatar": "https://ui-avatars.com/api/?name=Lisa+Green&background=06b6d4&color=fff",
        "status": "published",
        "featured": False,
        "views": 10500,
        "likes": 523,
        "commentsCount": 64,
        "readTime": "5 min",
        "tags": ["Climate", "Weather Prediction", "Deep Learning"],
        "thumbnail": "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&auto=format&fit=crop",
        "publishedAt": "2025-10-20T11:30:00Z",
        "updatedAt": "2025-10-20T11:30:00Z",
        "createdAt": "2025-10-19T15:00:00Z"
    },
    {
        "_id": 7,
        "title": "Multimodal AI: Understanding Text, Images, and Audio Together",
        "slug": "multimodal-ai-text-images-audio-understanding",
        "excerpt": "Latest models demonstrate human-like ability to process and understand multiple types of data simultaneously, opening new possibilities.",
        "content": """<p>The latest generation of multimodal AI models can seamlessly process and understand text, images, and audio in a unified framework, mimicking human-like perception.</p>

<h2>Capabilities</h2>
<p>These models can:</p>
<ul>
  <li>Understand context across different modalities</li>
  <li>Generate content in multiple formats</li>
  <li>Translate between modalities (e.g., image to text, text to audio)</li>
</ul>

<h2>Applications</h2>
<p>From accessibility tools to creative applications, multimodal AI is opening up new possibilities across industries.</p>""",
        "categoryId": 7,
        "category": "Multimodal AI",
        "authorId": 7,
        "author": "David Park",
        "authorAvatar": "https://ui-avatars.com/api/?name=David+Park&background=8b5cf6&color=fff",
        "status": "published",
        "featured": True,
        "views": 13400,
        "likes": 812,
        "commentsCount": 103,
        "readTime": "8 min",
        "tags": ["Multimodal", "Computer Vision", "NLP"],
        "thumbnail": "https://images.unsplash.com/photo-1620825937374-87fc7d6bddc2?w=800&auto=format&fit=crop",
        "publishedAt": "2025-10-19T13:45:00Z",
        "updatedAt": "2025-10-19T13:45:00Z",
        "createdAt": "2025-10-18T09:20:00Z"
    },
    {
        "_id": 8,
        "title": "Edge AI: Running Large Models on Mobile Devices",
        "slug": "edge-ai-large-models-mobile-devices",
        "excerpt": "Breakthrough in model compression allows powerful AI to run directly on smartphones without cloud connectivity, ensuring privacy and speed.",
        "content": """<p>Recent advances in model compression and optimization have made it possible to run sophisticated AI models directly on mobile devices, without requiring cloud connectivity.</p>

<h2>Technical Innovations</h2>
<p>Key techniques include:</p>
<ul>
  <li>Quantization and pruning</li>
  <li>Knowledge distillation</li>
  <li>Hardware-aware neural architecture search</li>
</ul>

<h2>Benefits</h2>
<p>Edge AI offers improved privacy, reduced latency, and independence from network connectivity.</p>""",
        "categoryId": 8,
        "category": "Edge Computing",
        "authorId": 8,
        "author": "Rachel Kim",
        "authorAvatar": "https://ui-avatars.com/api/?name=Rachel+Kim&background=ec4899&color=fff",
        "status": "published",
        "featured": False,
        "views": 9980,
        "likes": 467,
        "commentsCount": 52,
        "readTime": "6 min",
        "tags": ["Edge AI", "Mobile", "Model Compression"],
        "thumbnail": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop",
        "publishedAt": "2025-10-18T10:15:00Z",
        "updatedAt": "2025-10-18T10:15:00Z",
        "createdAt": "2025-10-17T14:30:00Z"
    },
    {
        "_id": 9,
        "title": "AI Coding Assistants: 70% Productivity Increase for Developers",
        "slug": "ai-coding-assistants-developer-productivity",
        "excerpt": "Study shows dramatic improvement in developer efficiency with AI-powered coding tools and pair programming, transforming software development.",
        "content": """<p>A comprehensive study reveals that developers using AI coding assistants experience an average 70% increase in productivity, fundamentally changing how software is built.</p>

<h2>Study Results</h2>
<p>The research tracked thousands of developers and found:</p>
<ul>
  <li>Faster code completion</li>
  <li>Reduced debugging time</li>
  <li>Better code quality</li>
  <li>Increased learning opportunities</li>
</ul>

<h2>The Future of Coding</h2>
<p>AI assistants are evolving from simple autocomplete to sophisticated pair programming partners that can understand context, suggest optimizations, and even write entire functions.</p>""",
        "categoryId": 9,
        "category": "Developer Tools",
        "authorId": 9,
        "author": "Tom Wilson",
        "authorAvatar": "https://ui-avatars.com/api/?name=Tom+Wilson&background=3b82f6&color=fff",
        "status": "published",
        "featured": True,
        "views": 14200,
        "likes": 923,
        "commentsCount": 187,
        "readTime": "7 min",
        "tags": ["AI Coding", "Developer Tools", "Productivity"],
        "thumbnail": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop",
        "publishedAt": "2025-10-17T15:00:00Z",
        "updatedAt": "2025-10-17T15:00:00Z",
        "createdAt": "2025-10-16T11:45:00Z"
    },
    {
        "_id": 10,
        "title": "Transformer Models: The Architecture That Changed Everything",
        "slug": "transformer-models-architecture-evolution",
        "excerpt": "Deep dive into transformer architecture and its revolutionary impact on AI, from NLP to computer vision and beyond.",
        "content": """<p>The transformer architecture has revolutionized AI since its introduction in 2017, becoming the foundation for most modern AI systems.</p>

<h2>Key Innovations</h2>
<p>Transformers introduced:</p>
<ul>
  <li>Self-attention mechanisms</li>
  <li>Parallel processing capabilities</li>
  <li>Scalability to massive datasets</li>
</ul>

<h2>Beyond NLP</h2>
<p>Originally designed for language tasks, transformers now power computer vision, audio processing, and even protein folding prediction.</p>""",
        "categoryId": 1,
        "category": "AI Models",
        "authorId": 1,
        "author": "John Smith",
        "authorAvatar": "https://ui-avatars.com/api/?name=John+Smith&background=3b82f6&color=fff",
        "status": "published",
        "featured": False,
        "views": 8750,
        "likes": 421,
        "commentsCount": 68,
        "readTime": "12 min",
        "tags": ["Transformers", "Deep Learning", "Architecture"],
        "thumbnail": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop",
        "publishedAt": "2025-10-16T09:30:00Z",
        "updatedAt": "2025-10-16T09:30:00Z",
        "createdAt": "2025-10-15T13:20:00Z"
    }
]

# ==================== COMMENTS DATA ====================
comments_data = [
    {
        "_id": 1,
        "articleId": 1,
        "userId": 7,
        "userName": "David Park",
        "userAvatar": "https://ui-avatars.com/api/?name=David+Park&background=8b5cf6&color=fff",
        "content": "This is incredible! GPT-5's multimodal capabilities are going to change everything.",
        "likes": 24,
        "createdAt": "2025-10-25T11:30:00Z"
    },
    {
        "_id": 2,
        "articleId": 1,
        "userId": 8,
        "userName": "Rachel Kim",
        "userAvatar": "https://ui-avatars.com/api/?name=Rachel+Kim&background=ec4899&color=fff",
        "content": "Can't wait to try this out. The reduced hallucinations feature is particularly exciting for production use cases.",
        "likes": 18,
        "createdAt": "2025-10-25T12:15:00Z"
    },
    {
        "_id": 3,
        "articleId": 2,
        "userId": 10,
        "userName": "Maria Garcia",
        "userAvatar": "https://ui-avatars.com/api/?name=Maria+Garcia&background=10b981&color=fff",
        "content": "Quantum computing + AI is the future. This is just the beginning!",
        "likes": 31,
        "createdAt": "2025-10-24T15:00:00Z"
    }
]

# ==================== MAIN FUNCTION ====================
def seed_database():
    """Insert all mock data into MongoDB"""
    
    try:
        # 1. Clear existing data (optional - comment out if you want to keep existing data)
        print("\n🗑️  Xóa dữ liệu cũ...")
        db.users.delete_many({})
        db.categories.delete_many({})
        db.articles.delete_many({})
        db.comments.delete_many({})
        print("✅ Đã xóa dữ liệu cũ")
        
        # 2. Insert Users
        print("\n👥 Đang insert Users...")
        result = db.users.insert_many(users_data)
        print(f"✅ Đã insert {len(result.inserted_ids)} users")
        
        # 3. Insert Categories
        print("\n📁 Đang insert Categories...")
        result = db.categories.insert_many(categories_data)
        print(f"✅ Đã insert {len(result.inserted_ids)} categories")
        
        # 4. Insert Articles
        print("\n📝 Đang insert Articles...")
        result = db.articles.insert_many(articles_data)
        print(f"✅ Đã insert {len(result.inserted_ids)} articles")
        
        # 5. Insert Comments
        print("\n💬 Đang insert Comments...")
        result = db.comments.insert_many(comments_data)
        print(f"✅ Đã insert {len(result.inserted_ids)} comments")
        
        # 6. Verify data
        print("\n📊 Kiểm tra dữ liệu...")
        print(f"   - Users: {db.users.count_documents({})}")
        print(f"   - Categories: {db.categories.count_documents({})}")
        print(f"   - Articles: {db.articles.count_documents({})}")
        print(f"   - Comments: {db.comments.count_documents({})}")
        
        print("\n✅ HOÀN TẤT! Database đã được seed thành công!")
        print(f"🎯 Database: {MONGODB_DB_NAME}")
        print("\n📌 Bước tiếp theo:")
        print("   1. Kiểm tra MongoDB Atlas để xem data")
        print("   2. Sửa frontend để dùng API thay vì mockData.js")
        print("   3. Test API tại: http://localhost:8000/api/docs")
        
    except Exception as e:
        print(f"\n❌ LỖI: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()
        print("\n🔌 Đã đóng kết nối MongoDB")

if __name__ == "__main__":
    seed_database()
