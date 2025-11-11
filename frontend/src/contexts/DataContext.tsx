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
  license_name?: string; // 👈 Added this
  description: string;
  cuisine: string;
  location: string;
  images: string[];
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$';
  is_open?: boolean;
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
  getReviewsByConsumer: (consumerId: string) => Promise<any[]>;
  addReview: (review: Omit<Review, "id" | "createdAt">) => void;
  updateBusinessProfile: (data: FormData) => Promise<any>;
<<<<<<< Updated upstream
=======
  getBusinessProfile: (licenseNumber: string) => Promise<any>;
  businessProfile: any;  // ✅ add this
  setBusinessProfile: React.Dispatch<React.SetStateAction<any>>; 
  updateBusinessField: (data: Record<string, any>) => Promise<any>;
>>>>>>> Stashed changes
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [hawkerCenters, setHawkerCenters] = useState<HawkerCenter[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentlyVisited, setRecentlyVisited] = useState<string[]>([]);
  const { user, authToken } = useAuth();


  useEffect(() => {
  const fetchData = async () => {
    try {
      const [hawkersRes, stallsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/hawkers`),
        fetch(`${API_BASE_URL}/stalls`)
      ]);

      if (!hawkersRes.ok || !stallsRes.ok) {
        throw new Error("Failed to fetch hawker or stall data");
      }

      // Use 'any' to avoid TS screaming about backend shapes
      const hawkersData: any[] = await hawkersRes.json();
      const stallsData: any[] = await stallsRes.json();

      console.log("Hawker centres:", hawkersData);
      console.log("Raw stalls from backend:", stallsData);

      // ---- Helpers ----
      const fallbackImg = "/placeholder-hawker.jpg";

      // --- Cuisine classifier (broad, deterministic) ---
      // --- Enhanced Cuisine Detector ---
      const detectCuisine = (rawName: unknown, rawDesc: unknown, rawAddr: unknown = ""): string => {
        const text = `${String(rawName || "")} ${String(rawDesc || "")} ${String(rawAddr || "")}`.toLowerCase();

      // Cuisine rules: Dessert and Beverage come before Chinese to avoid misclassification
      const rules: Array<[string, string[]]> = [
        // Dessert
        [
          "Dessert",
          [
            "dessert", "ice cream", "chendol", "tau huey", "tau huay", "beancurd", "bean curd", "bobo chacha", "pulut hitam",
            "pudding", "cake", "brownie", "ice kachang", "ice kacang", /* removed "ice", "iced", */ "cheng tng", "mango sago", "bingsu",
            "snow ice", "orh nee", "yam paste", "sweet soup", "ah chew", "tau suan", "almond jelly", "milo dinosaur",
            "red bean", "green bean", "grass jelly", "lucky dessert", "desserts", "mango pomelo", "muah chee", "putu piring",
            "apom", "waffle", "waffles", "egg tart", "egg tarts", "tang yuan", "glutinous rice ball", "fresh coconut", "fresh milk", "egg", "eggs", "durian", "fruit", "fruits"
            ,"department", "cold", "caf", "pancake", "pancakes", "pastry", "pastries", "muffin", "bread", "bake", "bakery"
          ]
        ],
        // Beverage
        [
          "Beverage",
          [
            "kopi", "teh", "coffee", "tea", "barley", "bubble tea", "boba", "milk tea", "juice", "smoothie", "bandung", "cafe", "coffeeshop",
            "milo", "horlicks", "yuan yang", "soda", "drink", "drinks", "iced lemon", "lime juice", "fruit juice", "sugarcane",
            "sugar cane", "ice lemon tea", "soya bean", "soy milk", "sarsi", "grass jelly drink", "chrysanthemum", "luohan", "luo han", "roselle",
            "cane juice", "soft drink", "canned drink", "fresh coconut", "fresh milk", "avocado juice", "beverages", "bubble cup", "vietnam coffee", "cold", "101", "matcha", "matchaya", "soya", "soy"
          ]
        ],
        // Fusion 
        [
          "Fusion",
          [
            "fusion", "mix", "mixed", "international", "modern asian", "modern", "western-asian", "east meets west", "eating", "house",
            "asian fusion", "european-asian", "western fusion", "global", "contemporary", "twist", "cross", "cross-cuisine", "cooked",
            "cross culture", "multi-cuisine", "creative", "mod-sin", "mod sin", "modsin", "modern singapore", "mod sg", "modsg", "bbq", "munchi", "cooked", "rice", "lei cha"
          ]
        ],
        // Japanese
        [
          "Japanese",
          [
            "japanese", "ramen", "sushi", "udon", "donburi", "katsu", "yakitori", "gyudon", "tempura", "bento", "mentaiko",
            "teriyaki", "tonkatsu", "unagi", "sashimi", "miso", "takoyaki", "okonomiyaki", "onigiri", "matcha", "japan", "ocha",
            "omakase", "shabu", "shabu shabu", "yakisoba", "karage", "karaage", "chawanmushi", "tamago", "chirashi", "jap food", "jap"
          ]
        ],
        // Korean
        [
          "Korean",
          [
            "korean", "kimchi", "bibimbap", "tteokbokki", "army stew", "budae jjigae", "budae", "korea", "jajangmyeon", "jjajangmyeon",
            "bulgogi", "samgyeopsal", "soondubu", "soondubu jjigae", "kim bap", "kimbap", "dakgalbi", "jjigae", "seoul", "hotpot", "kbbq"
          ]
        ],
        // Thai
        [
          "Thai",
          [
            "thai", "thailand", "tom yum", "tom yam", "pad thai", "mookata", "moo kata", "som tam", "green curry", "red curry",
            "basil chicken", "thai milk tea", "mango sticky rice", "boat noodles", "thai fried rice", "pineapple rice", "thai iced tea",
            "thai food", "thai cuisine", "yum woon sen", "phad thai", "thai bbq", "moo ping", "thai express"
          ]
        ],
        // Vietnamese
        [
          "Vietnamese",
          [
            "vietnamese", "vietnam", "pho", "banh mi", "bun cha", "goi cuon", "spring roll", "bun bo hue", "banh xeo", "ca phe",
            "vietnam food", "vietnam cuisine", "bun thit nuong", "broken rice", "com tam", "vietnam rolls", "vietnam coffee"
          ]
        ],
        // Indonesian
        [
          "Indonesian",
          [
            "indonesian", "indonesia", "indo", "nasi padang", "ayam penyet", "ayam bakar", "bakso", "gado gado", "nasi goreng",
            "soto ayam", "rendang", "pecel lele", "tempeh", "empal", "sambal", "indon", "nasi uduk", "bali", "batagor", "martabak"
          ]
        ],
        // Indian
        [
          "Indian",
          [
            "indian", "india", "prata", "roti prata", "biryani", "briyani", "masala", "naan", "thosai", "dosa", "murtabak", "tandoori", "jaya",
            "butter chicken", "curry", "chapati", "puri", "maggi goreng", "fish head curry", "paneer", "dal", "samosa", "idli", "rasam", "sri", "curries", 
            "vindaloo", "palak", "aloo", "indian food", "indian cuisine", "north indian", "south indian", "chettinad", "mutton", "mustafa","tiffin", "rahaman"
          ]
        ],
        // Malay
        [
          "Malay",
          [
            "malay", "malaysia", "malaysian", "nasi lemak", "mee soto", "mee rebus", "mee siam", "lontong", "rendang", "satay", "muslim", "halal",
            "roti john", "ayam goreng", "sambal", "otah", "lemak", "soto", "ketupat", "nasi padang", "nasi ayam", "nasi campur", "haji", "sarabat", "bismibriyani", "goreng", "suka",
            "sup tulang", "rojak", "laksa johor", "cendol", "lemper", "kuih", "kueh", "kuih muih", "briyani", "mee robus", "mee goreng", "nasi", "kak", "hajjah", 'al', "abdullah", "hamid", "rahman"
          ]
        ],
        // Western
        [
          "Western",
          [
            "western", "west", "steak", "burger", "pasta", "pizza", "grill", "fish and chips", "fish & chips", "roast", "carbonara",
            "spaghetti", "macaroni", "cheese", "lasagna", "chop", "chicken chop", "lamb chop", "french fries", "fries", "salad",
            "sandwich", "wrap", "hotdog", "hot dog", "steakhouse", "western food", "western cuisine", "bbq ribs", "schnitzel", "bbq", "wings", "wing", "lok"
          ]
        ],
        // Mediterranean
        [
          "Mediterranean",
          [
            "mediterranean", "greek", "turkish", "lebanese", "middle eastern", "hummus", "falafel", "shawarma",
            "kebab", "pita", "tabbouleh", "tzatziki", "baba ghanoush", "olive", "feta", "gyro", "mezze",  "prawn",
            "couscous", "grilled",  "lamb", "shakshuka", "dolma", "baklava", "moroccan", "israeli", "arabic", "levantine", 
            "seafood", "kitchenette", "sea", "lobster", "crab", "fish", "oyster"
          ]
        ],
        // Vegetarian
        [
          "Vegetarian",
          [
            "vegetarian", "vegan", "meatless", "plant-based", "plant based", "vege", "veg", "vegetable", "mock meat", "素", "素食",
            "vegetarian food", "vegetarian cuisine", "vegetarian bee hoon", "veg rice", "veg stall", "vegetarian stall", "vegetables"
          ]
        ],
        // Chinese
        [
          "Chinese",
          [
            "chinese", "zhong", "china", "dim sum", "dimsum", "hainanese", "teochew", "hokkien", "cantonese", "sichuan", "szechuan",
            "bak kut teh", "chicken rice", "duck rice", "wanton", "wanton mee", "char siew", "charsiew", "fish soup", "cai fan", "cai png", "duck", "chicken",
            "tze char", "zi char", "zichar", "noodle", "noodles", "mee", "kway", "kway teow", "bee hoon", "hor fun", "ban mian", "lor mee",
            "xin", "long", "congee", "porridge", "yong tau foo", "ytf", "minced pork", "bak chor mee", "carrot cake", "chai tow kway",
            "popiah", "spring roll", "chee cheong fun", "siew mai", "pau", "bao", "roast pork", "roast duck", "claypot", "soup", "stir fry", "canton",
            "white bee hoon", "laksa", "sambal", "fried rice", "fried bee hoon", "shanghai", "xiao long bao", "mantou", "mapo", "ma po",
            "chow mein", "lo mein", "egg fried rice", "salted egg", "salted fish", "herbal", "herbal soup", "mala", "xiang", "tofu", "zham", "tan", "yong", "jie", "xin", "xing", "kai", "le"
          ]
        ]
      ];

        for (const [label, keywords] of rules) {
          if (keywords.some(k => new RegExp(`\\b${k}\\b`, "i").test(text))) return label;
        }

        return "Others";
      };

      // optional seeded random rating generator
      const seeded = (s: string) => {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        return ((h % 300) / 100) + 2.0; // range 2.0–5.0 for realistic hawker ratings
      };

      // ---- Format hawkers so Nearby has guaranteed coordinates ----
      const formattedHawkers = hawkersData.map((h: any) => {
        // Support various backend field names: coordinates OR latitude/longitude
        const lat = h?.coordinates?.lat ?? h?.latitude ?? 0;
        const lng = h?.coordinates?.lng ?? h?.longitude ?? 0;
        return {
          id: String(
            h.id ??
            h.hawker_id ??
            h.slug ??
            h.name?.toLowerCase().replace(/\s+/g, "_") ??
            ""
          ),
          name: String(h.name ?? h.hawker_name ?? "Hawker Centre"),
          address: String(h.address ?? ""),
          description: String(h.description ?? ""),
          image: String(h.image ?? fallbackImg),
          rating: Number(h.rating ?? 0),
          stallCount: Number(h.stallCount ?? h.stall_count ?? 0),
          coordinates: { lat: Number(lat), lng: Number(lng) },
        } as HawkerCenter;
      });

      // ---- Normalize stalls so Search/Nearby filters work ----
      const isBadName = (rawName: unknown, licensee: unknown): boolean => {
        const n = String(rawName ?? "").trim();
        const lic = String(licensee ?? "").trim();
        // Filter out personal email-based license names (gmail, icloud, yahoo)
        const emailDomains = ["@gmail.com", "@icloud.com", "@yahoo.com"];
        if (emailDomains.some(domain => lic.toLowerCase().includes(domain))) return true;
        if (!n) return true; // empty
        const nl = n.toLowerCase();
        const badTokens = [
          "null", "undefined", "n/a", "na", "-", "nil", "(no signboard)", "no signboard", "signboard", "no name", "none"
        ];
        if (badTokens.some(t => nl.replace(/\s+/g, '').includes(t.replace(/\s+/g, '')))) return true;
        if (lic && nl === lic.toLowerCase()) return true; // stall name equals owner name → likely placeholder
        if (n.length < 2) return true; // too short = suspicious
        return false;
      };

      const formattedStalls: Stall[] = stallsData
        .map((stall: any) => {
          const licensee = stall?.licensee_name ?? stall?.license_name; // handle both
          const rawStallName = stall?.stall_name;

          // Skip stalls that have no real stall name (or just use the owner's name)
          if (isBadName(rawStallName, licensee)) {
            return null;
          }

          const cuisine = detectCuisine(stall?.stall_name, stall?.description, stall?.establishment_address);
          const name = String(rawStallName).trim(); // ✅ only use actual stall_name
          // Seeded rating for consistency across reloads
          const rating = stall?.rating
            ? Number(stall.rating)
            : Number(seeded(String(stall?.id ?? name)).toFixed(1));
          const reviewCount = Number(stall?.review_count ?? 0);
          const photo = stall?.photo ? String(stall.photo) : "";

          return {
            id: String(stall?.id ?? ""),
            hawkerId: String(stall?.hawker_centre ?? ""),
            name,
            description: String(stall?.description ?? ""),
            cuisine,
            location: String(stall?.establishment_address ?? ""),
            images: photo ? [photo] : [],
            rating,
            reviewCount,
            priceRange: "$",
            // Align casing: backend sends is_open; FE uses isOpen
            isOpen: Boolean(stall?.is_open === true),
            is_open: Boolean(stall?.is_open === true),
            menu: Array.isArray(stall?.menu) ? stall.menu : [],
            operatingHours: {},
          } as Stall;
        })
        .filter((s: Stall | null): s is Stall => Boolean(s));

      console.log("After filtering bad-name stalls:", {
        totalFromApi: stallsData.length,
        kept: formattedStalls.length,
      });

      // 🧮 Recompute stall counts per hawker (super aggressive fuzzy matching)
      const hawkerCounts: Record<string, number> = {};
      const normalize = (str: string) =>
        str
          .toLowerCase()
          .replace(/\b(hawker|centre|center|food|market|blk|block|road|street|st|avenue|ave|rd|drive|dr|lane|ln|#|no|unit)\b/g, "")
          .replace(/[0-9]/g, "")
          .replace(/[^a-z]/g, "")
          .trim();

      // helper to check similarity score between two strings (>=0.6 = match)
      const similarity = (a: string, b: string): number => {
        if (!a || !b) return 0;
        const setA = new Set(a);
        const setB = new Set(b);
        const intersect = [...setA].filter(ch => setB.has(ch)).length;
        return intersect / Math.max(setA.size, setB.size);
      };

      const hawkerNameMap = new Map<string, any>();
      for (const h of formattedHawkers) {
        hawkerNameMap.set(normalize(h.name), h);
      }

      for (const stall of formattedStalls) {
        const rawCentre = String(stall.hawkerId || "");
        const normalizedStallCentre = normalize(rawCentre);

        // ✅ 1. Exact normalized name match
        if (hawkerNameMap.has(normalizedStallCentre)) {
          const h = hawkerNameMap.get(normalizedStallCentre)!;
          hawkerCounts[h.id] = (hawkerCounts[h.id] || 0) + 1;
          stall.hawkerId = h.id;
          continue;
        }

        // ✅ 2. Fuzzy fallback
        let bestMatch: any = null;
        let bestScore = 0;
        for (const h of formattedHawkers) {
          const nHawker = normalize(h.name);
          const score = similarity(normalizedStallCentre, nHawker);
          if (score > bestScore) {
            bestScore = score;
            bestMatch = h;
          }
        }

        if (bestMatch && bestScore > 0.35) {
          hawkerCounts[bestMatch.id] = (hawkerCounts[bestMatch.id] || 0) + 1;
          stall.hawkerId = bestMatch.id;
        } else {
          console.warn("❌ No match for stall hawker_centre:", rawCentre);
        }
      }

      // Assign computed stall counts to hawkers
      const hawkersWithCounts = formattedHawkers.map(h => ({
        ...h,
        stallCount: hawkerCounts[h.id] || 0,
      }));

      setHawkerCenters(hawkersWithCounts);
      setStalls(formattedStalls);
    } catch (error) {
      console.error("Error fetching hawker data:", error);
    }
  };

  fetchData();
}, []);

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

  // const addToFavorites = useCallback((stallId: string) => {
  //   setFavorites(prev => [...prev, stallId]);
  // }, []);

  // const removeFromFavorites = useCallback((stallId: string) => {
  //   setFavorites(prev => prev.filter(id => id !== stallId));
  // }, []);

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

  const persistFavorite = useCallback(async (stallId: string) => {
    console.log("Auth token:", authToken);
    if (!user || user.user_type !== 'consumer') return;

  try {
    const response = await fetch(`${API_BASE_URL}/consumers/${user.id}/favourites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_type: 'business', 
        target_id: stallId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to add favorite:', errorData);
    }
  } catch (err) {
    console.error('Network error adding favorite:', err);
  }
}, [user]);

const addToFavorites = useCallback((stallId: string) => {
  setFavorites(prev => {
    if (prev.includes(stallId)) return prev; // avoid duplicates
    return [...prev, stallId];
  });
  persistFavorite(stallId); // sync with backend
}, [persistFavorite]);

const removeFromFavorites = useCallback(async (stallId: string) => {
  setFavorites(prev => prev.filter(id => id !== stallId));

  if (!user || user.user_type !== 'consumer') return;

  try {
    const response = await fetch(`${API_BASE_URL}/consumers/${user.id}/favourites`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_type: 'business', 
        target_id: stallId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to remove favorite:', errorData);
    }
  } catch (err) {
    console.error('Network error removing favorite:', err);
  }
}, [user]);


const addReview = async (reviewData: {
  stallId: string | number;
  rating: number;
  comment: string;
  images: string[];
}) => {
  if (!authToken || !user || user.user_type !== 'consumer') return;

  // Construct payload for API
  const payload = {
    target_type: 'business',
    target_id: Number(reviewData.stallId),
    star_rating: Number(reviewData.rating),
    description: reviewData.comment?.trim() || "No description provided.",
    images: Array.isArray(reviewData.images) ? reviewData.images : [],
  };

  console.log("Posting review payload:", payload);

  try {
    const response = await fetch(`${API_BASE_URL}/consumers/${user.id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Failed to post review:', text);
      return;
    }

    const apiResponse = await response.json();

    // Construct Review object matching your interface
    const newReview: Review = {
      id: String(apiResponse.id),
      stallId: String(reviewData.stallId),
      userId: String(user.id),
      userName: user.username,
      rating: Number(reviewData.rating),
      comment: reviewData.comment?.trim() || "No description provided.",
      images: Array.isArray(reviewData.images) ? reviewData.images : [],
      createdAt: apiResponse.created_at || new Date().toISOString(),
    };

    setReviews(prev => [...prev, newReview]);
  } catch (err) {
    console.error('Error posting review:', err);
  }
};


  const getReviewsByConsumer = async (consumerId: string) => {
    try {
      // 1. Fetch reviews for this consumer
      const res = await fetch(`${API_BASE_URL}/consumers/${consumerId}/reviews`);
      if (!res.ok) throw new Error("Failed to fetch consumer reviews");
      const reviews = await res.json();

      // 2. Fetch the consumer info once to get the username
      let userName = "Unknown";
      try {
        const userRes = await fetch(`${API_BASE_URL}/consumer/${consumerId}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          userName = userData.username;
        }
      } catch (_) {
        // fallback remains "Unknown"
      }

      // 3. Map reviews to your Review interface
      return reviews.map((r: any) => ({
        id: String(r.id),
        stallId: String(r.target_id),
        userId: String(r.consumer_id),
        userName, // use fetched username
        rating: Number(r.star_rating),
        comment: r.description || "",
        images: Array.isArray(r.images) ? r.images : [],
        createdAt: r.created_at || new Date().toISOString(),
      })) as Review[];
    } catch (err) {
      console.error("Error fetching reviews by consumer:", err);
      return [];
    }
  };

  const updateBusinessProfile = async (data: FormData) => {
  const licenseNumber = "CE23807B000"; // fixed license number

  const response = await fetch(`${API_BASE_URL}/business/${licenseNumber}/profile`, {
    method: "PATCH",
    body: data, // no headers
  });

  if (!response.ok) {
    throw new Error(`Failed to update profile: ${response.statusText}`);
  }
  return await response.json();
};

const updateBusinessField = async (data: Record<string, any>) => {
  const response = await fetch(`${API_BASE_URL}/business/${licenseNumber}/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update profile: ${response.statusText}`);
  }

  const updatedProfile = await response.json();
  console.log(updatedProfile);
  setBusinessProfile(updatedProfile);
  return updatedProfile;
};


  return (
    <DataContext.Provider value={{
      hawkerCenters,
      stalls,
      reviews,
      favorites,
      searchHistory,
      recentlyVisited,
      businessProfile,
      getStallsByHawker,
      getReviewsByStall,
      getReviewsByConsumer,
      addToFavorites,
      removeFromFavorites,
      addToSearchHistory,
      persistSearchHistory,
      addToRecentlyVisited,
      addReview,
<<<<<<< Updated upstream
      updateBusinessProfile
=======
      updateBusinessProfile,
      getBusinessProfile,
      updateBusinessField,
      setBusinessProfile
>>>>>>> Stashed changes
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