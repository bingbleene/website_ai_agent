import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Eye, Calendar, Share2, Bookmark, TrendingUp, User, ThumbsUp, MessageCircle, Send } from 'lucide-react';
import { articlesAPI } from '../services/api';
import Chatbot from '../components/public/Chatbot';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [originalArticle, setOriginalArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState('vi');
  const [translationsCache, setTranslationsCache] = useState({});

  // Prepare article HTML: move outside useEffect so we can reuse for translations
  const prepareArticleHtml = (rawHtml) => {
    try {
      if (!rawHtml) return '';
      // Convert lightweight markdown headings (#, ##, ###) to HTML headings
      let normalized = rawHtml;
      normalized = normalized.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
      normalized = normalized.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
      normalized = normalized.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

      const parser = new DOMParser();
      const doc = parser.parseFromString(normalized, 'text/html');

      // If the content looks like plain text (contains newline blocks) convert to structured HTML
      const bodyText = doc.body.textContent || '';
      if (!/<[a-z][\s\S]*>/i.test(normalized) && /\n/.test(bodyText)) {
        const blocks = normalized.split(/\n{2,}/g).map(b => b.trim()).filter(Boolean);
        const container2 = document.createElement('div');
        // helper to replace bold markers
        const replaceBoldInTextNodes = (parent) => {
          const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null, false);
          const textNodes = [];
          let node;
          while (node = walker.nextNode()) {
            textNodes.push(node);
          }
          const boldRegex = /\*\*(.+?)\*\*/g;
          textNodes.forEach(tn => {
            const txt = tn.nodeValue;
            if (!txt) return;
            if (!boldRegex.test(txt)) return;
            let lastIndex = 0;
            const frag = document.createDocumentFragment();
            boldRegex.lastIndex = 0;
            let m;
            while ((m = boldRegex.exec(txt)) !== null) {
              const before = txt.slice(lastIndex, m.index);
              if (before) frag.appendChild(document.createTextNode(before));
              const strong = document.createElement('strong');
              strong.textContent = m[1];
              frag.appendChild(strong);
              lastIndex = m.index + m[0].length;
            }
            const rest = txt.slice(lastIndex);
            if (rest) frag.appendChild(document.createTextNode(rest));
            tn.parentNode.replaceChild(frag, tn);
          });
        };

        blocks.forEach(block => {
          const numMatch = block.match(/^\s*(\d+)\.\s*(\s*[\s\S]*)$/s);
          if (numMatch) {
            const marker = document.createElement('div');
            marker.className = 'section-marker';
            marker.textContent = numMatch[1] + '.';
            const p = document.createElement('p');
            const inner = numMatch[2].trim().replace(/\n/g, '<br/>');
            p.innerHTML = inner;
            const section = document.createElement('section');
            section.className = 'article-section';
            section.appendChild(marker);
            section.appendChild(p);
            container2.appendChild(section);
            return;
          }

          const lines = block.split(/\n+/).map(l => l.trim()).filter(Boolean);
          const isList = lines.every(l => /^[-*]\s+/.test(l));
          if (isList) {
            const ul = document.createElement('ul');
            lines.forEach(l => {
              const li = document.createElement('li');
              li.innerHTML = l.replace(/^[-*]\s+/, '');
              ul.appendChild(li);
            });
            const section = document.createElement('section');
            section.className = 'article-section';
            section.appendChild(ul);
            container2.appendChild(section);
            return;
          }

          const p = document.createElement('p');
          p.innerHTML = block.replace(/\n/g, '<br/>');
          const section = document.createElement('section');
          section.className = 'article-section';
          section.appendChild(p);
          container2.appendChild(section);
        });
        replaceBoldInTextNodes(container2);
        return container2.innerHTML;
      }

      // Recursively replace **bold** markers inside text nodes
      const replaceBoldInTextNodes = (parent) => {
        const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
          textNodes.push(node);
        }
        const boldRegex = /\*\*(.+?)\*\*/g;
        textNodes.forEach(tn => {
          const txt = tn.nodeValue;
          if (!txt) return;
          if (!boldRegex.test(txt)) return;
          let lastIndex = 0;
          const frag = document.createDocumentFragment();
          boldRegex.lastIndex = 0;
          let m;
          while ((m = boldRegex.exec(txt)) !== null) {
            const before = txt.slice(lastIndex, m.index);
            if (before) frag.appendChild(document.createTextNode(before));
            const strong = document.createElement('strong');
            strong.textContent = m[1];
            frag.appendChild(strong);
            lastIndex = m.index + m[0].length;
          }
          const rest = txt.slice(lastIndex);
          if (rest) frag.appendChild(document.createTextNode(rest));
          tn.parentNode.replaceChild(frag, tn);
        });
      };

      // Wrap each top-level block into a section.article-section and support markers
      const container = document.createElement('div');
      const children = Array.from(doc.body.childNodes);

      const extractMarker = (text) => {
        if (!text) return null;
        const c = text.match(/^<!--\s*class:\s*([a-zA-Z0-9_-]+)\s*-->\s*/i);
        if (c) return { name: c[1], rest: text.replace(/^<!--\s*class:\s*([a-zA-Z0-9_-]+)\s*-->\s*/i, '') };
        const t = text.match(/^:::\s*([a-zA-Z0-9_-]+)\s*/);
        if (t) return { name: t[1], rest: text.replace(/^:::\s*([a-zA-Z0-9_-]+)\s*/, '') };
        const b = text.match(/^\[\[\s*([a-zA-Z0-9_-]+)\s*\]\]\s*/);
        if (b) return { name: b[1], rest: text.replace(/^\[\[\s*([a-zA-Z0-9_-]+)\s*\]\]\s*/, '') };
        return null;
      };

      children.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE && !/\S/.test(child.nodeValue || '')) return;
        let markerName = null;
        if (child.nodeType === Node.TEXT_NODE) {
          const em = extractMarker(child.nodeValue);
          if (em) {
            markerName = em.name;
            child = document.createTextNode(em.rest);
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const html = child.innerHTML || '';
          const text = child.textContent || '';
          const emHtml = extractMarker(html);
          const emText = extractMarker(text);
          if (emHtml) {
            markerName = emHtml.name;
            const clone = child.cloneNode(true);
            clone.innerHTML = clone.innerHTML.replace(/^<!--\s*class:\s*([a-zA-Z0-9_-]+)\s*-->\s*/i, '');
            child = clone;
          } else if (emText) {
            markerName = emText.name;
            const clone = child.cloneNode(true);
            clone.innerHTML = clone.innerHTML.replace(/^:::\s*([a-zA-Z0-9_-]+)\s*/,'').replace(/^\[\[\s*([a-zA-Z0-9_-]+)\s*\]\]\s*/, '');
            child = clone;
          }
        }

        const section = document.createElement('section');
        section.className = 'article-section';
        if (markerName) section.classList.add(markerName);

        if (child.nodeType === Node.TEXT_NODE) {
          const p = document.createElement('p');
          p.textContent = child.nodeValue;
          section.appendChild(p);
        } else {
          section.appendChild(child.cloneNode(true));
        }

        try {
          const firstEl = section.firstElementChild || section.firstChild;
          if (firstEl) {
            const text = firstEl.textContent || '';
            const m = text.match(/^\s*(\d+)\.\s*(.*)$/s);
            if (m) {
              const num = m[1];
              const marker = document.createElement('div');
              marker.className = 'section-marker';
              marker.textContent = num + '.';
              if (firstEl.nodeType === Node.TEXT_NODE) {
                const restHtml = m[2] || '';
                const p = document.createElement('p');
                p.innerHTML = restHtml;
                section.replaceChild(p, firstEl);
                section.insertBefore(marker, p);
              } else if (firstEl.nodeType === Node.ELEMENT_NODE) {
                const cloned = firstEl.cloneNode(true);
                cloned.innerHTML = cloned.innerHTML.replace(/^\s*\d+\.\s*/,'');
                section.replaceChild(cloned, firstEl);
                section.insertBefore(marker, cloned);
              }
            }
          }
        } catch (err) {
          // ignore
        }

        replaceBoldInTextNodes(section);
        container.appendChild(section);
      });
      return container.innerHTML;
    } catch (e) {
      return (rawHtml || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    }
  };

  // Try to extract a title from translated content (e.g., first <h1> or first line starting with #)
  const extractFirstHeading = (content) => {
    if (!content) return null;
    try {
      // If content seems like HTML, parse and look for h1/h2
      if (/</.test(content)) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const h1 = doc.querySelector('h1');
        if (h1 && h1.textContent.trim()) return h1.textContent.trim();
        const h2 = doc.querySelector('h2');
        if (h2 && h2.textContent.trim()) return h2.textContent.trim();
        // fallback: first paragraph text
        const p = doc.querySelector('p');
        if (p && p.textContent.trim()) return p.textContent.trim().slice(0, 200);
      }

      // If plain text, look for a leading '# ' heading or first non-empty line
      const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (!lines.length) return null;
      const first = lines[0];
      const md = first.replace(/^#+\s*/, '');
      return md || first;
    } catch (e) {
      return null;
    }
  };

  // Generic language change handler: fetch translation (or use cache) and update article.title/content/excerpt
  const handleLanguageChange = async (lang) => {
    if (!article && !originalArticle) return;
    if (lang === 'vi') {
      setCurrentLang('vi');
      if (originalArticle) {
        setArticle(originalArticle);
      } else {
        // fallback: refetch the article from server
        try {
          setLoading(true);
          const res = await articlesAPI.getPublishedById(id);
          const found = res.data;
          const mapped = {
            id: found._id,
            title: found.title,
            excerpt: found.excerpt || found.summary || '',
            content: prepareArticleHtml(found.content || ''),
            category: found.category,
            categoryId: 1,
            thumbnail: found.featured_image || found.thumbnail || 'https://via.placeholder.com/800x400?text=No+Image',
            views: found.view_count || 0,
            likes: found.like_count || 0,
            commentsCount: found.comment_count || 0,
            readTime: `${Math.ceil((found.content?.length || 0) / 1000)} min read`,
            publishedAt: found.published_at || found.publishedAt,
            author: found.author_name || 'Anonymous',
            authorAvatar: 'https://ui-avatars.com/api/?name=' + (found.author_name || 'Anonymous').replace(' ', '+')
          };
          setArticle(mapped);
          setOriginalArticle(mapped);
        } catch (e) {
          console.error('Failed to refetch original article', e);
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    // If cached translated version exists, use it
    if (translationsCache[lang]) {
      setArticle(translationsCache[lang]);
      setCurrentLang(lang);
      return;
    }

    // Otherwise, request translation from backend
    try {
      setTranslateLoading(true);
      const res = await articlesAPI.translatePublic(id, lang);
      const tr = res.data || {};
      const translatedContent = tr.translated_content || tr.translatedContent || tr.content || tr.translated_text || '';
      let translatedTitle = tr.translated_title || tr.translatedTitle || tr.title || '';
      if (!translatedTitle) {
        const h = extractFirstHeading(translatedContent);
        if (h) translatedTitle = h;
      }
      if (!translatedTitle) translatedTitle = originalArticle?.title || article?.title || '';
      const translatedExcerpt = tr.translated_summary || tr.translatedSummary || tr.excerpt || originalArticle?.excerpt || article?.excerpt || '';

      const mapped = {
        ... (originalArticle || article || {}),
        title: translatedTitle,
        excerpt: translatedExcerpt,
        content: prepareArticleHtml(translatedContent)
      };

      setArticle(mapped);
      setTranslationsCache(prev => ({ ...prev, [lang]: mapped }));
      setCurrentLang(lang);
    } catch (e) {
      console.error('Translation fetch failed', e);
      alert('Failed to load translation.');
    } finally {
      setTranslateLoading(false);
    }
  };
  
  // Fetch article from backend
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        // Get public article by id (no auth)
        const res = await articlesAPI.getPublishedById(id);
        const foundArticle = res.data;

        // Map fields returned by public endpoint
        const mapped = {
          id: foundArticle._id,
          title: foundArticle.title,
          excerpt: foundArticle.excerpt || foundArticle.summary || '',
          content: prepareArticleHtml(foundArticle.content || ''),
          category: foundArticle.category,
          categoryId: 1,
          thumbnail: foundArticle.featured_image || foundArticle.thumbnail || 'https://via.placeholder.com/800x400?text=No+Image',
          views: foundArticle.view_count || 0,
          likes: foundArticle.like_count || 0,
          commentsCount: foundArticle.comment_count || 0,
          readTime: `${Math.ceil((foundArticle.content?.length || 0) / 1000)} min read`,
          publishedAt: foundArticle.published_at || foundArticle.publishedAt,
          author: foundArticle.author_name || 'Anonymous',
          authorAvatar: 'https://ui-avatars.com/api/?name=' + (foundArticle.author_name || 'Anonymous').replace(' ', '+')
        };

        setArticle(mapped);
        setOriginalArticle(mapped);

        // Fetch related articles (same category)
        try {
          const relatedRes = await articlesAPI.getPublished({ limit: 10 });
          const allArticles = relatedRes.data || [];
          const related = allArticles
            .filter(a => a.category === foundArticle.category && a._id !== id)
            .slice(0, 2)
            .map(a => ({
              id: a._id,
              title: a.title,
              thumbnail: a.featured_image || a.thumbnail,
              category: a.category,
              views: a.view_count || 0,
              readTime: `${Math.ceil((a.content?.length || 0) / 1000)} min read`,
              excerpt: a.excerpt || a.summary || ''
            }));
          setRelatedArticles(related);
        } catch (e) {
          console.warn('⚠️ Could not fetch related articles', e);
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching article:', error);
        setLoading(false);
        setArticle(null);
      }
    };

    fetchArticle();
  }, [id]);
  
  // Comments state
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'David Park',
      avatar: 'https://ui-avatars.com/api/?name=David+Park&background=8b5cf6&color=fff',
      date: '2025-10-26T15:30:00Z',
      content: 'Great article! The insights on GPT-5 are fascinating. I especially loved the section about multimodal capabilities.',
      likes: 24
    },
    {
      id: 2,
      author: 'Rachel Kim',
      avatar: 'https://ui-avatars.com/api/?name=Rachel+Kim&background=ec4899&color=fff',
      date: '2025-10-26T18:45:00Z',
      content: 'This is exactly what I was looking for. The performance benchmarks are impressive!',
      likes: 15
    },
    {
      id: 3,
      author: 'Tom Wilson',
      avatar: 'https://ui-avatars.com/api/?name=Tom+Wilson&background=3b82f6&color=fff',
      date: '2025-10-27T09:20:00Z',
      content: 'Looking forward to testing GPT-5 in our production environment. Thanks for the detailed analysis!',
      likes: 8
    }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        author: 'You',
        avatar: 'https://ui-avatars.com/api/?name=You&background=10b981&color=fff',
        date: new Date().toISOString(),
        content: newComment,
        likes: 0
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h1 style={{ fontSize: '48px', color: '#9ca3af' }}>404</h1>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>Article not found</p>
        <button
          onClick={() => navigate('/articles')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Back to Articles
        </button>
      </div>
    );
  }

  console.log('relatedArticles:', relatedArticles);
  relatedArticles.forEach((related, index) => {
    console.log(`related[${index}].excerpt:`, related?.excerpt);
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1.5rem 1rem'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/articles')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: '#3b82f6',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft size={16} />
            Back to Articles
          </button>
        </div>
      </div>

      {/* Article Content */}
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem' }}>
        {/* Meta Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <span style={{
            padding: '0.5rem 1rem',
            background: '#eff6ff',
            color: '#3b82f6',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600
          }}>
            {article.category}
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <Calendar size={14} />
            {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <Clock size={14} />
            {article.readTime} read
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <Eye size={14} />
            {article.views.toLocaleString()} views
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: '2rem',
          color: '#111827'
        }}>
          {article.title}
        </h1>

        {/* Language selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => handleLanguageChange('vi')}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: currentLang === 'vi' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              background: currentLang === 'vi' ? '#eff6ff' : 'white',
              cursor: 'pointer'
            }}
          >
            TIẾNG VIỆT
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            disabled={translateLoading}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: currentLang === 'en' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              background: currentLang === 'en' ? '#eff6ff' : 'white',
              cursor: translateLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {translateLoading ? 'Loading…' : 'ENGLISH'}
          </button>
        </div>

        {/* Author Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          background: 'white',
          borderRadius: '16px',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={article.authorAvatar}
              alt={article.author}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%'
              }}
            />
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '0.25rem'
              }}>
                {article.author}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                AI Technology Writer
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => alert('Share feature coming soon!')}
              style={{
                width: '40px',
                height: '40px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Share2 size={18} color="#374151" />
            </button>
            <button
              onClick={() => alert('Bookmark feature coming soon!')}
              style={{
                width: '40px',
                height: '40px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Bookmark size={18} color="#374151" />
            </button>
            <button
              onClick={() => alert(`You liked this article!`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0 1rem',
                height: '40px',
                background: '#eff6ff',
                color: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ThumbsUp size={18} />
              {article.likes}
            </button>
          </div>
        </div>

        {/* Featured Image */}
        <img
          src={article.thumbnail}
          alt="Featured"
          style={{
            width: '100%',
            height: '400px',
            objectFit: 'cover',
            borderRadius: '16px',
            marginBottom: '3rem'
          }}
          onError={e => { e.target.src = 'https://via.placeholder.com/800x400?text=No+Image'; }}
        />

        {/* Article Body */}
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Related Articles */}
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '1.5rem',
            color: '#111827'
          }}>
            Related Articles
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem'
          }}>
            {relatedArticles
              .filter((related) => {
                const isValid = related && typeof related.excerpt === 'string';
                if (!isValid) {
                  console.warn('⚠️ Invalid related article:', related);
                }
                return isValid;
              })
              .map((related) => {
                const rel = related || {};
                const excerptText = rel.excerpt.substring(0, 100);
                return (
                  <div
                    key={rel.id}
                    onClick={() => navigate(`/article/${rel.id}`)}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{
                      height: '150px',
                      background: `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})`
                    }} />
                    <div style={{ padding: '1.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: '#eff6ff',
                        color: '#3b82f6',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {rel.category}
                      </span>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        margin: '1rem 0',
                        color: '#111827'
                      }}>
                        {rel.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        lineHeight: 1.5
                      }}>
                        {excerptText}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Comments Section */}
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '1.5rem',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <MessageCircle size={28} />
            Comments ({comments.length})
          </h2>

          {/* Add Comment Form */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this article..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '1rem'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: newComment.trim() ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#e5e7eb',
                  color: newComment.trim() ? 'white' : '#9ca3af',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
              >
                <Send size={16} />
                Post Comment
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <img
                    src={comment.avatar}
                    alt={comment.author}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: '#111827'
                        }}>
                          {comment.author}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#6b7280'
                        }}>
                          {new Date(comment.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = comments.map(c =>
                            c.id === comment.id ? { ...c, likes: c.likes + 1 } : c
                          );
                          setComments(updated);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#6b7280',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#e5e7eb';
                          e.currentTarget.style.color = '#3b82f6';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#f3f4f6';
                          e.currentTarget.style.color = '#6b7280';
                        }}
                      >
                        <ThumbsUp size={14} />
                        {comment.likes}
                      </button>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#374151',
                      lineHeight: 1.6
                    }}>
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>

      {/* AI Chatbot */}
      <Chatbot articleTitle={article?.title} articleExcerpt={article?.excerpt} />
    </div>
  );
}
