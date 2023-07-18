import React from 'react';

const GuideSkeleton = () => {
  const skeletonArray = new Array(9).fill(0);

  return (
    <>
      <div className="container  grid grid-cols-3 gap-10  ">
        {skeletonArray.map((item, index) => (
          <div key={index} className="flex flex-col w-full bg-white shadow-lg rounded-lg overflow-hidden relative">
            <div className="shine w-full h-[200px]"></div>
            <div className="p-4 text-center">
              <h2 className="shine h-6 w-full mb-2 rounded"></h2>
              <p className="shine h-16 rounded"></p>
            </div>
            <div className="flex flex-wrap justify-end absolute top-2 left-2">
              <div className="shine w-20 h-5 rounded mb-1"></div>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes shine {
          to {
            background-position: right -40px top 0;
          }
        }

        .shine {
          background-color: #e2e5e7;
          background-image: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0));
          background-size: 40px 100%;
          background-repeat: no-repeat;
          background-position: left -40px top 0;
          animation: shine 1s ease infinite;
        }
      `}</style>
    </>
  );
};

export default GuideSkeleton;
