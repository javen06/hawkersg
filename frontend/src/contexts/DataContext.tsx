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
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);


// const mockHawkerCenters: HawkerCenter[] = [
//   {
//     id: 'hc1',
//     name: 'Maxwell Food Centre',
//     address: '1 Kadayanallur Street, Singapore 069184',
//     description: 'One of Singapore\'s most famous hawker centers, known for its Hainanese chicken rice and laksa.',
//     image: '/maxwell.jpg',
//     rating: 4.5,
//     stallCount: 85,
//     coordinates: { lat: 1.2805, lng: 103.8431 }
//   },
//   {
//     id: 'hc2',
//     name: 'Tiong Bahru Market',
//     address: '30 Seng Poh Road, Singapore 168898',
//     description: 'A heritage hawker center in the heart of Tiong Bahru, famous for its traditional breakfast items.',
//     image: '/tiongbahru.jpg',
//     rating: 4.3,
//     stallCount: 62,
//     coordinates: { lat: 1.2866, lng: 103.8279 }
//   },
//   {
//     id: 'hc3',
//     name: 'Lau Pa Sat',
//     address: '18 Raffles Quay, Singapore 048582',
//     description: 'Historic Victorian-era market building serving diverse local and international cuisines.',
//     image: '/laupasat.jpg',
//     rating: 4.2,
//     stallCount: 45,
//     coordinates: { lat: 1.2805, lng: 103.8508 }
//   },
//   {
//     id: 'hc4',
//     name: 'Newton Food Centre',
//     address: '500 Clemenceau Avenue North, Singapore 229495',
//     description: 'Popular tourist destination known for its seafood and barbecue stingray.',
//     image: '/newton.jpg',
//     rating: 4.1,
//     stallCount: 78,
//     coordinates: { lat: 1.3048, lng: 103.8318 }
//   },

//   {
//     id: 'hc5',
//     name: 'Old Airport Road Food Centre',
//     address: '51 Old Airport Road, Singapore 390051',
//     description:
//       'One of the largest hawker centers, known for char kway teow, satay, and heritage dishes.',
//     image: '/oldairport.jpg',
//     rating: 4.6,
//     stallCount: 150,
//     coordinates: { lat: 1.3081, lng: 103.8837 },
//   },

//   {
//     id: 'hc6',
//     name: 'Amoy Street Food Centre',
//     address: '7 Maxwell Road, Singapore 069111',
//     description:
//       'CBD lunch hotspot famous for noodles, rice bowls, and affordable local eats.',
//     image: '/amoy.jpg',
//     rating: 4.4,
//     stallCount: 100,
//     coordinates: { lat: 1.2789, lng: 103.8476 },
//   },

//   {
//     id: 'hc7',
//     name: 'Tekka Centre',
//     address: '665 Buffalo Road, Singapore 210665',
//     description:
//       'Diverse hawker centre with Indian, Malay, and Chinese food in vibrant Little India.',
//     image: '/tekka.jpg',
//     rating: 4.5,
//     stallCount: 120,
//     coordinates: { lat: 1.3075, lng: 103.8501 },
//   },

//   {
//     id: 'hc8',
//     name: 'Golden Mile Food Centre',
//     address: '505 Beach Road, Singapore 199583',
//     description:
//       'Underground hawker with famous army stew, char kway teow, and local delights.',
//     image: '/goldenmile.jpg',
//     rating: 4.2,
//     stallCount: 60,
//     coordinates: { lat: 1.3020, lng: 103.8623 },
//   }

// ];

// const mockStalls: Stall[] = [
//   {
//     id: 'stall1',
//     hawkerId: 'hc1',
//     name: 'Tian Tian Hainanese Chicken Rice',
//     description: 'Famous for tender chicken and fragrant rice, a Maxwell Food Centre institution.',
//     cuisine: 'Chinese',
//     location: 'Stall #01-10',
//     images: [
//       '/tiantian.jpg'
//     ],
//     rating: 4.6,
//     reviewCount: 1250,
//     priceRange: '$',
//     isOpen: true,
//     menu: [
//       {
//         id: 'menu1',
//         name: 'Hainanese Chicken Rice',
//         description: 'Tender steamed chicken with fragrant rice',
//         price: 4.50,
//         image: 'https://images.pexels.com/photos/5922220/pexels-photo-5922220.jpeg?auto=compress&cs=tinysrgb&w=400'
//       },
//       {
//         id: 'menu2',
//         name: 'Roasted Chicken Rice',
//         description: 'Crispy roasted chicken with rice',
//         price: 5.00,
//         image: 'https://images.pexels.com/photos/5922242/pexels-photo-5922242.jpeg?auto=compress&cs=tinysrgb&w=400'
//       }
//     ],
//     operatingHours: {
//       monday: { open: '10:00', close: '20:00', closed: false },
//       tuesday: { open: '10:00', close: '20:00', closed: false },
//       wednesday: { open: '10:00', close: '20:00', closed: false },
//       thursday: { open: '10:00', close: '20:00', closed: false },
//       friday: { open: '10:00', close: '20:00', closed: false },
//       saturday: { open: '10:00', close: '20:00', closed: false },
//       sunday: { open: '10:00', close: '20:00', closed: true }
//     }
//   },
//   {
//     id: 'stall2',
//     hawkerId: 'hc1',
//     name: 'Zhen Zhen Porridge',
//     description: 'Traditional Teochew porridge with various side dishes.',
//     cuisine: 'Chinese',
//     location: 'Stall #01-54',
//     images: [
//       '/zhenzhen.jpg'
//     ],
//     rating: 4.3,
//     reviewCount: 890,
//     priceRange: '$',
//     isOpen: true,
//     menu: [
//       {
//         id: 'menu3',
//         name: 'Teochew Porridge Set',
//         description: 'Plain porridge with assorted dishes',
//         price: 8.00,
//         image: 'https://images.pexels.com/photos/5922265/pexels-photo-5922265.jpeg?auto=compress&cs=tinysrgb&w=400'
//       }
//     ],
//     operatingHours: {
//       monday: { open: '11:00', close: '21:00', closed: false },
//       tuesday: { open: '11:00', close: '21:00', closed: false },
//       wednesday: { open: '11:00', close: '21:00', closed: false },
//       thursday: { open: '11:00', close: '21:00', closed: false },
//       friday: { open: '11:00', close: '21:00', closed: false },
//       saturday: { open: '11:00', close: '21:00', closed: false },
//       sunday: { open: '11:00', close: '21:00', closed: false }
//     }
//   },
//   {
//     id: 'stall3',
//     hawkerId: 'hc2',
//     name: 'Lor Mee 178',
//     description: 'Traditional lor mee with thick gravy and fresh ingredients.',
//     cuisine: 'Chinese',
//     location: 'Stall #02-05',
//     images: [
//       '/lormee178.jpg'
//     ],
//     rating: 4.4,
//     reviewCount: 650,
//     priceRange: '$',
//     isOpen: false,
//     menu: [
//       {
//         id: 'menu4',
//         name: 'Lor Mee',
//         description: 'Braised noodles in thick starchy gravy',
//         price: 4.00,
//         image: 'https://images.pexels.com/photos/5922280/pexels-photo-5922280.jpeg?auto=compress&cs=tinysrgb&w=400'
//       }
//     ],
//     operatingHours: {
//       monday: { open: '07:00', close: '15:00', closed: false },
//       tuesday: { open: '07:00', close: '15:00', closed: false },
//       wednesday: { open: '07:00', close: '15:00', closed: false },
//       thursday: { open: '07:00', close: '15:00', closed: false },
//       friday: { open: '07:00', close: '15:00', closed: false },
//       saturday: { open: '07:00', close: '15:00', closed: false },
//       sunday: { open: '07:00', close: '15:00', closed: true }
//     }
//   },
//   {
//     id: 'stall4',
//     hawkerId: 'hc3',
//     name: 'Satay by the Bay',
//     description: 'Authentic satay with peanut sauce and ketupat.',
//     cuisine: 'Malay',
//     location: 'Stall #01-15',
//     images: [
//       'https://images.pexels.com/photos/5922295/pexels-photo-5922295.jpeg?auto=compress&cs=tinysrgb&w=800'
//     ],
//     rating: 4.2,
//     reviewCount: 420,
//     priceRange: '$',
//     isOpen: true,
//     menu: [
//       {
//         id: 'menu5',
//         name: 'Chicken Satay (10 sticks)',
//         description: 'Grilled chicken skewers with peanut sauce',
//         price: 8.00,
//         image: 'https://images.pexels.com/photos/5922295/pexels-photo-5922295.jpeg?auto=compress&cs=tinysrgb&w=400'
//       },
//       {
//         id: 'menu6',
//         name: 'Beef Satay (10 sticks)',
//         description: 'Grilled beef skewers with peanut sauce',
//         price: 10.00,
//         image: 'https://images.pexels.com/photos/5922295/pexels-photo-5922295.jpeg?auto=compress&cs=tinysrgb&w=400'
//       }
//     ],
//     operatingHours: {
//       monday: { open: '17:00', close: '23:00', closed: false },
//       tuesday: { open: '17:00', close: '23:00', closed: false },
//       wednesday: { open: '17:00', close: '23:00', closed: false },
//       thursday: { open: '17:00', close: '23:00', closed: false },
//       friday: { open: '17:00', close: '23:00', closed: false },
//       saturday: { open: '17:00', close: '23:00', closed: false },
//       sunday: { open: '17:00', close: '23:00', closed: false }
//     }
//   },
//   {
//     id: 'stall5',
//     hawkerId: 'hc4',
//     name: 'Hai Yan BBQ Seafood',
//     description: 'Fresh seafood barbecued to perfection, famous for stingray.',
//     cuisine: 'Chinese',
//     location: 'Stall #01-25',
//     images: [
//       '/haiyan.jpg'
//     ],
//     rating: 4.1,
//     reviewCount: 780,
//     priceRange: '$$',
//     isOpen: true,
//     menu: [
//       {
//         id: 'menu7',
//         name: 'Barbecue Stingray',
//         description: 'Grilled stingray with sambal chili',
//         price: 15.00,
//         image: 'https://images.pexels.com/photos/5922220/pexels-photo-5922220.jpeg?auto=compress&cs=tinysrgb&w=400'
//       }
//     ],
//     operatingHours: {
//       monday: { open: '18:00', close: '02:00', closed: false },
//       tuesday: { open: '18:00', close: '02:00', closed: false },
//       wednesday: { open: '18:00', close: '02:00', closed: false },
//       thursday: { open: '18:00', close: '02:00', closed: false },
//       friday: { open: '18:00', close: '02:00', closed: false },
//       saturday: { open: '18:00', close: '02:00', closed: false },
//       sunday: { open: '18:00', close: '02:00', closed: false }
//     }
//   },
//   {
//     id: 'stall6',
//     hawkerId: 'hc5',
//     name: 'Bugis Laksa',
//     description: 'Spicy coconut curry noodle soup with prawns and cockles.',
//     cuisine: 'Chinese',
//     location: 'Stall #02-08',
//     images: [
//       'https://images.pexels.com/photos/5922242/pexels-photo-5922242.jpeg?auto=compress&cs=tinysrgb&w=800'
//     ],
//     rating: 4.0,
//     reviewCount: 340,
//     priceRange: '$',
//     isOpen: true,
//     menu: [
//       {
//         id: 'menu8',
//         name: 'Laksa',
//         description: 'Spicy coconut curry noodle soup',
//         price: 5.50,
//         image: 'https://images.pexels.com/photos/5922242/pexels-photo-5922242.jpeg?auto=compress&cs=tinysrgb&w=400'
//       }
//     ],
//     operatingHours: {
//       monday: { open: '09:00', close: '19:00', closed: false },
//       tuesday: { open: '09:00', close: '19:00', closed: false },
//       wednesday: { open: '09:00', close: '19:00', closed: false },
//       thursday: { open: '09:00', close: '19:00', closed: false },
//       friday: { open: '09:00', close: '19:00', closed: false },
//       saturday: { open: '09:00', close: '19:00', closed: false },
//       sunday: { open: '09:00', close: '19:00', closed: true }
//     }
//   }
// ];




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