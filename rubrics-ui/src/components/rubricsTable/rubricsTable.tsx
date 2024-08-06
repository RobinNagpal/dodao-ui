import React, { useEffect, useState } from 'react';
import { Rubric, RubricCell, RubricsPageProps, rubricRatingHeader } from '@/types/rubricsTypes/types';
import RubricCriteria from '@/components/RubricCriteria/RubricCriteria';
import RubricLevel from '@/components/RubricLevel/RubricLevel';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import RubricDetails from '@/components/RubricDetails/RubricDetails';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/src/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
const initialRubrics: Record<string, string[]> = {
  Content: [
    'Complete. The speaker clearly conveys the main idea',
    'Generally complete. The speaker conveys the main idea,',
    'Somewhat incomplete. The main idea is unclear',
    'Incomplete. The main idea is unclear. and ',
  ],
};

const RubricsPage: React.FC<RubricsPageProps> = ({ selectedProgramId, isEditAccess, rateRubricsFormatted, writeAccess, rubricName }) => {
  const [rubrics, setRubrics] = useState<Record<string, string[]>>(initialRubrics);
  const [ratingHeaders, setRatingHeaders] = useState<string[]>(['Excellent', 'Good', 'Fair', 'Improvement']);
  const [criteriaOrder, setCriteriaOrder] = useState<string[]>(Object.keys(initialRubrics));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<{ type: 'rubric' | 'header' | 'criteria'; criteria: string | number; index: number; value: string }>({
    type: 'rubric',
    criteria: 'Content',
    index: -1,
    value: '',
  });

  const [columnScores, setColumnScores] = useState<number[]>(Array(ratingHeaders.length).fill(0));
  const [criteriaToDelete, setCriteriaToDelete] = useState<string | null>(null);
  const dropdownItems: EllipsisDropdownItem[] = [
    { label: 'Edit', key: 'edit' },
    { label: 'Rate', key: 'rate' },
  ];
  const [rubricDetails, setRubricDetails] = useState<{
    name: string;
    summary: string;
    description: string;
  }>({
    name: '',
    summary: '',
    description: '',
  });
  const { showNotification } = useNotificationContext();
  const router = useRouter();
  useEffect(() => {
    if (!rubricDetails.name || !rubricDetails.summary) {
      return;
    }
    const formattedRubrics: Rubric[] = criteriaOrder.map((criteria) => ({
      name: rubricDetails.name,
      summary: rubricDetails.summary,
      description: rubricDetails.description,
      levels: ratingHeaders.map((header, idx) => ({
        columnName: header,
        description: rubrics[criteria][idx],
        score: columnScores[idx],
      })),
      criteria: criteria,
    }));

    if (selectedProgramId && isEditAccess) {
      console.log('Sending data:', formattedRubrics);
      handleSubmit(formattedRubrics);
    }
  }, [rubrics, ratingHeaders, criteriaOrder, selectedProgramId, columnScores]);

  const handleSubmit = async (data: Rubric[]) => {
    try {
      const response = await fetch('/api/rubrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId: selectedProgramId,
          rubric: data,
        }),
      });
      console.log(response);
    } catch (error) {
      console.error('Error submitting rubrics:', error);
    }
  };

  const handleEditClick = (type: 'rubric' | 'header' | 'criteria', criteria: string | number, index: number) => {
    if (isEditAccess) {
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
    }
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
    if (isEditAccess) {
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
    }
  };

  const handleDeleteCriteria = (criteria: string) => {
    if (isEditAccess) {
      setCriteriaToDelete(criteria);
      setIsDeleteConfirm(true);
    }
  };

  const confirmDeleteCriteria = () => {
    if (criteriaToDelete) {
      const updatedRubrics = { ...rubrics };
      delete updatedRubrics[criteriaToDelete];
      setRubrics(updatedRubrics);
      setCriteriaOrder((prevOrder) => prevOrder.filter((crit) => crit !== criteriaToDelete));
    }
    setIsDeleteConfirm(false);
    setCriteriaToDelete(null);
  };

  const cancelDelete = () => {
    setIsDeleteConfirm(false);
    setCriteriaToDelete(null);
  };

  const handleScoreChange = async (index: number, score: number) => {
    setColumnScores((prevScores) => [...prevScores.slice(0, index), score, ...prevScores.slice(index + 1)]);
    if (!isEditAccess) {
      const formattedRubrics: Rubric[] = criteriaOrder.map((criteria) => ({
        name: 'Test',
        levels: ratingHeaders.map((header, idx) => ({
          columnName: header,
          description: rubrics[criteria][idx],
          score: columnScores[idx],
        })),
        criteria: criteria,
      }));

      if (selectedProgramId) {
        await handleSubmit(formattedRubrics);
      }
    }
  };
  const rateRubric = rateRubricsFormatted?.rubric;
  const rateCriteriaOrder = rateRubricsFormatted?.criteriaOrder;
  const rubricRatingHeaders: rubricRatingHeader[] = rateRubricsFormatted?.ratingHeaders ?? [];
  const rubricId = rateRubricsFormatted?.rubricId;

  const handleDropdownSelect = (key: string) => {
    if (key === 'rate') {
      router.push(`/rate-rubric/${rubricId}`);
    }
  };
  return (
    <div className="container mx-auto py-8 p-4">
      <div className="flex items-center pb-8 align-center justify-center">
        {!writeAccess && <h1 className="text-3xl text-center font-bold p-2">{rubricName}</h1>}
        {!writeAccess && <EllipsisDropdown items={dropdownItems} onSelect={handleDropdownSelect} />}
      </div>
      <h1 className="text-3xl text-center font-bold mb-4">{writeAccess ? (isEditAccess ? 'Edit Rubrics' : 'Giving Feedback on') : ''}</h1>
      <h1 className="text-2xl  p-2 text-center mb-2">{writeAccess ? (isEditAccess ? '' : rateRubricsFormatted?.programs[0].name) : ''}</h1>
      <RubricDetails rubricDetails={rubricDetails} setRubricDetails={setRubricDetails} isEditAccess={isEditAccess} />

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white border-collapse border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b"></th>
              {!isEditAccess
                ? rubricRatingHeaders?.map((header, index) => (
                    <RubricLevel
                      key={index}
                      header={header.header}
                      index={index}
                      score={header.score}
                      isEditAccess={isEditAccess}
                      onScoreChange={handleScoreChange}
                      onEditClick={handleEditClick}
                    />
                  ))
                : ratingHeaders?.map((header, index) => (
                    <RubricLevel
                      key={index}
                      header={header}
                      index={index}
                      score={columnScores[index]}
                      isEditAccess={isEditAccess}
                      onScoreChange={handleScoreChange}
                      onEditClick={handleEditClick}
                    />
                  ))}
            </tr>
          </thead>
          <tbody>
            {!isEditAccess
              ? rateCriteriaOrder?.map((criteria) => (
                  <RubricCriteria
                    key={criteria}
                    criteria={criteria}
                    rubrics={rateRubric}
                    isEditAccess={isEditAccess}
                    onEditClick={handleEditClick}
                    onDeleteCriteria={handleDeleteCriteria}
                    rubricRatingHeaders={rubricRatingHeaders}
                    rubricId={rubricId}
                    writeAccess={writeAccess}
                  />
                ))
              : criteriaOrder?.map((criteria) => (
                  <RubricCriteria
                    key={criteria}
                    criteria={criteria}
                    rubrics={rubrics}
                    isEditAccess={isEditAccess}
                    onEditClick={handleEditClick}
                    onDeleteCriteria={handleDeleteCriteria}
                  />
                ))}
          </tbody>
        </table>
      </div>
      {isEditAccess && (
        <div className="flex justify-center">
          <button className="bg-blue-500 mt-2 text-white py-2 px-4 rounded-full flex items-center justify-center" onClick={handleAddCriteria}>
            +
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="bg-white p-4 rounded shadow-md relative z-10">
            <h2 className="text-2xl font-bold mb-4">Edit Rubric</h2>
            <textarea className="border p-2 w-full h-40 mb-4" value={currentEdit.value} onChange={(e) => handleInputChange(e.target.value)}></textarea>
            <div className="flex justify-end">
              <button onClick={handleSave} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 mr-2">
                Save
              </button>
              <button onClick={handleCancel} className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="bg-white p-4 rounded shadow-md relative z-10">
            <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this criteria?</p>
            <div className="flex justify-end mt-4">
              <button onClick={confirmDeleteCriteria} className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-700 mr-2">
                Delete
              </button>
              <button onClick={cancelDelete} className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RubricsPage;
