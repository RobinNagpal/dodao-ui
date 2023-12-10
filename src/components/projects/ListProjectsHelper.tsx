import React, { useEffect, useState } from 'react';
import { ProjectFragment } from '@/graphql/generated/generated-types';
import { Swiper, SwiperSlide } from 'swiper/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import 'swiper/css';
import 'swiper/css/pagination';
import { SwiperNavButtons } from './SwiperNavButtons';

type ListProjectsHelperProps = {
  projects: ProjectFragment[];
};

const ListProjectsHelper: React.FC<ListProjectsHelperProps> = ({ projects }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="m-5">
      <Swiper spaceBetween={50} slidesPerView={5}>
        {projects.map((project) => (
          <SwiperSlide key={project.id}>
            {loading ? (
              <SkeletonTheme baseColor="#64748b" enableAnimation={true}>
                <Skeleton height={200} />
              </SkeletonTheme>
            ) : (
              <div className="h-[200px] flex justify-center items-end rounded-xl bg-blue-500">
                <p className="text-white">{project.name}</p>
              </div>
            )}
          </SwiperSlide>
        ))}
        {!loading && <SwiperNavButtons />}
      </Swiper>
    </div>
  );
};

export default ListProjectsHelper;
