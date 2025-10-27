import { Sparkles, TrendingUp, Clock, Eye, ArrowRight, Zap, Brain, Rocket } from 'lucide-react';

export default function Home() {
  // Mock featured article
  const featuredArticle = {
    id: 1,
    title: "The Future of AI: Breaking New Grounds in 2025",
    excerpt: "Discover how artificial intelligence is revolutionizing industries and reshaping our daily lives with unprecedented innovations.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    category: "AI & Technology",
    date: "2025-10-27",
    views: "12.5K",
    readTime: "5 min read"
  };

  // Mock recent articles
  const recentArticles = [
    {
      id: 2,
      title: "Machine Learning Advances in Healthcare",
      excerpt: "How ML algorithms are transforming medical diagnostics and patient care.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop",
      category: "Healthcare",
      date: "2025-10-26",
      views: "8.2K",
      readTime: "4 min"
    },
    {
      id: 3,
      title: "Neural Networks: Understanding Deep Learning",
      excerpt: "A comprehensive guide to neural network architectures and applications.",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=250&fit=crop",
      category: "Technology",
      date: "2025-10-25",
      views: "6.7K",
      readTime: "6 min"
    },
    {
      id: 4,
      title: "AI Ethics: Building Responsible Systems",
      excerpt: "Exploring the ethical considerations in AI development and deployment.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop",
      category: "Ethics",
      date: "2025-10-24",
      views: "5.3K",
      readTime: "7 min"
    },
    {
      id: 5,
      title: "Quantum Computing Meets AI",
      excerpt: "The convergence of quantum computing and artificial intelligence opens new possibilities.",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop",
      category: "Innovation",
      date: "2025-10-23",
      views: "9.1K",
      readTime: "8 min"
    },
    {
      id: 6,
      title: "Natural Language Processing in 2025",
      excerpt: "Latest breakthroughs in NLP and their impact on human-computer interaction.",
      image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=250&fit=crop",
      category: "NLP",
      date: "2025-10-22",
      views: "7.8K",
      readTime: "5 min"
    },
    {
      id: 7,
      title: "AI in Climate Change Solutions",
      excerpt: "How artificial intelligence is helping us combat climate change.",
      image: "https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=400&h=250&fit=crop",
      category: "Environment",
      date: "2025-10-21",
      views: "4.9K",
      readTime: "6 min"
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">AI-Powered News Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Stay Ahead with<br />
              <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                AI-Curated News
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Discover the latest insights in artificial intelligence, machine learning,
              and technology. Curated by advanced AI for maximum relevance.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition">
                Explore Articles
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition">
                Learn More
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <div className="text-3xl font-bold mb-1">1000+</div>
                <div className="text-sm text-blue-100">Articles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <div className="text-3xl font-bold mb-1">50+</div>
                <div className="text-sm text-blue-100">Topics</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm text-blue-100">Updated</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Curation</h3>
              <p className="text-gray-600 leading-relaxed">
                Our advanced AI algorithms curate the most relevant and impactful news for you.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Deep insights and analysis powered by cutting-edge machine learning models.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Updates</h3>
              <p className="text-gray-600 leading-relaxed">
                Stay updated with the latest developments in AI and technology as they happen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">Featured Story</h2>
          </div>
          
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition group cursor-pointer">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto overflow-hidden">
                <img 
                  src={featuredArticle.image} 
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                    {featuredArticle.category}
                  </span>
                </div>
              </div>
              
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition">
                  {featuredArticle.title}
                </h3>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {featuredArticle.readTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {featuredArticle.views}
                  </div>
                  <div>{new Date(featuredArticle.date).toLocaleDateString()}</div>
                </div>
                
                <button className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
                  Read Full Article
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Articles Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
            <button className="flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
              View All
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentArticles.map(article => (
              <div key={article.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden group cursor-pointer">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-full">
                      {article.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views}
                      </div>
                    </div>
                    <div>{new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Sparkles className="w-12 h-12 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Explore More?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of readers staying ahead with AI-powered news curation.
            </p>
            <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition">
              Get Started Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
