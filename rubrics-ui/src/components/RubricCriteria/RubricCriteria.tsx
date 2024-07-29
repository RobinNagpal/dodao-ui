import React, { useState, useEffect } from 'react';
import RubricCell from '@/components/RubricCell/RubricCell';
import { RubricCriteriaProps } from '@/types/rubricsTypes/types';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { SessionProps } from '@/types/rubricsTypes/types';
import { getSession } from 'next-auth/react';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import CommentModal from '@/components/CommentModal/CommentModal';

const RubricCriteria: React.FC<RubricCriteriaProps> = ({ criteria, rubrics, isEditAccess, onEditClick, onDeleteCriteria, rubricRatingHeaders, rubricId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  const [rowScoresAndComments, setRowScoresAndComments] = useState<Array<{ criteria: string; score: number; comment: string; cellId: string }>>([]);
  const [selectedCells, setSelectedCells] = useState<{ [key: string]: number }>({});
  const [clickedCellIndex, setClickedCellIndex] = useState<number | null>(null);
  const [clickedCellId, setClickedCellId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionProps | null>(null);

  const { showNotification } = useNotificationContext();

  const userId = session?.userId;

  // Fetch comments and selected cells
  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        try {
          const response = await fetch(`http://localhost:3004/api/rubric-rating?userId=${userId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch comments');
          }

          const data = await response.json();
          const comments = data.body.map((entry: any) => ({
            criteria,
            comment: entry.comment,
            cellId: entry.rubricCellId,
            score: entry.score,
          }));

          console.log('Fetched comments:', comments);

          setRowScoresAndComments((prev) => [...prev.filter((entry) => entry.criteria !== criteria), ...comments]);

          // Set selected cells based on fetched comments
          const fetchedSelectedCells = comments.reduce((acc: { [key: string]: number }, entry: any) => {
            acc[entry.cellId] = rubricRatingHeaders?.findIndex((header) => header.score === entry.score) ?? 0;
            return acc;
          }, {});

          console.log('Fetched selected cells:', fetchedSelectedCells);

          setSelectedCells(fetchedSelectedCells);
        } catch (error) {
          showNotification({
            type: 'error',
            message: 'Error fetching comments',
          });
          console.error('Error fetching comments:', error);
        }
      }
    };

    fetchData();
  }, [userId, criteria]);

  const formattedRateRubrics = rowScoresAndComments
    .filter((entry) => entry.criteria === criteria)
    .map((entry) => ({
      criteria: entry.criteria,
      score: entry.score,
      comment: entry.comment,
      cellId: entry.cellId,
      userId: userId,
      rubricId: rubricId,
    }));

  const sendRatedRubricsToServer = async () => {
    try {
      const response = await fetch('/api/rubric-rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedRateRubrics),
      });

      if (!response.ok) {
        throw new Error('Failed to send data');
      }

      const result = await response.json();
      console.log('Successfully sent data to the server:', result);
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Error sending data to the server',
      });
      console.error('Error sending data to the server:', error);
    }
  };

  useEffect(() => {
    (async () => {
      const session = await getSession();
      setSession(session as SessionProps | null);
    })();
  }, []);

  useEffect(() => {
    if (formattedRateRubrics.length > 0) {
      sendRatedRubricsToServer();
    }
  }, [rowScoresAndComments, formattedRateRubrics]);

  const handleCommentModal = (cellIndex: number, cellId: string) => {
    if (isEditAccess) return;

    setClickedCellIndex(cellIndex);
    setClickedCellId(cellId);

    const existingEntry = rowScoresAndComments.find((entry) => entry.criteria === criteria && entry.cellId === cellId);
    if (existingEntry) {
      console.log('Existing comment:', existingEntry.comment);
      setCurrentComment(existingEntry.comment);
    } else {
      setCurrentComment('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveComment = () => {
    if (clickedCellIndex === null || clickedCellId === null) return;

    const selectedScore = rubricRatingHeaders![clickedCellIndex].score;

    setRowScoresAndComments((prev) => {
      const filteredEntries = prev.filter((entry) => entry.criteria !== criteria || entry.cellId !== clickedCellId);
      const updatedEntry = { criteria, score: selectedScore, comment: currentComment, cellId: clickedCellId };

      return [...filteredEntries, updatedEntry];
    });

    setSelectedCells((prev) => ({
      ...prev,
      [criteria]: clickedCellIndex,
    }));

    handleCloseModal();
  };

  const handleCellClick = (criteria: string, cellIndex: number, cellId: string) => {
    const isCellAlreadySelected = selectedCells[criteria] === cellIndex;
    const isAnyCellSelected = selectedCells[criteria] !== undefined;

    if (isCellAlreadySelected) {
      setClickedCellIndex(cellIndex);
      setClickedCellId(cellId);
      setIsConfirmationOpen(false);
      handleCommentModal(cellIndex, cellId);
      return;
    }

    if (isAnyCellSelected) {
      showNotification({
        type: 'error',
        message: 'Only one cell can be selected per criteria. Please edit the existing selection.',
      });
      return;
    }

    setClickedCellIndex(cellIndex);
    setClickedCellId(cellId);
    setIsConfirmationOpen(true);
  };

  const handleConfirmSelection = () => {
    setSelectedCells((prevSelectedCells) => ({
      ...prevSelectedCells,
      [criteria]: clickedCellIndex!,
    }));

    handleCommentModal(clickedCellIndex!, clickedCellId!);
    setIsConfirmationOpen(false);
  };

  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false);
  };

  const selectedComment = rowScoresAndComments.find((entry) => entry.criteria === criteria && entry.cellId === clickedCellId)?.comment || 'No comment';
  console.log('Selected Comment:', selectedComment);

  return (
    <>
      <tr>
        <td className="py-2 px-4 border-r border-b font-bold cursor-pointer max-w-xs break-words relative">
          <div onClick={() => isEditAccess && onEditClick('criteria', criteria, -1)} className="overflow-y-auto max-h-24">
            {criteria}
          </div>
        </td>
        {rubrics![criteria].map((cell: any, cellIndex) => (
          <React.Fragment key={cellIndex}>
            <RubricCell
              cell={isEditAccess ? cell : cell.description}
              criteria={criteria}
              cellIndex={cellIndex}
              isEditAccess={isEditAccess}
              onEditClick={onEditClick}
              handleCommentModal={() => handleCommentModal(cellIndex, cell.cellId)}
              onClick={() => handleCellClick(criteria, cellIndex, cell.cellId)}
              isClicked={selectedCells[criteria] === cellIndex || rowScoresAndComments.some((entry) => entry.cellId === cell.cellId)}
              className={selectedCells[criteria] === cellIndex ? 'border-2 border-blue-500' : ''}
            />
          </React.Fragment>
        ))}
        {isEditAccess && (
          <td>
            <button onClick={() => onDeleteCriteria(criteria)}>
              <TrashIcon className="w-8 h-8 text-red-500 mx-auto" />
            </button>
          </td>
        )}
        {!isEditAccess && (
          <td className="py-2 px-4 border-r border-b overflow-hidden">
            <div className="flex-grow max-h-24 overflow-y-auto whitespace-pre-wrap">{selectedComment}</div>
          </td>
        )}
      </tr>

      <CommentModal
        criteria={criteria}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        comment={currentComment}
        setComment={setCurrentComment}
        handleSave={handleSaveComment}
      />
      {!isEditAccess && (
        <ConfirmationModal
          isOpen={isConfirmationOpen}
          onClose={handleCloseConfirmation}
          onConfirm={handleConfirmSelection}
          message="Are you sure you want to select this cell?"
        />
      )}
    </>
  );
};

export default RubricCriteria;
