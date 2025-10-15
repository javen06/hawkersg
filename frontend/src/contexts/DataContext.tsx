import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API_BASE_URL = 'http://localhost:8001';

export interface HawkerCenter {
  id: string;
  name: string;
  address: string;
  description: string;
  image: string;
  rating: number;
  stallCount: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface Stall {
  id: string;
  hawkerId: string;
  name: string;
  description: string;
  cuisine: string;
  location: string;
  images: string[];
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$';
  isOpen: boolean;
  menu: MenuItem[];
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
}

export interface Review {
  id: string;
  stallId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

interface DataContextType {
  hawkerCenters: HawkerCenter[];
  stalls: Stall[];
  reviews: Review[];
  favorites: string[];
  searchHistory: string[];
  recentlyVisited: string[];
  getStallsByHawker: (hawkerId: string) => Stall[];
  getReviewsByStall: (stallId: string) => Review[];
  addToFavorites: (stallId: string) => void;
  removeFromFavorites: (stallId: string) => void;
  addToSearchHistory: (query: string) => void;
  addToRecentlyVisited: (stallId: string) => void;
  persistSearchHistory: (query: string) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);


const mockHawkerCenters: HawkerCenter[] = [
  {
    id: 'hc1',
    name: 'Maxwell Food Centre',
    address: '1 Kadayanallur Street, Singapore 069184',
    description: 'One of Singapore\'s most famous hawker centers, known for its Hainanese chicken rice and laksa.',
    image: '/maxwell.jpg',
    rating: 4.5,
    stallCount: 85,
    coordinates: { lat: 1.2805, lng: 103.8431 }
  },
  {
    id: 'hc2',
    name: 'Tiong Bahru Market',
    address: '30 Seng Poh Road, Singapore 168898',
    description: 'A heritage hawker center in the heart of Tiong Bahru, famous for its traditional breakfast items.',
    image: '/tiongbahru.jpg',
    rating: 4.3,
    stallCount: 62,
    coordinates: { lat: 1.2866, lng: 103.8279 }
  },
  {
    id: 'hc3',
    name: 'Lau Pa Sat',
    address: '18 Raffles Quay, Singapore 048582',
    description: 'Historic Victorian-era market building serving diverse local and international cuisines.',
    image: '/laupasat.jpg',
    rating: 4.2,
    stallCount: 45,
    coordinates: { lat: 1.2805, lng: 103.8508 }
  },
  {
    id: 'hc4',
    name: 'Newton Food Centre',
    address: '500 Clemenceau Avenue North, Singapore 229495',
    description: 'Popular tourist destination known for its seafood and barbecue stingray.',
    image: '/newton.jpg',
    rating: 4.1,
    stallCount: 78,
    coordinates: { lat: 1.3048, lng: 103.8318 }
  },

  {
    id: 'hc5',
    name: 'Old Airport Road Food Centre',
    address: '51 Old Airport Road, Singapore 390051',
    description:
      'One of the largest hawker centers, known for char kway teow, satay, and heritage dishes.',
    image: '/oldairport.jpg',
    rating: 4.6,
    stallCount: 150,
    coordinates: { lat: 1.3081, lng: 103.8837 },
  },

  {
    id: 'hc6',
    name: 'Amoy Street Food Centre',
    address: '7 Maxwell Road, Singapore 069111',
    description:
      'CBD lunch hotspot famous for noodles, rice bowls, and affordable local eats.',
    image: '/amoy.jpg',
    rating: 4.4,
    stallCount: 100,
    coordinates: { lat: 1.2789, lng: 103.8476 },
  },

  {
    id: 'hc7',
    name: 'Tekka Centre',
    address: '665 Buffalo Road, Singapore 210665',
    description:
      'Diverse hawker centre with Indian, Malay, and Chinese food in vibrant Little India.',
    image: '/tekka.jpg',
    rating: 4.5,
    stallCount: 120,
    coordinates: { lat: 1.3075, lng: 103.8501 },
  },

  {
    id: 'hc8',
    name: 'Golden Mile Food Centre',
    address: '505 Beach Road, Singapore 199583',
    description:
      'Underground hawker with famous army stew, char kway teow, and local delights.',
    image: '/goldenmile.jpg',
    rating: 4.2,
    stallCount: 60,
    coordinates: { lat: 1.3020, lng: 103.8623 },
  }

];

const mockStalls: Stall[] = [
  {
    id: 'stall1',
    hawkerId: 'hc1',
    name: 'Tian Tian Hainanese Chicken Rice',
    description: 'Famous for tender chicken and fragrant rice, a Maxwell Food Centre institution.',
    cuisine: 'Chinese',
    location: 'Stall #01-10',
    images: [
      '/tiantian.jpg'
    ],
    rating: 4.6,
    reviewCount: 1250,
    priceRange: '$',
    isOpen: true,
    menu: [
      {
        id: 'menu1',
        name: 'Hainanese Chicken Rice',
        description: 'Tender steamed chicken with fragrant rice',
        price: 4.50,
        image: 'https://images.pexels.com/photos/5922220/pexels-photo-5922220.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        id: 'menu2',
        name: 'Roasted Chicken Rice',
        description: 'Crispy roasted chicken with rice',
        price: 5.00,
        image: 'https://images.pexels.com/photos/5922242/pexels-photo-5922242.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    operatingHours: {
      monday: { open: '10:00', close: '20:00', closed: false },
      tuesday: { open: '10:00', close: '20:00', closed: false },
      wednesday: { open: '10:00', close: '20:00', closed: false },
      thursday: { open: '10:00', close: '20:00', closed: false },
      friday: { open: '10:00', close: '20:00', closed: false },
      saturday: { open: '10:00', close: '20:00', closed: false },
      sunday: { open: '10:00', close: '20:00', closed: true }
    }
  },
  {
    id: 'stall2',
    hawkerId: 'hc1',
    name: 'Zhen Zhen Porridge',
    description: 'Traditional Teochew porridge with various side dishes.',
    cuisine: 'Chinese',
    location: 'Stall #01-54',
    images: [
      '/zhenzhen.jpg'
    ],
    rating: 4.3,
    reviewCount: 890,
    priceRange: '$',
    isOpen: true,
    menu: [
      {
        id: 'menu3',
        name: 'Teochew Porridge Set',
        description: 'Plain porridge with assorted dishes',
        price: 8.00,
        image: 'https://images.pexels.com/photos/5922265/pexels-photo-5922265.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    operatingHours: {
      monday: { open: '11:00', close: '21:00', closed: false },
      tuesday: { open: '11:00', close: '21:00', closed: false },
      wednesday: { open: '11:00', close: '21:00', closed: false },
      thursday: { open: '11:00', close: '21:00', closed: false },
      friday: { open: '11:00', close: '21:00', closed: false },
      saturday: { open: '11:00', close: '21:00', closed: false },
      sunday: { open: '11:00', close: '21:00', closed: false }
    }
  },
  {
    id: 'stall3',
    hawkerId: 'hc2',
    name: 'Lor Mee 178',
    description: 'Traditional lor mee with thick gravy and fresh ingredients.',
    cuisine: 'Chinese',
    location: 'Stall #02-05',
    images: [
      '/lormee178.jpg'
    ],
    rating: 4.4,
    reviewCount: 650,
    priceRange: '$',
    isOpen: false,
    menu: [
      {
        id: 'menu4',
        name: 'Lor Mee',
        description: 'Braised noodles in thick starchy gravy',
        price: 4.00,
        image: 'https://images.pexels.com/photos/5922280/pexels-photo-5922280.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    operatingHours: {
      monday: { open: '07:00', close: '15:00', closed: false },
      tuesday: { open: '07:00', close: '15:00', closed: false },
      wednesday: { open: '07:00', close: '15:00', closed: false },
      thursday: { open: '07:00', close: '15:00', closed: false },
      friday: { open: '07:00', close: '15:00', closed: false },
      saturday: { open: '07:00', close: '15:00', closed: false },
      sunday: { open: '07:00', close: '15:00', closed: true }
    }
  },
  {
    id: 'stall4',
    hawkerId: 'hc3',
    name: 'Satay by the Bay',
    description: 'Authentic satay with peanut sauce and ketupat.',
    cuisine: 'Malay',
    location: 'Stall #01-15',
    images: [
      'https://images.pexels.com/photos/5922295/pexels-photo-5922295.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.2,
    reviewCount: 420,
    priceRange: '$',
    isOpen: true,
    menu: [
      {
        id: 'menu5',
        name: 'Chicken Satay (10 sticks)',
        description: 'Grilled chicken skewers with peanut sauce',
        price: 8.00,
        image: 'https://images.pexels.com/photos/5922295/pexels-photo-5922295.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      {
        id: 'menu6',
        name: 'Beef Satay (10 sticks)',
        description: 'Grilled beef skewers with peanut sauce',
        price: 10.00,
        image: 'https://images.pexels.com/photos/5922295/pexels-photo-5922295.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    operatingHours: {
      monday: { open: '17:00', close: '23:00', closed: false },
      tuesday: { open: '17:00', close: '23:00', closed: false },
      wednesday: { open: '17:00', close: '23:00', closed: false },
      thursday: { open: '17:00', close: '23:00', closed: false },
      friday: { open: '17:00', close: '23:00', closed: false },
      saturday: { open: '17:00', close: '23:00', closed: false },
      sunday: { open: '17:00', close: '23:00', closed: false }
    }
  },
  {
    id: 'stall5',
    hawkerId: 'hc4',
    name: 'Hai Yan BBQ Seafood',
    description: 'Fresh seafood barbecued to perfection, famous for stingray.',
    cuisine: 'Chinese',
    location: 'Stall #01-25',
    images: [
      '/haiyan.jpg'
    ],
    rating: 4.1,
    reviewCount: 780,
    priceRange: '$$',
    isOpen: true,
    menu: [
      {
        id: 'menu7',
        name: 'Barbecue Stingray',
        description: 'Grilled stingray with sambal chili',
        price: 15.00,
        image: 'https://images.pexels.com/photos/5922220/pexels-photo-5922220.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    operatingHours: {
      monday: { open: '18:00', close: '02:00', closed: false },
      tuesday: { open: '18:00', close: '02:00', closed: false },
      wednesday: { open: '18:00', close: '02:00', closed: false },
      thursday: { open: '18:00', close: '02:00', closed: false },
      friday: { open: '18:00', close: '02:00', closed: false },
      saturday: { open: '18:00', close: '02:00', closed: false },
      sunday: { open: '18:00', close: '02:00', closed: false }
    }
  },
  {
    id: 'stall6',
    hawkerId: 'hc5',
    name: 'Bugis Laksa',
    description: 'Spicy coconut curry noodle soup with prawns and cockles.',
    cuisine: 'Chinese',
    location: 'Stall #02-08',
    images: [
      'https://images.pexels.com/photos/5922242/pexels-photo-5922242.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    rating: 4.0,
    reviewCount: 340,
    priceRange: '$',
    isOpen: true,
    menu: [
      {
        id: 'menu8',
        name: 'Laksa',
        description: 'Spicy coconut curry noodle soup',
        price: 5.50,
        image: 'https://images.pexels.com/photos/5922242/pexels-photo-5922242.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    operatingHours: {
      monday: { open: '09:00', close: '19:00', closed: false },
      tuesday: { open: '09:00', close: '19:00', closed: false },
      wednesday: { open: '09:00', close: '19:00', closed: false },
      thursday: { open: '09:00', close: '19:00', closed: false },
      friday: { open: '09:00', close: '19:00', closed: false },
      saturday: { open: '09:00', close: '19:00', closed: false },
      sunday: { open: '09:00', close: '19:00', closed: true }
    }
  }
];




export function DataProvider({ children }: { children: React.ReactNode }) {
  const [hawkerCenters] = useState<HawkerCenter[]>(mockHawkerCenters);
  const [stalls] = useState<Stall[]>(mockStalls);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentlyVisited, setRecentlyVisited] = useState<string[]>([]);
  const { user, authToken } = useAuth();

  // New useEffect to load search history when the user changes (login/logout/initial load)
  useEffect(() => {
    let initialHistory: string[] = [];

    if (user && user.user_type === 'consumer') { // Check if user is a consumer
        // 1. Safely retrieve recentlySearch. Use an empty string if it's null or undefined.
        const searchString = user.recentlySearch || ''; 
        
        // 2. Split the string only if it's not empty, otherwise we'd get a list with an empty string.
        if (searchString) {
            initialHistory = searchString
                .split('|')
                .map(s => s.trim())
                .filter(s => s.length > 0);
        }
    }
    
    // Update the state with the loaded history (or an empty array if logged out)
    setSearchHistory(initialHistory);
  }, [user]); // Re-run whenever the user object changes (login/logout)

  const getStallsByHawker = useCallback((hawkerId: string) => {
    return stalls.filter(stall => stall.hawkerId === hawkerId);
  }, [stalls]);

  const getReviewsByStall = useCallback((stallId: string) => {
    return reviews.filter(review => review.stallId === stallId);
  }, [reviews]);

  const addToFavorites = useCallback((stallId: string) => {
    setFavorites(prev => [...prev, stallId]);
  }, []);

  const removeFromFavorites = useCallback((stallId: string) => {
    setFavorites(prev => prev.filter(id => id !== stallId));
  }, []);

  const addToSearchHistory = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return; // Prevent saving empty searches
    
    setSearchHistory(prevHistory => {
      // Logic for managing local search history state
      const newHistory = [trimmedQuery, ...prevHistory.filter(item => item !== trimmedQuery)];
      return newHistory.slice(0, 5); // Keep max 5 items
    });
    // The call to persistSearchHistory() in SearchPage.tsx handles the backend update.
  }, []);

  // New function to persist search history to the backend
  const persistSearchHistory = useCallback(async (query: string) => {
    if (!user || !authToken || user.user_type !== 'consumer') {
      console.log('User not logged in or not a consumer. Skipping history persistence.');
      return;
    }

    const url = `${API_BASE_URL}/consumer/add-search-history`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ search_term: query }),
      });

      if (!response.ok) {
        // Log non-critical error for history saving
        const errorData = await response.json();
        console.error('Failed to persist search history:', errorData.detail);
      }
      // Success: backend has updated the user's search history string
    } catch (error) {
      console.error('Network error during search history persistence:', error);
    }
  }, [user, authToken]); // Dependencies for useCallback

  const addToRecentlyVisited = useCallback((stallId: string) => {
    setRecentlyVisited(prev => {
      const filtered = prev.filter(id => id !== stallId);
      return [stallId, ...filtered].slice(0, 20);
    });
  }, []);

  const addReview = useCallback((reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `review_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);
  }, []);

  return (
    <DataContext.Provider value={{
      hawkerCenters,
      stalls,
      reviews,
      favorites,
      searchHistory,
      recentlyVisited,
      getStallsByHawker,
      getReviewsByStall,
      addToFavorites,
      removeFromFavorites,
      addToSearchHistory,
      persistSearchHistory,
      addToRecentlyVisited,
      addReview
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}