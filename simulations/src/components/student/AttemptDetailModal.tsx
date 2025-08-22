'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Edit3, Save, Eye, Brain, MessageSquare, Sparkles } from 'lucide-react';
import { parseMarkdown } from '@/utils/parse-markdown';
import MarkdownEditor from '@/components/markdown/MarkdownEditor';
import type { ExerciseAttempt } from '@prisma/client';

interface AttemptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempt: ExerciseAttempt | null;
  onSaveEdit: (attemptId: string, updatedResponse: string) => Promise<void>;
  isUpdating: boolean;
}

export default function AttemptDetailModal({ isOpen, onClose, attempt, onSaveEdit, isUpdating }: AttemptDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedResponse, setEditedResponse] = useState('');

  // Reset editing state when modal opens/closes or attempt changes
  useEffect(() => {
    if (!isOpen || !attempt) {
      setIsEditing(false);
      setEditedResponse('');
    }
  }, [isOpen, attempt]);

  const handleStartEdit = () => {
    if (attempt?.promptResponse) {
      setEditedResponse(attempt.promptResponse);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedResponse('');
  };

  const handleSaveEdit = async () => {
    if (attempt && editedResponse.trim()) {
      try {
        await onSaveEdit(attempt.id, editedResponse.trim());
        // Reset editing state and close modal after successful save
        setIsEditing(false);
        setEditedResponse('');
        onClose(); // Close the modal after successful save
      } catch (error) {
        console.error('Error saving edit:', error);
        // Don't close modal if there's an error, so user can retry
      }
    }
  };

  const handleClose = () => {
    // Reset editing state when closing
    setIsEditing(false);
    setEditedResponse('');
    onClose();
  };

  if (!attempt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal={true}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] bg-white/95 backdrop-blur-md border border-blue-100/50 shadow-2xl overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-purple-50 -m-6 mb-2 p-6 rounded-t-lg border-b border-blue-100">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <span>Attempt {attempt.attemptNumber} Details</span>
                <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
              </div>
              <div className="flex items-center space-x-3 text-sm pr-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      attempt.status === 'completed' ? 'bg-green-500' : attempt.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                  ></div>
                  <span className="text-gray-600 font-medium capitalize">{attempt.status}</span>
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] space-y-6 pb-4">
          {/* Your Prompt */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <div className="bg-gradient-to-br from-green-500 to-teal-600 p-2 rounded-xl">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span>Your Prompt</span>
            </h3>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-200/50">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{attempt.prompt}</p>
            </div>
          </div>

          {/* AI Response */}
          {attempt.promptResponse && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-xl">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <span>AI Response</span>
                </h3>
                {attempt.status === 'completed' && !isEditing && (
                  <Button
                    onClick={handleStartEdit}
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 bg-transparent mr-1"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit Response
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
                    <MarkdownEditor
                      objectId={attempt.id}
                      modelValue={editedResponse}
                      onUpdate={setEditedResponse}
                      placeholder="Edit the AI response..."
                      maxHeight={400}
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={handleSaveEdit}
                      disabled={isUpdating || !editedResponse.trim()}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 bg-transparent"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200/50">
                  <div
                    className="markdown-body prose prose-purple prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(attempt.promptResponse) }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {attempt.error && (
            <div className="space-y-3">
              <h3 className="font-semibold text-red-900 flex items-center space-x-2">
                <div className="bg-red-500 p-2 rounded-xl">
                  <X className="h-4 w-4 text-white" />
                </div>
                <span>Error</span>
              </h3>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-red-700">{attempt.error}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
