import React, { useEffect, useState, useRef, useCallback } from 'react';

interface ReloadingDataProps {
  loadDataFn: () => Promise<any>;
  needsLoading: boolean;
  reloadDurationInSec?: number;
  message?: string;
  onLoadComplete?: (data: any) => void;
}

export default function ReloadingData({ loadDataFn, needsLoading, reloadDurationInSec = 20, message = 'Refreshing data', onLoadComplete }: ReloadingDataProps) {
  const [countdown, setCountdown] = useState(reloadDurationInSec);
  const [isLoading, setIsLoading] = useState(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const handleReload = useCallback(async () => {
    // Prevent overlapping reload calls
    if (isLoading) return;

    setIsLoading(true);
    try {
      const data = await loadDataFn();
      onLoadComplete?.(data);
    } catch (error) {
      console.error('Error reloading data:', error);
    } finally {
      setIsLoading(false);
      // Reset the countdown after a reload
      setCountdown(reloadDurationInSec);
    }
  }, [loadDataFn, isLoading, onLoadComplete, reloadDurationInSec]);

  useEffect(() => {
    // Clear any existing interval
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (needsLoading) {
      // Reset countdown initially
      setCountdown(reloadDurationInSec);

      // Set up polling that decrements the countdown every second
      intervalIdRef.current = setInterval(() => {
        setCountdown((prevCount) => {
          // When countdown reaches 1, call loadDataFn and reset countdown
          if (prevCount <= 1) {
            handleReload();
            return reloadDurationInSec;
          }
          return prevCount - 1;
        });
      }, 1000);
    }

    // Cleanup the interval when needsLoading changes or component unmounts
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [needsLoading, reloadDurationInSec, handleReload]);

  // If needsLoading is false, do not render the component
  if (!needsLoading) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 bg-blue-50 p-2 rounded-md">
      <div className="text-sm text-gray-700">{isLoading ? 'Updating...' : `${message} in ${countdown} sec`}</div>
    </div>
  );
}
