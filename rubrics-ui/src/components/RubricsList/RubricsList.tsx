'use client';
import React, { useEffect, useState } from 'react';
import Card from '@dodao/web-core/components/core/card/Card';

const RubricsList = () => {
  const [rubrics, setRubrics] = useState<{ id: string; name: string; summary: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRubrics = async () => {
      try {
        const response = await fetch('/api/rubrics');
        const data = await response.json();

        if (response.ok) {
          setRubrics(data.body);
        } else {
          setError(data.body || 'Failed to fetch rubrics');
        }
      } catch (error) {
        setError('Failed to fetch rubrics');
      } finally {
        setLoading(false);
      }
    };

    fetchRubrics();
  }, []);

  if (loading) {
    return <p className="text-center mt-4">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-4">{error}</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl text-center font-extrabold mb-10">Rubrics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {rubrics.map((rubric) => (
          <Card key={rubric.id} className="cursor-pointer">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 text-blue-700">{rubric.name}</h2>
              <p className="text-gray-600">{rubric.summary}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RubricsList;
