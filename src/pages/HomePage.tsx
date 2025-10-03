import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import FeaturedHawkerCenter from "../components/FeaturedHawkerCenter";


const heroSlides = [
  {
    bg: "bg-gradient-to-r from-red-700 to-orange-500",
    heading: (
      <>
        Discover Singapore&apos;s <br />
        <span className="text-yellow-300">Hawker Heritage</span>
      </>
    ),
    sub: "Find your favorite stalls, explore authentic local cuisine, and discover hidden gems in Singapore's iconic hawker centers",
    btnText: "Explore Hawker Centers",
    btnLink: "/browse",
  },
  {
    bg: "bg-gradient-to-r from-orange-500 to-orange-300 to-yellow-600",
    heading: (
      <>
        Support Our <span className="text-orange-300">Hawkers</span>
      </>
    ),
    sub: "Join our platform to showcase your stall, manage your menu with ease, connect with customers in Singapore's vibrant hawker community!",    
    btnText: "Register Your Stall",
    btnLink: "/signup-business",
  },
  {
    bg: "bg-gradient-to-r from-yellow-600 to-orange-500",
    heading: (
      <>
        Taste the <span className="text-yellow-300">Heritage</span>
      </>
    ),
    sub: "Relive Singapore's rich culinary traditions through authentic flavors that have been passed down for generations. Experience our iconic hawker centers.",
    btnText: "Browse Hawker Centers",
    btnLink: "/browse",
  },
];

export default function HomePage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  const hero = heroSlides[index];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      {/* Hero Section */}
<section className="relative min-h-[65vh] text-center text-white overflow-hidden">
  <motion.div
    className="flex w-full h-full"
    animate={{ x: `-${index * 100}%` }}
    transition={{ duration: 1, ease: "easeInOut" }}
  >
    {heroSlides.map((slide, i) => (
      <div
        key={i}
        className={`flex-shrink-0 w-full min-h-[65vh] flex flex-col justify-center items-center ${slide.bg}`}
      >
        <div className="px-6">
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
              {slide.heading}
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto">{slide.sub}</p>
          </div>
          <div className="mt-12">
            <Link
              to={slide.btnLink}
              className="px-8 py-4 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition"
            >
              {slide.btnText}
            </Link>
          </div>
        </div>
      </div>
    ))}
  </motion.div>
</section>

<<<<<<< HEAD
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{hawkerCenters.length}+</h3>
              <p className="text-gray-600">Hawker Centers</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{totalStalls}+</h3>
              <p className="text-gray-600">Food Stalls</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
=======


      {/* Food Icons */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto flex justify-center space-x-12">
          {[
            "/chilliCrab.png",
            "/chickenRice.png",
            "/laksa.png",
            "/prawnNoodles.png",
            "/curryPuff.png",
          ].map((src, i) => (
            <motion.img
              key={i}
              src={src}
              alt="food"
              className="h-40 w-45 object-contain"
              animate={{ rotate: [0, 5, -5, 0] }} // ±5° instead of ±2° wiggle left-right
              transition={{
                repeat: Infinity,                  // loop forever
                repeatType: "loop",
                duration: 2,                       // speed of wiggle
                delay: i * 0.5,                    // stagger one by one
                ease: "easeInOut",                 // smooth movement
              }}
            />
          ))}
>>>>>>> javen
        </div>
      </section>

      {/* Featured Hawker Centers */}
<<<<<<< HEAD
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Hawker Centers</h2>
            <p className="text-xl text-gray-600">Discover the most popular destinations for authentic local cuisine</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredHawkers.map((hawker) => (
              <Link
                key={hawker.id}
                to={`/hawker/${hawker.id}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={hawker.image}
                    alt={hawker.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{hawker.rating}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{hawker.name}</h3>
                  <p className="text-gray-600 mb-3 text-sm">{hawker.address}</p>
                  <p className="text-gray-700 mb-4">{hawker.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{hawker.stallCount} stalls</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Open daily</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/search"
              className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              View All Hawker Centers
            </Link>
          </div>
        </div>
      </section>

      {/* Join Our Community */}
      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're a food lover or a hawker stall owner, become part of Singapore's largest hawker community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign Up as Consumer
            </Link>
            <Link
              to="/signup"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-600 transition-colors"
            >
              Register Your Stall
            </Link>
          </div>
        </div>
=======
      <FeaturedHawkerCenter />

      {/* CTA Section */}
      <section className="bg-red-600 text-center text-white py-12">
        <h2 className="text-2xl font-bold mb-4">Own a Hawker Stall?</h2>
        <p className="mb-6">
          Join our platform to showcase your stall, manage your menu, and
          connect with customers
        </p>
        <Link
          to="/signup-business"
          className="px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100"
        >
          Register Your Stall
        </Link>
>>>>>>> javen
      </section>
    </div>
  );
}