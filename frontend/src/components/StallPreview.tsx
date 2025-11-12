// src/components/StallPreview.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, MessageCircle, Heart } from 'lucide-react';
import { useData, Review, MenuItem } from '../contexts/DataContext'; // Import MenuItem
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from './ReviewForm';
import ReviewCard from './ReviewCard';

interface StallPreviewProps {
  stallId: string;
  currentStallStatus?: 'open' | 'closed';
}

const API_BASE_URL = 'http://localhost:8001';
const BUSINESS_PROFILE_PIC_BASE_URL = `${API_BASE_URL}/static/business/`;

// Helper function to build the full stall image URL
const getStallImageUrl = (filename: string | undefined): string => {
  if (!filename) return `${BUSINESS_PROFILE_PIC_BASE_URL}/default-placeholder.jpg`; // Fallback
  return `${BUSINESS_PROFILE_PIC_BASE_URL}${filename}`;
};

export default function StallPreview({ stallId, currentStallStatus }: StallPreviewProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // NEW STATE: For fetched menu items
  const [fetchedMenu, setFetchedMenu] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);

  // State to manage fetched reviews and loading status
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const { stalls, hawkerCenters, getReviewsByStall, favorites, addToFavorites, removeFromFavorites, addToRecentlyVisited } = useData();
  const { user } = useAuth();

  const stall = stalls.find(s => s.id == stallId);
  const hawker = stall ? hawkerCenters.find(h => h.id === stall.hawkerId) : null;
  const isFavorited = favorites.includes(stallId || '');

  console.log("Stall:", stall);

  // EFFECT 1: Fetch reviews and track recently visited
  useEffect(() => {
    if (stallId) {
      const fetchReviews = async () => {
        setReviewsLoading(true);
        try {
          // Fetch the reviews using the context function
          const data = await getReviewsByStall(stallId);
          setReviews(data);
        } catch (err) {
          console.error("Failed to fetch reviews:", err);
          setReviews([]);
        } finally {
          setReviewsLoading(false);
        }
      };
      fetchReviews();

      // Also track recently visited
      addToRecentlyVisited(stallId);
    }
    // FIX: Removed getReviewsByStall from the dependency array to prevent infinite loop.
    // It's assumed to be stable, or you should wrap it in useCallback in DataContext.
  }, [stallId, addToRecentlyVisited]);


  // EFFECT 2: Fetch menu items from the API, matching the MenuEditor logic
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!stall || !stall.license_number) {
        setMenuLoading(false);
        return;
      }

      setMenuLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/business/${stall.license_number}/menu-items`);
        if (!res.ok) throw new Error('Failed to fetch menu items');
        const data = await res.json();

        // Map API data to local MenuItem shape, ensuring price is a number
        const items: MenuItem[] = data.map((i: any) => ({
          id: i.id.toString(),
          name: i.name,
          description: i.description,
          // Use parseFloat for price, as stored in the API response
          price: parseFloat(i.price),
          image: i.photo || '' // Assuming 'photo' is the field for the image URL
        }));
        setFetchedMenu(items);
      } catch (err) {
        console.error("Failed to fetch menu items:", err);
        setFetchedMenu([]); // Reset on failure
      } finally {
        setMenuLoading(false);
      }
    };
    fetchMenuItems();
    // Trigger fetch when stall (and therefore license_number) changes
  }, [stall]);


  // MEMOIZED CALCULATION: Compute average rating and review count from the fetched reviews
  const { averageRating, reviewCount } = useMemo(() => {
    const count = reviews.length;
    const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
    // Format to 1 decimal place or show 'N/A'
    const avg = count > 0 ? (ratingSum / count).toFixed(1) : 'N/A';
    return {
      averageRating: avg,
      reviewCount: count,
    };
  }, [reviews]);


  if (!stall || !hawker) {
    return (
      <div className="py-12 text-center">
        <h3 className="text-xl font-semibold text-gray-900">Stall Not Found</h3>
        <p className="text-gray-600 mt-2">The stall you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="mt-4 inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const handleFavoriteClick = () => {
    if (!user || user.user_type !== 'consumer') return;
    if (isFavorited) removeFromFavorites(stall.id);
    else addToFavorites(stall.id);
  };

  // Use the new fetched menu items
  const allMenuItems = fetchedMenu;
  const isStallOpen = currentStallStatus === 'open';

  return (
    <div className="min-h-[60vh]">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to={`/hawker/${hawker.id}`} className="text-red-600 font-medium hover:underline">
            {hawker.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{stall.name}</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT */}
          <div className="space-y-8">
            {/* Image */}
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
              <img
                src={getStallImageUrl(stall.images[activeImageIndex])}
                alt={stall.name}
                className="w-full h-full object-cover"
              />
              {user && user.user_type === 'consumer' && (
                <button
                  onClick={handleFavoriteClick}
                  className="absolute top-3 left-3 p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
                >
                  <Heart
                    size={20}
                    className={isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-600'}
                  />
                </button>
              )}
              {stall.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {stall.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-3 h-3 rounded-full ${idx === activeImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Header - USE CALCULATED STATS */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{stall.name}</h1>
              <div className="flex items-center space-x-4 mt-1 mb-2">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  {reviewsLoading ? (
                    <span className="font-medium text-gray-500 animate-pulse">...</span>
                  ) : (
                    <span className="font-medium">{averageRating}</span>
                  )}
                  {reviewsLoading ? (
                    <span className="text-gray-500 animate-pulse">(Loading reviews)</span>
                  ) : (
                    <span className="text-gray-500">({reviewCount} reviews)</span>
                  )}
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{stall.cuisine}</span>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                {/* Update 1: Dot color */}
                <span className={`w-3 h-3 rounded-full ${isStallOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">Operating Hours:</span>
                <span className="text-gray-600">10:00 AM – 8:00 PM</span>
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${isStallOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                  {/* Update 2: Status text */}
                  {isStallOpen ? 'Open Now' : 'Closed'}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{stall.location} at {hawker.name}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 text-lg">{stall.description}</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-8">
            {/* Menu */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
                {allMenuItems.length > 3 && (
                  <span
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-red-600 underline hover:text-red-800 cursor-pointer text-sm font-medium"
                  >
                    {showMenu ? 'Hide Menu' : 'View All Menu'}
                  </span>
                )}
              </div>

              {menuLoading ? (
                <div className="text-center py-4 text-gray-600">Loading menu...</div>
              ) : allMenuItems.length > 0 ? (
                <div className="space-y-4">
                  {allMenuItems
                    // Filter to first 3 items only if showMenu is false
                    .filter((_, index) => showMenu || index < 3)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm"
                      >
                        {item.image && (
                          <img
                            src={`${API_BASE_URL}/static/menu/${item.image}`}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                            onClick={() => setEnlargedImage(`${API_BASE_URL}${item.image}`)} // ⭐️ Also fix the modal setter
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              {item.description && (
                                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                              )}
                            </div>
                            <span className="font-semibold text-gray-900 ml-4">
                              S${item.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Menu information not available</p>
                </div>
              )}
            </div>

            {/* Reviews - USE FETCHED REVIEWS */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reviews ({reviewCount})</h2>
                {user && user.user_type === 'consumer' && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Write Review</span>
                  </button>
                )}
              </div>

              {reviewsLoading ? (
                <div className="text-center py-4 text-gray-600">Loading reviews...</div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    // Note: ReviewCard is imported and used here
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal (only shows for consumer users) */}
      {
        showReviewForm && user?.user_type === 'consumer' && (
          <ReviewForm
            stallId={stall.id}
            stallName={stall.name}
            onClose={() => setShowReviewForm(false)}
          />
        )
      }

      {/* Image Modal */}
      {
        enlargedImage && (
          <div className="fixed inset-0 z-50 backdrop-blur-md" onClick={() => setEnlargedImage(null)}>
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={enlargedImage}
                alt="Enlarged menu item"
                onClick={(e) => e.stopPropagation()}
                className="max-h-[95vh] max-w-[97vw] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        )
      }
    </div>
  );
}