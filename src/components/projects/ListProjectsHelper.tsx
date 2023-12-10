import React from 'react';
import { ProjectFragment } from '@/graphql/generated/generated-types';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { SwiperNavButtons } from './SwiperNavButtons';

type ListProjectsHelperProps = {
  projects: ProjectFragment[];
};

const ListProjectsHelper: React.FC<ListProjectsHelperProps> = ({ projects }) => {
  return (
    <div className="m-5">
      <Swiper spaceBetween={50} slidesPerView={3}>
        {projects.map((project) => (
          <SwiperSlide key={project.id}>
            <div className="h-[200px] flex justify-center items-end rounded-xl border-sky-500 bg-blue-500">
              <p className="text-white">{project.name}</p>
            </div>
          </SwiperSlide>
        ))}
        <SwiperNavButtons />
      </Swiper>
    </div>
  );
};

export default ListProjectsHelper;
