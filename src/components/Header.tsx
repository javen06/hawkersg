import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search, Menu, X, LogOut, Navigation } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext'; // 👈 NEW

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false); // 👈 NEW
  const { user, logout } = useAuth();
  const { searchHistory, addToSearchHistory } = useData(); // 👈 NEW
  const navigate = useNavigate();

  // Track scroll direction for hiding header
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setHidden(true); // scrolling down → hide
      } else {
        setHidden(false); // scrolling up → show
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery); // 👈 save query
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowHistory(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`bg-white shadow-sm fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold text-gray-900">HawkerSG</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-lg mx-8 relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search hawker centers or stalls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  onBlur={() => setTimeout(() => setShowHistory(false), 150)} // small delay so click works
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Recent Searches Dropdown */}
            {showHistory && searchHistory.length > 0 && (
              <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {searchHistory.slice(0, 5).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearchQuery(item);
                      navigate(`/search?q=${encodeURIComponent(item)}`);
                      setShowHistory(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/search" className="text-gray-700 hover:text-red-600 font-medium">
              Browse
            </Link>
            <Link to="/nearby" className="flex items-center space-x-1 text-gray-700 hover:text-red-600 font-medium">
              <Navigation className="h-4 w-4" />
              <span>Near Me</span>
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {user.type === 'business' ? (
                  <Link to="/business" className="text-gray-700 hover:text-red-600 font-medium">
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/profile" className="text-gray-700 hover:text-red-600 font-medium">
                    Profile
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-red-600 font-medium">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4 relative">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search hawker centers or stalls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowHistory(true)}
                onBlur={() => setTimeout(() => setShowHistory(false), 150)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Recent Searches Dropdown - Mobile */}
          {showHistory && searchHistory.length > 0 && (
            <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {searchHistory.slice(0, 5).map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSearchQuery(item);
                    navigate(`/search?q=${encodeURIComponent(item)}`);
                    setShowHistory(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-2">
            <Link to="/search" className="block py-2 text-gray-700 hover:text-red-600">
              Browse
            </Link>
            <Link to="/nearby" className="block py-2 text-gray-700 hover:text-red-600">
              Near Me
            </Link>
            {user ? (
              <>
                {user.type === 'business' ? (
                  <Link to="/business" className="block py-2 text-gray-700 hover:text-red-600">
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/profile" className="block py-2 text-gray-700 hover:text-red-600">
                    Profile
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-700 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700 hover:text-red-600">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}