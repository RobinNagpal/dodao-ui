'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import axios from 'axios';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

interface Ticker {
  tickerKey: string;
  sector: string;
  industryGroup: string;
}

export default function AllTickersTable() {
  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tickerToDelete, setTickerToDelete] = useState<string | null>(null);

  const router = useRouter(); // ✅ Next.js Router for navigation

  useEffect(() => {
    fetchTickers();
  }, []);

  const fetchTickers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/ticker`);
      console.log('Fetched tickers:', response.data);
      setTickers(response.data.tickers || []);
    } catch (error) {
      console.error('Error fetching tickers:', error);
      alert('Failed to fetch tickers.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ticker: string) => {
    router.push(`/public-equities/ticker/edit/${ticker}`); // ✅ Navigate using Next.js router
  };

  const handleDeleteClick = (ticker: string) => {
    setTickerToDelete(ticker);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!tickerToDelete) return;

    try {
      await axios.delete(`/api/ticker/${tickerToDelete}`);
      setTickers((prev) => prev.filter((t) => t.tickerKey !== tickerToDelete));
      alert('Ticker deleted successfully.');
    } catch (error) {
      console.error('Error deleting ticker:', error);
      alert('Failed to delete ticker.');
    } finally {
      setShowConfirmModal(false);
      setTickerToDelete(null);
    }
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-semibold mb-4">All Tickers</h2>

      {loading ? (
        <p>Loading tickers...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead>
            <tr>
              <th className="p-3 border text-left">Ticker</th>
              <th className="p-3 border text-left">Sector</th>
              <th className="p-3 border text-left">Industry Group</th>
              <th className="p-3 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-3 border text-center italic">
                  No tickers found.
                </td>
              </tr>
            ) : (
              tickers.map((ticker) => (
                <tr key={ticker.tickerKey} className="border">
                  <td className="p-3 border text-left">{ticker.tickerKey}</td>
                  <td className="p-3 border text-left">{ticker.sector}</td>
                  <td className="p-3 border text-left">{ticker.industryGroup}</td>
                  <td className="p-3 border text-left flex gap-2">
                    <IconButton onClick={() => handleEdit(ticker.tickerKey)} iconName={IconTypes.Edit} removeBorder={true} />
                    <IconButton onClick={() => handleDeleteClick(ticker.tickerKey)} iconName={IconTypes.Trash} removeBorder={true} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Confirmation Modal for Deleting */}
      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Ticker"
          confirmationText="Are you sure you want to delete this ticker?"
          confirming={loading}
          askForTextInput={false}
        />
      )}
    </PageWrapper>
  );
}
