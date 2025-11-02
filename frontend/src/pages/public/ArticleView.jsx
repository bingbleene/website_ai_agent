export default function ArticleView() {
  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Article Title</h1>
        <div className="text-gray-600 mb-8">
          <span>Published on October 27, 2025</span>
        </div>
        <div className="prose max-w-none">
          <p className="text-gray-700">Article content will appear here...</p>
        </div>
      </article>
    </div>
  );
}
