import React, { useState, useEffect, use } from 'react';
import RubricCell from '@/components/RubricsView/RubricCell';
import { RubricCriteriaProps } from '@/types/rubricsTypes/types';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { SessionProps } from '@/types/rubricsTypes/types';
import { getSession } from 'next-auth/react';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import CommentModal from '@/components/CommentModal/CommentModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
const EditRubricCriteria: React.FC<RubricCriteriaProps> = ({
  criteria,
  rubrics,
  isEditAccess,
  onEditClick,
  onDeleteCriteria,
  rubricRatingHeaders,
  rubricId,
  writeAccess,
  isGlobalAccess,
  editCriteriaIds,
  rubricCellIds,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  const [rowScoresAndComments, setRowScoresAndComments] = useState<Array<{ criteria: string; score: number; comment: string; cellId: string }>>([]);
  const [selectedCells, setSelectedCells] = useState<{ [key: string]: number }>({});
  const [clickedCellIndex, setClickedCellIndex] = useState<number | null>(null);
  const [clickedCellId, setClickedCellId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionProps | null>(null);
  const [formattedRateRubrics, setFormattedRateRubrics] = useState<Array<any>>([]);
  const { showNotification } = useNotificationContext();

  const userId = session?.userId;

  useEffect(() => {
    const fetchData = async () => {
      if (userId && writeAccess) {
        try {
          const response = await fetch(`${getBaseUrl()}/api/rubric-rating?userId=${userId}`);
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

          const comment = comments.map((item: any) => item.comment);

          setRowScoresAndComments((prev) => [...prev.filter((entry) => entry.criteria !== criteria), ...comments]);

          const fetchedSelectedCells = comments.reduce((acc: { [key: string]: number }, entry: any) => {
            acc[entry.cellId] = rubricRatingHeaders?.findIndex((header) => header.score === entry.score) ?? 0;
            return acc;
          }, {});

          setSelectedCells(fetchedSelectedCells);
        } catch (error) {
          showNotification({
            type: 'error',
            message: 'Error fetching comments',
          });
        }
      }
    };

    fetchData();
  }, [userId, criteria]);
  useEffect(() => {
    const newFormattedRateRubrics = rowScoresAndComments
      .filter((entry) => entry.criteria === criteria)
      .map((entry) => ({
        criteria: entry.criteria,
        score: entry.score,
        comment: entry.comment,
        cellId: entry.cellId,
        userId: userId,
        rubricId: rubricId,
      }));

    setFormattedRateRubrics(newFormattedRateRubrics);
  }, [rowScoresAndComments, criteria, userId, rubricId]);

  useEffect(() => {
    if (formattedRateRubrics.length > 0) {
      sendRatedRubricsToServer();
    }
  }, [formattedRateRubrics]);
  // const newFormattedRateRubrics = rowScoresAndComments
  //   .filter((entry) => entry.criteria === criteria)
  //   .map((entry) => ({
  //     criteria: entry.criteria,
  //     score: entry.score,
  //     comment: entry.comment,
  //     cellId: entry.cellId,
  //     userId: userId,
  //     rubricId: rubricId,
  //   }));

  // setFormattedRateRubrics(newFormattedRateRubrics);

  // useEffect(() => {
  //   if (formattedRateRubrics.length > 0) {
  //     sendRatedRubricsToServer();
  //   }
  // }, [formattedRateRubrics]);

  const sendRatedRubricsToServer = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/rubric-rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedRateRubrics),
      });

      if (!response.ok) {
        throw new Error('Failed to send data');
      }

      const result = await response.json();
      console.log('Successfully sent data to the server:', formattedRateRubrics);
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
    sendRatedRubricsToServer();
    handleCloseModal();
  };

  const handleCellClick = (criteria: string, cellIndex: number, cellId: string) => {
    if (writeAccess) {
      const isCellAlreadySelected = selectedCells[criteria] === cellIndex;
      const isAnyCellSelected = selectedCells[criteria] !== undefined;

      if (isCellAlreadySelected) {
        setClickedCellIndex(cellIndex);
        setClickedCellId(cellId);
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
    }
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

  // console.log(clickedCellId);
  // console.log(rubrics);
  // console.log(criteria);

  const selectedComment = rowScoresAndComments.find((entry) => entry.criteria === criteria && entry.cellId === clickedCellId)?.comment || 'No comment';
  return (
    <>
      <tr>
        <td className="py-2 px-4 border-r border-b font-bold cursor-pointer max-w-xs break-words relative">
          <div
            onClick={() => {
              if (isEditAccess) {
                onEditClick('criteria', criteria, -1);
              }
            }}
            className="overflow-y-auto max-h-24"
          >
            {criteria}
          </div>
        </td>
        {rubrics![criteria]?.map((cell: any, cellIndex) => (
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
        {/* {isGlobalAccess && (
          <td className="py-2 px-4 border-r border-b overflow-hidden">
            <div className="flex-grow max-h-24 overflow-y-auto whitespace-pre-wrap">{selectedComment}</div>
          </td>
        )} */}
        {isEditAccess && (
          <td>
            <button onClick={() => onDeleteCriteria(criteria)}>
              <TrashIcon className="w-8 h-8 text-red-500 mx-auto" />
            </button>
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

export default EditRubricCriteria;
