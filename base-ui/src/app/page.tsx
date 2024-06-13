"use client";

import React from "react";

// Home component
const Home: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={() => console.log("Get Started Clicked!")}
        style={{ backgroundColor: "var(--primary-color)" }}
        className="px-5 py-2.5 text-white bg-blue-500 border-none rounded-md cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
      >
        Get Started
      </button>
    </div>
  );
};

export default Home;
