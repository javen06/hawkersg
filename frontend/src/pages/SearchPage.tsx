import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import StallCard from '../components/StallCard';
import HawkerCenterCard from '../components/HawkerCenterCard';

interface Hawker {
  id: number;
  name: string;
  address: string;
  image: string;
  latitude: number;
  longitude: number;
  description: string;
  rating: number;
}

interface Stall {
  id: number;
  name: string;
  cuisine: string;
  description: string;
  menu: { name: string; price: number }[];
  rating: number;
  isOpen: boolean;
  license_name?: string;
}

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
  const [visibleCount, setVisibleCount] = useState(30);

  // Replace context with API fetch
  const [hawkerCenters, setHawkerCenters] = useState<Hawker[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);

  useEffect(() => {
    fetch('/api/hawkers/')
      .then(res => res.json())
      .then((data: Hawker[]) => setHawkerCenters(data))
      .catch(console.error);

    fetch('/api/stalls/')
      .then(res => res.json())
      .then((data: Stall[]) => setStalls(data))
      .catch(console.error);
  }, []);

  // Update query if URL changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
    else setQuery('');
  }, [searchParams]);

  // 🔍 FILTER LOGIC
  const filteredHawkers = hawkerCenters.filter(
    (hawker) =>
      hawker.name.toLowerCase().includes(query.toLowerCase()) ||
      hawker.address.toLowerCase().includes(query.toLowerCase())
  );

  const validStalls = stalls.filter((stall) => {
    const hasValidName =
      stall?.name &&
      typeof stall.name === 'string' &&
      stall.name.trim() !== '' &&
      stall.name.toLowerCase() !== 'null' &&
      stall.name.toLowerCase() !== 'undefined';

    const looksLikeOwnerName =
      stall?.license_name &&
      !hasValidName &&
      /^[A-Z\s\(\)]+$/.test(stall.license_name);

    return hasValidName && !looksLikeOwnerName;
  });

  const filteredStalls = validStalls.filter((stall) => {
    const matchesQuery =
      stall.name.toLowerCase().includes(query.toLowerCase()) ||
      stall.cuisine.toLowerCase().includes(query.toLowerCase()) ||
      stall.description.toLowerCase().includes(query.toLowerCase());

    const matchesCuisine = !filters.cuisine || stall.cuisine === filters.cuisine;

    let matchesPrice = true;
    if (filters.priceRange && stall.menu && stall.menu.length > 0) {
      const prices = stall.menu.map((dish) => dish.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      switch (filters.priceRange) {
        case '< $3':
          matchesPrice = minPrice < 3;
          break;
        case '$3 - $5':
          matchesPrice = prices.some((p) => p >= 3 && p <= 5);
          break;
        case '$6 - $10':
          matchesPrice = prices.some((p) => p >= 6 && p <= 10);
          break;
        case '$11 - $15':
          matchesPrice = prices.some((p) => p >= 11 && p <= 15);
          break;
        case '$15+':
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

  useEffect(() => {
    setVisibleCount(30);
  }, [filters, query, activeTab]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 30);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 mt-10">
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-200 rounded-lg p-1 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('hawkers')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'hawkers' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Hawker Centers ({filteredHawkers.length})
        </button>
        <button
          onClick={() => setActiveTab('stalls')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'stalls' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Stalls ({filteredStalls.length})
        </button>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {activeTab === 'hawkers' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHawkers.map((hawker) => (
              <HawkerCenterCard key={hawker.id} hawker={hawker} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStalls.slice(0, visibleCount).map((stall) => (
                <StallCard key={stall.id} stall={stall} />
              ))}
            </div>
            {visibleCount < filteredStalls.length && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
                >
                  Load More ({filteredStalls.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}

        {/* No results */}
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
