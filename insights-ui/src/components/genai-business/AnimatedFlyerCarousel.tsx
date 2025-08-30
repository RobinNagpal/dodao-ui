'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface FlyerData {
  id: string;
  title: string;
  imageUrl: string;
  gradient: string;
}

const flyerData: FlyerData[] = [
  {
    id: 'data-analytics',
    title: 'GenAI in Data Analytics',
    imageUrl: '/images/flyers/analytics.png',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'customer-support',
    title: 'GenAI in Customer Support',
    imageUrl: '/images/flyers/customer.png',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'personalization',
    title: 'GenAI in Personalization',
    imageUrl: '/images/flyers/personalization.png',
    gradient: 'from-orange-200 to-red-200', // lighter gradient for white background
  },
  {
    id: 'education',
    title: 'GenAI in Education',
    imageUrl: '/images/flyers/education.png',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'presentations',
    title: 'GenAI in Presentations',
    imageUrl: '/images/flyers/presentation.png',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'avatars',
    title: 'GenAI in Avatars',
    imageUrl: '/images/flyers/avatars.png',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'animations',
    title: 'GenAI in Animations',
    imageUrl: '/images/flyers/animations.png',
    gradient: 'from-rose-200 to-pink-200', // lighter gradient for white background
  },
];

export default function AnimatedFlyerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate through flyers
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % flyerData.length);
    }, 3000); // 3 second delay

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % flyerData.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + flyerData.length) % flyerData.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="relative py-12 bg-gradient-to-b from-gray-800/50 to-gray-900/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Carousel Container */}
        <div className="relative">
          {/* Main Carousel */}
          <div className="flex items-center justify-center" onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 z-10 p-3 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 text-white hover:bg-gray-700/80 transition-all duration-300 hover:scale-110"
              aria-label="Previous flyer"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>

            {/* Flyer Display Area */}
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main Flyer */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <div className={`absolute inset-0 bg-gradient-to-br ${flyerData[currentIndex].gradient} opacity-10`} />
                <img
                  src={flyerData[currentIndex].imageUrl || '/placeholder.svg'}
                  alt={flyerData[currentIndex].title}
                  className="w-full h-auto object-cover transition-all duration-700 ease-in-out"
                  style={{ aspectRatio: '1414/2000' }} // Original flyer aspect ratio (1414x2000)
                />

                {/* Overlay with title */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{flyerData[currentIndex].title}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${flyerData[currentIndex].gradient}`} />
                    <span className="text-sm text-gray-300">
                      {currentIndex + 1} of {flyerData.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Side Flyers (Circular Effect) */}
              <div className="absolute top-1/2 -translate-y-1/2 -left-20 w-16 h-20 opacity-30 transform -rotate-12 transition-all duration-700">
                <img
                  src={flyerData[(currentIndex - 1 + flyerData.length) % flyerData.length].imageUrl || '/placeholder.svg'}
                  alt="Previous flyer"
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 -right-20 w-16 h-20 opacity-30 transform rotate-12 transition-all duration-700">
                <img
                  src={flyerData[(currentIndex + 1) % flyerData.length].imageUrl || '/placeholder.svg'}
                  alt="Next flyer"
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={goToNext}
              className="absolute right-4 z-10 p-3 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 text-white hover:bg-gray-700/80 transition-all duration-300 hover:scale-110"
              aria-label="Next flyer"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 gap-2">
            {flyerData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? `bg-gradient-to-r ${flyerData[currentIndex].gradient} scale-125` : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to flyer ${index + 1}`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div
                className={`h-1 rounded-full bg-gradient-to-r ${flyerData[currentIndex].gradient} transition-all duration-300`}
                style={{ width: `${((currentIndex + 1) / flyerData.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Auto-play indicator */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <span>{isAutoPlaying ? 'Auto-playing' : 'Paused'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
