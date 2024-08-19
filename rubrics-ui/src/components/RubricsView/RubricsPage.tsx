import RubricCriteria from './RubricCriteria';
import RubricLevel from './RubricLevel';
import { CriteriaMapping, RatingHeader, rubricRatingHeader, RubricsPageProps } from '@/types/rubricsTypes/types';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/src/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const initialRubrics: Record<string, string[]> = {
  Criteria: [
    'Complete. The speaker clearly conveys the main idea',
    'Generally complete. The speaker conveys the main idea,',
    'Somewhat incomplete. The main idea is unclear',
    'Incomplete. The main idea is unclear. and ',
  ],
};

const RubricsPage: React.FC<RubricsPageProps> = ({
  selectedProgramId,
  isEditAccess,
  rateRubricsFormatted,
  writeAccess,
  rubricName,
  rubricDetails,
  rubricId,
  editRubricsFormatted,
  isGlobalAccess,
  editRubrics,
  editCriteriaOrder,
  editRatingHeaders,
  editCriteriaIds,
  rubricCellIds,
}) => {
  const [rubrics, setRubrics] = useState<Record<string, string[]>>(editRubrics || initialRubrics);
  const [criteriaOrder, setCriteriaOrder] = useState<string[]>(Object.keys(editRubrics || initialRubrics));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<{ type: 'rubric' | 'header' | 'criteria'; criteria: string | number; index: number; value: string }>({
    type: 'rubric',
    criteria: 'Content',
    index: -1,
    value: '',
  });
  const [changedHeaderId, setChangedHeaderId] = useState<string | null>(null);
  const [ratingHeaders, setRatingHeaders] = useState<RatingHeader[]>(editRatingHeaders);
  const [criteriaToDelete, setCriteriaToDelete] = useState<string | null>(null);
  const [editCriteria, setEditCriteria] = useState<{ name: string; id: string }[]>(
    isGlobalAccess
      ? Object.entries(editCriteriaOrder).map(([name, id]) => ({
          name,
          id: id as string,
        }))
      : [
          { name: 'Criteria 1', id: 'id-1' },
          { name: 'Criteria 2', id: 'id-2' },
        ]
  );

  const dropdownItems: EllipsisDropdownItem[] = [
    { label: 'Edit', key: 'edit' },
    { label: 'Rate', key: 'rate' },
  ];
  const updateRubricLevel = async () => {
    try {
      if (changedHeaderId !== null) {
        const updatedLevel = ratingHeaders.find((header) => header.id === changedHeaderId);

        if (updatedLevel) {
          await fetch(`/api/rubrics/${rubricId}/level/${changedHeaderId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              columnName: updatedLevel.header,
              score: updatedLevel.score,
              description: `Description for ${updatedLevel.header}`,
            }),
          });

          console.log(`Rubric level with ID ${changedHeaderId} updated successfully`);
        }
      }
    } catch (error) {
      console.error('Failed to update rubric level', error);
    }
  };

  const router = useRouter();
  useEffect(() => {
    updateRubricLevel();
  }, [ratingHeaders, rubricId, changedHeaderId]);

  const handleEditClick = (type: 'rubric' | 'header' | 'criteria', criteria: string | number, index: number, newValue?: string) => {
    if (isEditAccess) {
      if (type === 'header') {
        setCurrentEdit({
          type,
          criteria,
          index,
          value: ratingHeaders[criteria as number].header,
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
  const [changedCriteriaDetails, setChangedCriteriaDetails] = useState<{
    id: string;
    newValue: string;
  }>({
    id: '',
    newValue: '',
  });

  const [criteriaToId, setCriteriaToId] = useState<CriteriaMapping>(
    editCriteria.reduce((acc, { name, id }) => {
      acc[name] = id;
      return acc;
    }, {} as CriteriaMapping)
  );
  const handleSave = async () => {
    try {
      if (currentEdit.type === 'header') {
        const newHeaderId = ratingHeaders[currentEdit.criteria as number].id;

        setRatingHeaders((prevHeaders) =>
          prevHeaders.map((header, index) => (index === currentEdit.criteria ? { ...header, header: currentEdit.value as string } : header))
        );

        setChangedHeaderId(newHeaderId);
      } else if (currentEdit.type === 'criteria') {
        const updatedEditCriteria = [...editCriteria];
        const currentCriteriaName = currentEdit.criteria as string;
        const newCriteriaName = currentEdit.value as string;

        const criteriaIndex = updatedEditCriteria.findIndex((criterion) => criterion.name === currentCriteriaName);

        if (criteriaIndex !== -1 && currentCriteriaName !== newCriteriaName) {
          updatedEditCriteria[criteriaIndex] = {
            ...updatedEditCriteria[criteriaIndex],
            name: newCriteriaName,
          };

          const updatedCriteriaOrder = criteriaOrder.map((name) => (name === currentCriteriaName ? newCriteriaName : name));

          setRubrics((prevRubrics) => {
            const { [currentCriteriaName]: criteriaValues, ...rest } = prevRubrics;
            return {
              ...rest,
              [newCriteriaName]: criteriaValues,
            };
          });

          setEditCriteria(updatedEditCriteria);
          setCriteriaOrder(updatedCriteriaOrder);

          const criteriaId = updatedEditCriteria[criteriaIndex]?.id;

          if (criteriaId) {
            setChangedCriteriaDetails({
              id: criteriaId,
              newValue: newCriteriaName,
            });

            await fetch(`/api/rubrics/${rubricId}/criteria/${criteriaId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                newContent: newCriteriaName,
              }),
            });
            setIsModalOpen(false);
            console.log(`Criteria with ID ${criteriaId} updated successfully`);
          }
        }
      } else if (currentEdit.type === 'rubric') {
        setRubrics((prevRubrics) => {
          const updatedRubrics = { ...prevRubrics };

          if (updatedRubrics[currentEdit.criteria]) {
            updatedRubrics[currentEdit.criteria][currentEdit.index] = currentEdit.value;

            const cellId = rubricCellIds[currentEdit.criteria]?.[currentEdit.index]?.cellId;

            if (cellId) {
              console.log(`Cell ID of changed cell: ${cellId}`);
              updateRubricCell(rubricId, cellId, currentEdit.value);
            } else {
              console.error(`Cell ID not found for criteria "${currentEdit.criteria}" at index ${currentEdit.index}.`);
            }
          } else {
            console.error(`Criteria "${currentEdit.criteria}" not found in rubrics.`);
          }

          return updatedRubrics;
        });
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save changes', error);
    }
  };
  async function updateRubricCell(rubricId: string | undefined, cellId: string, value: string) {
    try {
      const response = await fetch(`/api/rubrics/${rubricId}/cell/${cellId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update rubric cell');
      }

      const updatedCell = await response.json();
      console.log('Updated cell:', updatedCell);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleAddCriteria = async () => {
    if (isEditAccess) {
      const newCriteriaName = `New Criteria ${Object.keys(rubrics).length + 1}`;
      const newCells = [
        { description: 'Functions, grammar, and vocabulary are...', ratingHeaderId: ratingHeaders[0]?.id },
        { description: 'Minor problems in usage do not distort...', ratingHeaderId: ratingHeaders[1]?.id },
        { description: 'Problems in usage significantly distort...', ratingHeaderId: ratingHeaders[2]?.id },
        { description: 'Problems in usage completely distort...', ratingHeaderId: ratingHeaders[3]?.id },
      ];

      try {
        const response = await fetch('/api/rubrics/', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rubricId: rubricId,
            title: newCriteriaName,
            cells: newCells,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add new criteria');
        }

        const result = await response.json();
        const { newCriteria, createdCells } = result;
        setRubrics((prevRubrics) => ({
          ...prevRubrics,
          [newCriteriaName]: createdCells.map((cell: any) => cell.description),
        }));

        setCriteriaOrder((prevOrder) => [...prevOrder, newCriteriaName]);

        setEditCriteria((prevEditCriteria) => [...prevEditCriteria, { name: newCriteriaName, id: newCriteria.id }]);

        console.log(`New criteria added successfully with ID ${newCriteria.id}`);
      } catch (error) {
        console.error('Failed to add new criteria', error);
      }
    }
  };

  const handleDeleteCriteria = (criteria: string) => {
    if (isEditAccess) {
      setCriteriaToDelete(criteria);
      setIsDeleteConfirm(true);
    }
  };

  const confirmDeleteCriteria = async () => {
    if (criteriaToDelete) {
      const criteriaId = editCriteriaIds[criteriaToDelete];
      if (criteriaId) {
        console.log(`Archived: ${criteriaId}`);
        try {
          const response = await fetch(`/api/rubrics/${rubricId}/criteria/${criteriaId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ criteriaId }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log(result.body.message);
          } else {
            console.error('Failed to archive criteria');
          }
        } catch (error) {
          console.error('An error occurred while archiving criteria:', error);
        }

        const updatedRubrics = { ...rubrics };
        delete updatedRubrics[criteriaToDelete];
        Object.keys(rubrics).length + 1;
        setRubrics(updatedRubrics);
        setCriteriaOrder((prevOrder) => prevOrder.filter((crit) => crit !== criteriaToDelete));
      }
    }

    setIsDeleteConfirm(false);
    setCriteriaToDelete(null);
  };

  const cancelDelete = () => {
    setIsDeleteConfirm(false);
    setCriteriaToDelete(null);
  };

  const handleScoreChange = (index: number, score: number) => {
    const updatedHeaders = ratingHeaders.map((header, idx) => (idx === index ? { ...header, score } : header));

    setRatingHeaders(updatedHeaders);

    const updatedHeader = updatedHeaders[index];
    setChangedHeaderId(updatedHeader.id);
  };

  const rateRubric = rateRubricsFormatted?.rubric;
  const rateCriteriaOrder = rateRubricsFormatted?.criteriaOrder;
  const rubricRatingHeaders: rubricRatingHeader[] = rateRubricsFormatted?.ratingHeaders ?? [];
  const raterubricId = rateRubricsFormatted?.rubricId;

  const handleDropdownSelect = (key: string) => {
    if (key === 'rate') {
      router.push(`/rate-rubric/${raterubricId}`);
    } else if (key === 'edit') {
      router.push(`/rubrics/edit/${raterubricId}`);
    }
  };

  return (
    <div className="container mx-auto py-8 p-4">
      <div className="flex items-center pb-8 align-center justify-center">
        {!writeAccess && <h1 className="text-3xl text-center font-bold p-2">{rubricName}</h1>}
        {!writeAccess && <EllipsisDropdown items={dropdownItems} onSelect={handleDropdownSelect} />}
      </div>
      <h1 className="text-3xl text-center font-bold mb-4">{writeAccess ? (isEditAccess ? 'Edit Rubric' : 'Giving Feedback on') : ''}</h1>
      <h1 className="text-2xl  p-2 text-center mb-2">{writeAccess ? (isEditAccess ? '' : rateRubricsFormatted?.programs[0].name) : ''}</h1>

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
                      header={header.header}
                      index={index}
                      score={ratingHeaders[index]?.score || 0}
                      isEditAccess={isEditAccess}
                      onScoreChange={handleScoreChange}
                      onEditClick={handleEditClick}
                    />
                  ))}
            </tr>
          </thead>
          <tbody>
            {!isEditAccess
              ? rateCriteriaOrder?.map((criteria: any) => (
                  <RubricCriteria
                    key={criteria}
                    criteria={criteria}
                    rubrics={rateRubric}
                    isEditAccess={isEditAccess}
                    onEditClick={handleEditClick}
                    onDeleteCriteria={handleDeleteCriteria}
                    rubricRatingHeaders={rubricRatingHeaders}
                    rubricId={raterubricId}
                    writeAccess={writeAccess}
                    isGlobalAccess={true}
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
                    editCriteriaIds={editCriteriaIds}
                    isGlobalAccess={isGlobalAccess}
                    rubricCellIds={rubricCellIds}
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
