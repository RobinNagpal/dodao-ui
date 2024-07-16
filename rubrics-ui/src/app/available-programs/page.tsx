'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ProgramsList: React.FC = () => {
  const [programs, setPrograms] = useState<{ id: string; name: string; details: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/ruberics/get-programs');
      const data = await response.json();

      if (response.ok) {
        setPrograms(data.body);
      } else {
        setError(data.body || 'Failed to fetch programs');
      }
    } catch (error) {
      setError('Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleProgramClick = (id: string) => {
    router.push(`/rate-program/${id}`);
  };

  if (loading) {
    return <p className="text-center mt-4">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-4">{error}</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl text-center font-extrabold mb-10">Programs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {programs.map((program) => (
          <div
            key={program.id}
            className="bg-white cursor-pointer shadow-lg rounded-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl"
            onClick={() => handleProgramClick(program.id)}
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-3 text-blue-700">{program.name}</h2>
              <p className="text-gray-600">{program.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgramsList;
