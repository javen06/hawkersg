import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Heart, Clock, Star, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import StallCard from '../components/StallCard';
import ReviewCard from '../components/ReviewCard'; // Make a component to render each review

export default function ConsumerProfilePage() {
  const [activeTab, setActiveTab] = useState<'favorites' | 'recent' | 'reviews'>('favorites');
  const [reviews, setReviews] = useState<any[]>([]);
  const { user } = useAuth();
  const { stalls, favorites, recentlyVisited, getReviewsByConsumer } = useData();
  const location = useLocation();

  const favoriteStalls = stalls.filter(stall => favorites.includes(stall.id));
  const recentStalls = stalls.filter(stall => recentlyVisited.includes(stall.id))
    .sort((a, b) => recentlyVisited.indexOf(a.id) - recentlyVisited.indexOf(b.id));

  // Fetch reviews for this consumer
  useEffect(() => {
    if (user && getReviewsByConsumer) {
      getReviewsByConsumer(user.id).then(setReviews);
    }
  }, [user, getReviewsByConsumer]);

  if (!user || user.user_type !== 'consumer') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 mt-2">Please log in as a consumer to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Profile Header & Stats (unchanged) */}
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <Heart className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{favorites.length}</div>
          <div className="text-gray-600">Favorite Stalls</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <Clock className="h-8 w-8 text-orange-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{recentlyVisited.length}</div>
          <div className="text-gray-600">Recently Visited</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <Star className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{reviews.length}</div>
          <div className="text-gray-600">Reviews Written</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-200 rounded-lg p-1 max-w-lg">
        <button onClick={() => setActiveTab('favorites')} className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${activeTab === 'favorites' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Favorites ({favorites.length})</button>
        <button onClick={() => setActiveTab('recent')} className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${activeTab === 'recent' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Recent ({recentlyVisited.length})</button>
        <button onClick={() => setActiveTab('reviews')} className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${activeTab === 'reviews' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Reviews ({reviews.length})</button>
      </div>

      {/* Tab Content */}
      {activeTab === 'favorites' && (
        <div>
          {favoriteStalls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteStalls.map(stall => <StallCard key={stall.id} stall={stall} />)}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Favorites Yet</h3>
              <p className="text-gray-600 mb-6">Start exploring hawker centers and save your favorite stalls</p>
              <Link to="/search" className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Discover Stalls</Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'recent' && (
        <div>
          {recentStalls.length > 0 ? (
            <div className="space-y-6">
              {recentStalls.slice(0, 6).map(stall => <StallCard key={stall.id} stall={stall} />)}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Recent Visits</h3>
              <p className="text-gray-600 mb-6">Visit some stalls to see them here</p>
              <Link to="/search" className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Discover Stalls</Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600 mb-6">Reviews you’ve written will appear here.</p>
              <Link to="/search" className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Explore Stalls</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
