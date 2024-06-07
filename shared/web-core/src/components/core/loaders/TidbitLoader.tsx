import { Grid4Cols } from '@dodao/web-core/components/core/grids/Grid4Cols';
import React from 'react';

const TidbitsSkeleton = () => {
  return (
    <>
      <Grid4Cols>
        {[0, 1, 2, 3].map((item, index) => (
          <div key={index} className="flex flex-col w-full bg-white shadow-lg rounded-lg overflow-hidden relative">
            <div className="p-4 w-full text-center">
              <h2 className="shine h-4 w-full mb-2 rounded"></h2>
              <p className="shine h-12 rounded"></p>
            </div>
            <div className="flex flex-wrap justify-end absolute top-2 left-2"></div>
          </div>
        ))}
      </Grid4Cols>
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

export default TidbitsSkeleton;
