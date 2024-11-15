'use client';
import styles from './ByteCollectionsGrid.module.scss';
import { useRouter, usePathname } from 'next/navigation';
import React from 'react';

export default function ArchiveToggle({ archive }: { archive?: boolean }) {
  const router = useRouter();
  const currentPath = usePathname();
  const handleToggle = () => {
    const newRoute = `${currentPath}?archive=${!archive}`;
    router.push(newRoute);
  };
  return (
    <>
      <div className="flex justify-end mb-4">
        <span className="mr-4 pt-1 text-md font-medium">See archived</span>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={archive} // Bind the checkbox to the state
            onChange={handleToggle}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </>
  );
}
