import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { ProjectFragment } from '@/graphql/generated/generated-types';
import { Swiper, SwiperSlide } from 'swiper/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { SwiperNavButtons } from './SwiperNavButtons';
import 'react-loading-skeleton/dist/skeleton.css';
import 'swiper/css';
import 'swiper/css/pagination';
import styles from './ListProjectsHelper.module.scss';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';

type ListProjectsHelperProps = {
  projects: ProjectFragment[];
  onShowEditModal: (project: ProjectFragment) => void;
};

const ListProjectsHelper: React.FC<ListProjectsHelperProps> = ({ projects, onShowEditModal }) => {
  const [loading, setLoading] = useState(false);
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="my-5 overflow-hidden">
      <Swiper
        spaceBetween={10}
        slidesPerView={5}
        breakpoints={{
          0: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          140: {
            slidesPerView: 1.25,
            spaceBetween: 10,
          },
          240: {
            slidesPerView: 1.5,
            spaceBetween: 10,
          },
          340: {
            slidesPerView: 1.75,
            spaceBetween: 10,
          },
          440: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          480: {
            slidesPerView: 2.25,
            spaceBetween: 10,
          },
          540: {
            slidesPerView: 2.5,
            spaceBetween: 20,
          },
          640: {
            slidesPerView: 2.5,
            spaceBetween: 20,
          },
          680: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          740: {
            slidesPerView: 3.5,
            spaceBetween: 20,
          },
          840: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
          1280: {
            slidesPerView: 5,
            spaceBetween: 30,
          },
        }}
      >
        {projects.map((project) => (
          <SwiperSlide key={project.id}>
            {loading ? (
              <SkeletonTheme baseColor="#64748b" enableAnimation={true}>
                <Skeleton height={250} />
              </SkeletonTheme>
            ) : (
              //
              <Link href={`/projects/view/${project.id}/tidbit-collections`}>
                <div className={`h-[250px] ${styles.card} px-1.5 pt-2 rounded-lg flex flex-col gap-2.5 overflow-hidden shadow-xl`}>
                  <div className="rounded relative">
                    <img
                      src="https://picsum.photos/500/300"
                      alt={project.name}
                      className="h-[150px] w-full object-cover rounded shadow-[0_10px_13px_-5px_rgba(0,0,0,0.6)]"
                    />
                    <div
                      className="absolute top-0 right-0 m-2"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                    >
                      <PrivateEllipsisDropdown
                        items={threeDotItems}
                        onSelect={async (key) => {
                          if (key === 'edit') {
                            onShowEditModal(project);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className={`${styles.header} mx-2`}>
                    <div className="font-bold">{project.name}</div>
                    <div className={`text-sm ${styles.details}`}>Level 1</div>
                  </div>
                </div>
              </Link>
            )}
          </SwiperSlide>
        ))}
        {!loading && <SwiperNavButtons />}
      </Swiper>
    </div>
  );
};

export default ListProjectsHelper;
