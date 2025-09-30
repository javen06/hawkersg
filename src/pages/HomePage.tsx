import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const { hawkerCenters, stalls } = useData();

  const featuredHawkers = hawkerCenters.slice(0, 3);
  const totalStalls = stalls.length;
  const averageRating = hawkerCenters.reduce((acc, h) => acc + h.rating, 0) / hawkerCenters.length;
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredHawkers.length);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredHawkers.length) % featuredHawkers.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 via-orange-600 to-red-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Singapore's
              <span className="block text-yellow-300">Hawker Heritage</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Find your favorite stalls, explore authentic local cuisine, and discover hidden gems in Singapore's iconic hawker centers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
              >
                Explore Hawker Centers
              </Link>
              <Link
                to="/signup"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-600 transition-colors"
              >
                Join Our Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://images.pexels.com/photos/5922220/pexels-photo-5922220.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Hawker Center 1"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://images.pexels.com/photos/5922242/pexels-photo-5922242.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Hawker Center 2"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://images.pexels.com/photos/5922265/pexels-photo-5922265.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Hawker Center 3"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://images.pexels.com/photos/5922280/pexels-photo-5922280.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Hawker Center 4"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://images.pexels.com/photos/5922295/pexels-photo-5922295.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Hawker Center 5"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          
          {/* Stats */}
          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://images.pexels.com/photos/5922220/pexels-photo-5922220.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Hawker Center 1"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://images.pexels.com/photos/5922242/pexels-photo-5922242.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Hawker Center 2"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://images.pexels.com/photos/5922265/pexels-photo-5922265.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Hawker Center 3"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://images.pexels.com/photos/5922280/pexels-photo-5922280.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Hawker Center 4"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://images.pexels.com/photos/5922295/pexels-photo-5922295.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Hawker Center 5"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          
          {/* Stats */}
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
        </div>
      </section>

      {/* Featured Hawker Centers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Hawker Centers</h2>
            <p className="text-xl text-gray-600">Discover the most popular destinations for authentic local cuisine</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredHawkers.map((hawker) => (
              )
              )
              }
    </div>
  );
}