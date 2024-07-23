import React, { useState } from 'react';

interface CommentModalProps {
  isOpen: boolean;
  comment: string;
  onSave: (comment: string) => void;
  onClose: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ isOpen, comment, onSave, onClose }) => {
  const [newComment, setNewComment] = useState(comment);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(newComment);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      <div className="bg-white p-4 rounded shadow-md relative z-10">
        <h2 className="text-2xl font-bold mb-4">Edit Comment</h2>
        <textarea className="border p-2 w-full h-40 mb-4" value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
        <div className="flex justify-end">
          <button onClick={handleSave} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 mr-2">
            Save
          </button>
          <button onClick={onClose} className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
