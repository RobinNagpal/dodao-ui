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
    if (isLoading) return;

    setIsLoading(true);
    try {
      const data = await loadDataFn();
      onLoadComplete?.(data);
    } catch (error) {
      console.error('Error reloading data:', error);
    } finally {
      setIsLoading(false);
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
          if (prevCount <= 1) {
            // Schedule handleReload asynchronously to avoid updating parent during render
            setTimeout(() => {
              handleReload();
            }, 0);
            return reloadDurationInSec;
          }
          return prevCount - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [needsLoading, reloadDurationInSec, handleReload]);

  if (!needsLoading) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 block-bg-color p-2 rounded-md">
      <div className="text-sm text-color">{isLoading ? 'Updating...' : `${message} in ${countdown} sec`}</div>
    </div>
  );
}
