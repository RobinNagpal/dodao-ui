'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@dodao/web-core/components/core/card/Card';

const ProgramsList: React.FC = () => {
  const [programs, setPrograms] = useState<{ id: string; name: string; details: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchPrograms = async () => {
    try {
      const response = await fetch('http://localhost:3004/api/programs');
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
    router.push(`/program-details/`);
  };

  if (loading) {
    return <p className="text-center mt-4">Loading...</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl text-center font-extrabold mb-10">Programs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {programs.map((program) => (
          <Card key={program.id} className="cursor-pointer" onClick={() => handleProgramClick(program.id)}>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-3 " style={{ color: 'var(--primary-color)' }}>
                {program.name}
              </h2>
              <p>{program.details}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProgramsList;
