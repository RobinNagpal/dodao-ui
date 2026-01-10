'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { useState } from 'react';
import { AVAILABLE_VOICES, DEFAULT_VOICE, CreatePresentationResponse, CreatePresentationRequest } from '@/types/presentation/presentation-types';

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
  const [error, setError] = useState('');

  // Prompt mode fields
  const [prompt, setPrompt] = useState('');
  const [numberOfSlides, setNumberOfSlides] = useState(5);
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // JSON mode fields - example showing all slide types with their fields
  const [jsonContent, setJsonContent] = useState(
    JSON.stringify(
      [
        {
          type: 'title',
          title: 'Welcome to My Presentation',
          subtitle: 'An Introduction (optional)',
          narration: 'Text that will be converted to speech for this slide.',
        },
        {
          type: 'bullets',
          title: 'Key Points to Cover',
          titleAccent: 'Key Points',
          bullets: ['First important point', 'Second important point', 'Third important point'],
          bulletAccents: ['important', 'important', 'important'],
          narration: 'Here are the key points we will cover today.',
        },
        {
          type: 'paragraphs',
          title: 'Detailed Explanation',
          titleAccent: 'Explanation',
          paragraphs: ['First paragraph with detailed content.', 'Second paragraph with more details.'],
          paragraphAccents: ['detailed', 'more details'],
          footer: 'Optional footer text or URL',
          narration: 'Let me explain this in detail.',
        },
        {
          type: 'image',
          title: 'Visual Representation',
          titleAccent: 'Visual',
          bullets: ['Point about the image', 'Another observation'],
          bulletAccents: ['image', 'observation'],
          imageUrl: 'https://example.com/image.png',
          narration: 'As you can see in this image...',
        },
      ],
      null,
      2
    )
  );

  const [jsonError, setJsonError] = useState('');

  const { postData: createPresentation, loading } = usePostData<CreatePresentationResponse, CreatePresentationRequest>({
    successMessage: 'Presentation created successfully!',
    errorMessage: 'Failed to create presentation',
  });

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

    setError('');

    let body: CreatePresentationRequest;

    if (mode === 'prompt') {
      if (!prompt.trim()) {
        setError('Prompt is required');
        return;
      }
      body = {
        mode: 'prompt',
        presentationId,
        voice,
        prompt,
        numberOfSlides,
        additionalInstructions: additionalInstructions || undefined,
      };
    } else {
      if (!validateJson(jsonContent)) {
        return;
      }
      body = {
        mode: 'json',
        presentationId,
        voice,
        slides: JSON.parse(jsonContent),
      };
    }

    const result = await createPresentation(`${getBaseUrl()}/api/presentations`, body);

    if (result) {
      onSuccess(presentationId);
      onClose();
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
                mode === 'prompt' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">AI Prompt</div>
              <div className="text-sm text-gray-500">Generate slides from a description</div>
            </button>
            <button
              onClick={() => setMode('json')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                mode === 'json' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 hover:border-gray-400'
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
          <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600">
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
              rows={16}
              className="w-full px-3 py-2 border rounded-md font-mono text-sm dark:bg-gray-800 dark:border-gray-600"
            />
            {jsonError && <p className="mt-1 text-sm text-red-500">{jsonError}</p>}

            {/* Field Reference */}
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-xs">
              <p className="font-medium mb-2">Slide Types & Fields Reference:</p>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">title:</span> title, subtitle?, narration
                </div>
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">bullets:</span> title, titleAccent?, bullets[], bulletAccents[]?, narration
                </div>
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">paragraphs:</span> title, titleAccent?, paragraphs[], paragraphAccents[]?,
                  footer?, narration
                </div>
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">image:</span> title, titleAccent?, bullets[], bulletAccents[]?, imageUrl,
                  narration
                </div>
                <p className="mt-2 italic">Accent fields highlight matching text in blue. Use &quot;?&quot; fields optionally.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">{error}</div>}

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
