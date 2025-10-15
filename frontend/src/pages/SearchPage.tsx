import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Filter } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import StallCard from '../components/StallCard';
import HawkerCenterCard from '../components/HawkerCenterCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<'hawkers' | 'stalls'>('hawkers');
  const [filters, setFilters] = useState({
    cuisine: '',
    priceRange: '',
    rating: 0,
    isOpen: false
  });

  const { hawkerCenters, stalls, addToSearchHistory, searchHistory, persistSearchHistory } = useData();

  useEffect(() => {
    const q = searchParams.get('q');
    
    // 1. Check if a query parameter exists in the URL
    if (q) {
      setQuery(q);
      addToSearchHistory(q);
    } else {
      // 2. If no 'q' parameter exists (i.e., we are likely on /browse),
      // explicitly reset the local query state to show all results.
      setQuery('');
    }
    
  }, [searchParams, addToSearchHistory]); 

  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (query.trim()) {
  //     setSearchParams({ q: query });
  //     addToSearchHistory(query);
  //     persistSearchHistory(query);
  //   }
  // };

  const filteredHawkers = hawkerCenters.filter(hawker =>
    hawker.name.toLowerCase().includes(query.toLowerCase()) ||
    hawker.address.toLowerCase().includes(query.toLowerCase())
  );

  const filteredStalls = stalls.filter(stall => {
    const matchesQuery =
      stall.name.toLowerCase().includes(query.toLowerCase()) ||
      stall.cuisine.toLowerCase().includes(query.toLowerCase()) ||
      stall.description.toLowerCase().includes(query.toLowerCase());
  
    const matchesCuisine = !filters.cuisine || stall.cuisine === filters.cuisine;
  
    // ✅ Price filter using stall.menu
    let matchesPrice = true;
    if (filters.priceRange && stall.menu && stall.menu.length > 0) {
      const prices = stall.menu.map(dish => dish.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
  
      switch (filters.priceRange) {
        case "< $3":
          matchesPrice = minPrice < 3;
          break;
        case "$3 - $5":
          matchesPrice = prices.some(p => p >= 3 && p <= 5);
          break;
        case "$6 - $10":
          matchesPrice = prices.some(p => p >= 6 && p <= 10);
          break;
        case "$11 - $15":
          matchesPrice = prices.some(p => p >= 11 && p <= 15);
          break;
        case "$15+":
          matchesPrice = maxPrice > 15;
          break;
        default:
          matchesPrice = true;
      }
    }
  
    const matchesRating = !filters.rating || stall.rating >= filters.rating;
    const matchesOpen = !filters.isOpen || stall.isOpen;
  
    return matchesQuery && matchesCuisine && matchesPrice && matchesRating && matchesOpen;
  });

  const cuisines = [...new Set(stalls.map(stall => stall.cuisine))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      {/* Search Bar */}
      <div className="mb-8">
        

        {/* Search History */}
        {searchHistory.length > 0 && !query && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(item);
                    setSearchParams({ q: item });
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-200 rounded-lg p-1 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('hawkers')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'hawkers'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Hawker Centers ({filteredHawkers.length})
        </button>
        <button
          onClick={() => setActiveTab('stalls')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'stalls'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Stalls ({filteredStalls.length})
        </button>
      </div>

      {/* Filters for Stalls */}
      {activeTab === 'stalls' && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cuisine */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
              <select
                value={filters.cuisine}
                onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Cuisines</option>
                <option value="Chinese - Cantonese">Chinese - Cantonese</option>
                <option value="Chinese - Hokkien">Chinese - Hokkien</option>
                <option value="Chinese - Teochew">Chinese - Teochew</option>
                <option value="Indian - North">Indian - North</option>
                <option value="Indian - South">Indian - South</option>
                <option value="Malay">Malay</option>
                <option value="Indonesian">Indonesian</option>
                <option value="Thai">Thai</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
                <option value="Western">Western</option>
                <option value="Fusion">Fusion</option>
                <option value="Vegetarian">Vegetarian</option>
              </select>
            </div>
            
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Any Price</option>
                <option value="< $3">&lt; $3 (Snacks / Drinks)</option>
                <option value="$3 - $5">$3 - $5 (Budget meals)</option>
                <option value="$6 - $10">$6 - $10 (Average)</option>
                <option value="$11 - $15">$11 - $15 (Premium)</option>
                <option value="$15+">$15+ (Seafood / Big dishes)</option>
              </select>
            </div>
            
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value={0}>Any Rating</option>
                <option value={2}>2.0+ (Okay)</option>
                <option value={3}>3.0+ (Good)</option>
                <option value={3.5}>3.5+ (Very Good)</option>
                <option value={4}>4.0+ (Excellent)</option>
                <option value={4.5}>4.5+ (Top Rated)</option>
                <option value={5}>5.0 (Perfect)</option>
              </select>
            </div>
            
            {/* Open now */}
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isOpen}
                  onChange={(e) => setFilters(prev => ({ ...prev, isOpen: e.target.checked }))}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">Open Now</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-6">
        {activeTab === 'hawkers' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHawkers.map(hawker => (
              <HawkerCenterCard key={hawker.id} hawker={hawker} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStalls.map(stall => (
              <StallCard key={stall.id} stall={stall} />
            ))}
          </div>
        )}

        {((activeTab === 'hawkers' && filteredHawkers.length === 0) ||
          (activeTab === 'stalls' && filteredStalls.length === 0)) && (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}