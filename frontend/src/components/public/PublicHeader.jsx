import { Link } from 'react-router-dom';
import { Search, Menu, X, Sparkles, TrendingUp, BookOpen, Info } from 'lucide-react';
import { useState } from 'react';

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI News
              </div>
              <div className="text-xs text-gray-500 -mt-1">Powered by AI</div>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
            >
              <TrendingUp className="w-4 h-4" />
              Home
            </Link>
            <Link 
              to="/articles" 
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Articles
            </Link>
            <Link 
              to="/about" 
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
            >
              <Info className="w-4 h-4" />
              About
            </Link>
          </nav>
          
          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Login Button */}
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:scale-105 transition font-semibold"
            >
              Login
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 hover:bg-gray-100 rounded-lg transition"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-gray-100 animate-fadeIn">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fadeIn">
            <nav className="flex flex-col gap-2">
              <Link 
                to="/" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <TrendingUp className="w-5 h-5" />
                Home
              </Link>
              <Link 
                to="/articles" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="w-5 h-5" />
                Articles
              </Link>
              <Link 
                to="/about" 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Info className="w-5 h-5" />
                About
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
