// import React from 'react';

// interface GuideSkeletonProps {
//   count: number;
// }

// const GuideSkeleton: React.FC<GuideSkeletonProps> = ({ count }) => {
//   const rowCount = Math.ceil(count / 3);

//   const rows = Array.from({ length: rowCount }, (_, rowIndex) => {
//     const startIndex = rowIndex * 3;
//     const endIndex = startIndex + 3;
//     const cards = Array.from({ length: 3 }).map((_, i) => {
//       const cardIndex = startIndex + i;
//       if (cardIndex < count) {
//         return (
//           <div key={cardIndex} className="animate-pulse m-3 mb-8 flex-1">
//             <div className="rounded-lg bg-white h-60 w-full" />
//             <div className="mt-4 h-4 bg-white rounded w-3/4" />
//             <div className="mt-2 h-4 bg-white rounded w-1/2" />
//           </div>
//         );
//       }
//       return null;
//     });
//     if (count % 3 !== 0 && rowIndex === rowCount - 1) {
//       const emptyCardCount = 3 - (count % 3);
//       for (let j = 0; j < emptyCardCount; j++) {
//         cards.push(
//           <div key={`empty-${j}`} className="flex-1 invisible" />
//         );
//       }
//     }

//     return (
//       <div key={rowIndex} className="flex flex-wrap justify-between">
//         {cards}
//       </div>
//     );
//   });

//   return <>{rows}</>;
// };

// export default GuideSkeleton;


// import React from 'react';

// interface GuideSkeletonProps {
//   count: number;
// }

// const GuideSkeleton: React.FC<GuideSkeletonProps> = ({ count }) => {
//   const rowCount = Math.ceil(count / 3);

//   const rows = Array.from({ length: rowCount }, (_, rowIndex) => {
//     const cards = Array.from({ length: 3 }).map((_, i) => {
//       if (i < count) {
//         return (
//           <div key={i} className="animate-pulse m-3 mb-8 flex-1">
//             <div className="rounded-lg bg-white h-60 w-full" />
//             <div className="mt-4 h-4 bg-white rounded w-3/4" />
//             <div className="mt-2 h-4 bg-white rounded w-1/2" />
//           </div>
//         );
//       }
//       return null;
//     });

//     return (
//       <div key={rowIndex} className="flex flex-wrap justify-between">
//         {cards}
//       </div>
//     );
//   });

//   return <>{rows}</>;
// };

// export default GuideSkeleton;

import React from 'react';

const GuideSkeleton: React.FC = () => {
  const cards = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
    <div key={index} className="animate-pulse m-3 mb-8 flex-1" style={{ flexBasis: 'calc(33.33% - 2rem)' }}>
      <div className="rounded-lg bg-white h-60 w-full" />
      <div className="mt-4 h-4 bg-white rounded w-3/4" />
      <div className="mt-2 h-4 bg-white rounded w-1/2" />
    </div>
  ));

  return (
    <div className="flex flex-wrap justify-between">
      {cards}
    </div>
  );
};

export default GuideSkeleton;
