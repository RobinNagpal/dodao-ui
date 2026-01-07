'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import React, { useState } from 'react';
import { AVAILABLE_VOICES, DEFAULT_VOICE } from '@/types/presentation/presentation-types';

export interface CreatePresentationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (presentationId: string) => void;
}

type CreateMode = 'json' | 'prompt';

export default function CreatePresentationModal({ open, onClose, onSuccess }: CreatePresentationModalProps) {
  const [mode, setMode] = useState<CreateMode>('prompt');
  const [presentationId, setPresentationId] = useState('');
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prompt mode fields
  const [prompt, setPrompt] = useState('');
  const [numberOfSlides, setNumberOfSlides] = useState(5);
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // JSON mode fields
  const [jsonContent, setJsonContent] = useState(
    JSON.stringify(
      [
        {
          type: 'title',
          title: 'Welcome to My Presentation',
          subtitle: 'An Introduction',
          narration: 'Welcome to our presentation. Let me introduce the topic.',
        },
        {
          type: 'bullets',
          title: 'Key Points',
          bullets: ['First point', 'Second point', 'Third point'],
          narration: 'Here are the key points we will cover today.',
        },
      ],
      null,
      2
    )
  );

  const [jsonError, setJsonError] = useState('');

  const validateJson = (value: string): boolean => {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        setJsonError('JSON must be an array of slides');
        return false;
      }
      setJsonError('');
      return true;
    } catch {
      setJsonError('Invalid JSON format');
      return false;
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonContent(value);
    validateJson(value);
  };

  const handleSubmit = async () => {
    if (!presentationId.trim()) {
      setError('Presentation ID is required');
      return;
    }

    // Validate presentation ID (alphanumeric and hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(presentationId)) {
      setError('Presentation ID can only contain letters, numbers, and hyphens');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let body: any = {
        mode,
        presentationId,
        voice,
      };

      if (mode === 'prompt') {
        if (!prompt.trim()) {
          setError('Prompt is required');
          setLoading(false);
          return;
        }
        body.prompt = prompt;
        body.numberOfSlides = numberOfSlides;
        body.additionalInstructions = additionalInstructions || undefined;
      } else {
        if (!validateJson(jsonContent)) {
          setLoading(false);
          return;
        }
        body.slides = JSON.parse(jsonContent);
      }

      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create presentation');
      }

      onSuccess(presentationId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FullPageModal open={open} onClose={onClose} title="Create New Presentation">
      <div className="p-6 max-w-2xl mx-auto">
        {/* Mode Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Creation Mode</label>
          <div className="flex gap-4">
            <button
              onClick={() => setMode('prompt')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                mode === 'prompt'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">AI Prompt</div>
              <div className="text-sm text-gray-500">Generate slides from a description</div>
            </button>
            <button
              onClick={() => setMode('json')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                mode === 'json'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">JSON Input</div>
              <div className="text-sm text-gray-500">Provide slide content directly</div>
            </button>
          </div>
        </div>

        {/* Presentation ID */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Presentation ID *</label>
          <input
            type="text"
            value={presentationId}
            onChange={(e) => setPresentationId(e.target.value)}
            placeholder="my-presentation"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        {/* Voice Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Voice</label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
          >
            {AVAILABLE_VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Prompt Mode Fields */}
        {mode === 'prompt' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Prompt *</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Create a presentation about..."
                rows={4}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Number of Slides</label>
              <input
                type="number"
                min={1}
                max={20}
                value={numberOfSlides}
                onChange={(e) => setNumberOfSlides(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Additional Instructions (optional)</label>
              <textarea
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="Include statistics, make it engaging..."
                rows={2}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
          </>
        )}

        {/* JSON Mode Fields */}
        {mode === 'json' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Slides JSON *</label>
            <textarea
              value={jsonContent}
              onChange={(e) => handleJsonChange(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border rounded-md font-mono text-sm dark:bg-gray-800 dark:border-gray-600"
            />
            {jsonError && <p className="mt-1 text-sm text-red-500">{jsonError}</p>}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit} primary variant="contained" loading={loading} disabled={loading}>
            Create Presentation
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}

