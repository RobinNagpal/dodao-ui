import React, { useEffect, useState } from 'react';
import { Rubric, RubricCell, RubricsPageProps } from '@/types/rubricsTypes/types';

const initialRubrics: Record<string, string[]> = {
  Content: [
    'Complete. The speaker clearly conveys the main idea and provides details that are relevant and...',
    'Generally complete. The speaker conveys the main idea, but does not provide adequate relevant details to...',
    'Somewhat incomplete. The main idea is unclear. Much of the detail is irrelevant.',
    'Incomplete. The main idea is unclear. Details are non-existent or random and irrelevant.',
  ],
  Comprehensibility: [
    'Comprehensible. The speaker uses appropriate language to convey the main idea of this item clearly.',
    'Generally comprehensible. The message is unclear in places. The language used is adequate to...',
    'Somewhat incomprehensible. The message could only be understood by a sympathetic native speaker. The...',
    'Incomprehensible.',
  ],
};

const RubricsPage: React.FC<RubricsPageProps> = ({ selectedProgramId }) => {
  const [rubrics, setRubrics] = useState<Record<string, string[]>>(initialRubrics);
  const [ratingHeaders, setRatingHeaders] = useState<string[]>(['Excellent', 'Good', 'Fair', 'Improvement']);
  const [criteriaOrder, setCriteriaOrder] = useState<string[]>(Object.keys(initialRubrics));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<{ type: 'rubric' | 'header' | 'criteria'; criteria: string | number; index: number; value: string }>({
    type: 'rubric',
    criteria: 'Content',
    index: -1,
    value: '',
  });
  const [columnScores, setColumnScores] = useState<number[]>(Array(ratingHeaders.length).fill(0));

  useEffect(() => {
    const formattedRubrics: Rubric[] = criteriaOrder.map((criteria) => ({
      name: 'Test',
      levels: ratingHeaders.map((header, index) => ({
        columnName: header,
        description: rubrics[criteria][index],
        score: columnScores[index],
      })),
      criteria: criteria,
    }));

    if (selectedProgramId) {
      console.log('Sending data:', formattedRubrics);
      handleSubmit(formattedRubrics);
    }
  }, [rubrics, ratingHeaders, criteriaOrder, selectedProgramId, columnScores]);

  const handleSubmit = async (data: Rubric[]) => {
    try {
      const response = await fetch('http://localhost:3004/api/ruberics/create-rubrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId: selectedProgramId,
          rubrics: data,
        }),
      });

      if (response.ok) {
        console.log('Rubrics submitted successfully', response);
      } else {
        throw new Error('Failed to submit rubrics');
      }
    } catch (error) {
      console.error('Error submitting rubrics:', error);
    }
  };

  const handleEditClick = (type: 'rubric' | 'header' | 'criteria', criteria: string | number, index: number) => {
    if (type === 'header') {
      setCurrentEdit({
        type,
        criteria,
        index,
        value: ratingHeaders[criteria as number],
      });
    } else if (type === 'criteria') {
      setCurrentEdit({
        type,
        criteria,
        index,
        value: criteria as string,
      });
    } else {
      setCurrentEdit({
        type,
        criteria,
        index,
        value: rubrics[criteria as string][index],
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (value: string) => {
    setCurrentEdit((prevEdit) => ({
      ...prevEdit,
      value,
    }));
  };

  const handleSave = () => {
    if (currentEdit.type === 'header') {
      setRatingHeaders((prevHeaders) => prevHeaders.map((header, index) => (index === currentEdit.criteria ? currentEdit.value : header)));
    } else if (currentEdit.type === 'criteria') {
      const updatedRubrics = { ...rubrics };
      const currentCriteriaName = currentEdit.criteria as string;
      const newCriteriaName = currentEdit.value;

      if (currentCriteriaName !== newCriteriaName) {
        const updatedCriteria = updatedRubrics[currentCriteriaName];
        delete updatedRubrics[currentCriteriaName];
        updatedRubrics[newCriteriaName] = updatedCriteria;

        setCriteriaOrder((prevOrder) => prevOrder.map((criteria) => (criteria === currentCriteriaName ? newCriteriaName : criteria)));
      }

      setRubrics(updatedRubrics);
    } else {
      setRubrics((prevRubrics) => {
        const updatedCriteria = [...prevRubrics[currentEdit.criteria as string]];
        updatedCriteria[currentEdit.index] = currentEdit.value;
        return {
          ...prevRubrics,
          [currentEdit.criteria as string]: updatedCriteria,
        };
      });
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleAddCriteria = () => {
    const newCriteriaName = `New Criteria ${Object.keys(rubrics).length + 1}`;
    setRubrics((prevRubrics) => ({
      ...prevRubrics,
      [newCriteriaName]: [
        'Functions, grammar, and vocabulary are...',
        'Minor problems in usage do not distort...',
        'Problems in usage significantly distort...',
        'Problems in usage completely distort...',
      ],
    }));
    setCriteriaOrder((prevOrder) => [...prevOrder, newCriteriaName]);
  };

  const handleDeleteCriteria = (criteria: string) => {
    const updatedRubrics = { ...rubrics };
    delete updatedRubrics[criteria];
    setRubrics(updatedRubrics);
    setCriteriaOrder((prevOrder) => prevOrder.filter((crit) => crit !== criteria));
  };

  const handleScoreChange = (index: number, score: number) => {
    setColumnScores((prevScores) => [...prevScores.slice(0, index), score, ...prevScores.slice(index + 1)]);
  };

  const getHeaderColorClass = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-green-500';
      case 1:
        return 'bg-yellow-400';
      case 2:
        return 'bg-yellow-600';
      case 3:
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="container mx-auto py-8 p-4">
      <h1 className="text-3xl text-center font-bold mb-4">Create Rubrics</h1>

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white border-collapse border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b"></th>
              {ratingHeaders.map((header, index) => (
                <th key={index} className={`py-2 px-4 border-b cursor-pointer text-white ${getHeaderColorClass(index)}`}>
                  <div className="overflow-auto max-h-24" onClick={() => handleEditClick('header', index, -1)}>
                    {header}
                    <br />
                  </div>

                  <input
                    type="number"
                    min={0}
                    max={10}
                    className="w-14 border rounded p-2 text-center mb-2 text-black"
                    placeholder="Score"
                    value={columnScores[index]}
                    onChange={(e) => handleScoreChange(index, parseInt(e.target.value))}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteriaOrder.map((criteria) => (
              <tr key={criteria}>
                <td className="py-2 px-4 border-r border-b font-bold cursor-pointer max-w-xs break-words relative">
                  <div onClick={() => handleEditClick('criteria', criteria, -1)} className="overflow-y-auto max-h-24">
                    {criteria}
                  </div>
                  <button onClick={() => handleDeleteCriteria(criteria)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full">
                    &times;
                  </button>
                </td>
                {rubrics[criteria].map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="py-2 px-4 border-r border-b cursor-pointer max-w-xs break-words"
                    onClick={() => handleEditClick('rubric', criteria, cellIndex)}
                  >
                    <div className="overflow-y-auto max-h-24">{cell}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center">
        <button className="bg-blue-500 mt-2 text-white py-2 px-4 rounded-full flex items-center justify-center" onClick={handleAddCriteria}>
          +
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Text</h2>
            <textarea className="w-full border rounded p-2 mb-4" value={currentEdit.value} onChange={(e) => handleInputChange(e.target.value)} rows={4} />
            <div className="flex justify-end">
              <button className="bg-red-500 text-white py-2 px-4 rounded mr-2" onClick={handleCancel}>
                Cancel
              </button>
              <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RubricsPage;
