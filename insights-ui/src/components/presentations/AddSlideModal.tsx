'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import React, { useState } from 'react';
import { SlideType, Slide } from '@/types/presentation/presentation-types';

export interface AddSlideModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  presentationId: string;
  loading?: boolean;
  onAdd: (slide: Slide) => Promise<void>;
}

const SLIDE_TYPES: { value: SlideType; label: string }[] = [
  { value: 'title', label: 'Title Slide' },
  { value: 'bullets', label: 'Bullet Points' },
  { value: 'paragraphs', label: 'Paragraphs' },
  { value: 'image', label: 'Image with Bullets' },
];

export default function AddSlideModal({ open, onClose, onSuccess, presentationId, loading = false, onAdd }: AddSlideModalProps) {
  const [type, setType] = useState<SlideType>('bullets');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [narration, setNarration] = useState('');
  const [bullets, setBullets] = useState<string[]>(['']);
  const [paragraphs, setParagraphs] = useState<string[]>(['']);
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setType('bullets');
    setTitle('');
    setSubtitle('');
    setNarration('');
    setBullets(['']);
    setParagraphs(['']);
    setImageUrl('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleArrayChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, '']);
  };

  const handleRemoveArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!narration.trim()) {
      setError('Narration is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let slide: Slide;

      // Create base slide properties
      const baseSlide = {
        id: `slide-${Date.now()}`, // Generate a unique ID
        title: title.trim(),
        narration: narration.trim(),
      };

      if (type === 'title') {
        slide = {
          ...baseSlide,
          type: 'title',
          subtitle: subtitle.trim() || undefined,
        };
      } else if (type === 'bullets') {
        slide = {
          ...baseSlide,
          type: 'bullets',
          bullets: bullets.filter((b) => b.trim()).map((b) => b.trim()),
        };
      } else if (type === 'image') {
        slide = {
          ...baseSlide,
          type: 'image',
          bullets: bullets.filter((b) => b.trim()).map((b) => b.trim()),
          imageUrl: imageUrl.trim(),
        };
      } else if (type === 'paragraphs') {
        slide = {
          ...baseSlide,
          type: 'paragraphs',
          paragraphs: paragraphs.filter((p) => p.trim()).map((p) => p.trim()),
        };
      } else {
        throw new Error('Invalid slide type');
      }

      await onAdd(slide);
      resetForm();
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add slide');
    } finally {
      setSubmitting(false);
    }
  };

  const renderArrayField = (items: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, label: string, placeholder: string) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleArrayChange(setter, index, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveArrayItem(setter, index)}
              className="px-3 py-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-md"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => handleAddArrayItem(setter)} className="text-sm text-blue-500 hover:underline">
        + Add item
      </button>
    </div>
  );

  return (
    <FullPageModal open={open} onClose={handleClose} title="Add New Slide">
      <div className="p-6 max-w-2xl mx-auto">
        {/* Slide Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Slide Type *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as SlideType)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
          >
            {SLIDE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter slide title"
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        {/* Subtitle (for title type) */}
        {type === 'title' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter subtitle (optional)"
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
        )}

        {/* Bullets (for bullets and image types) */}
        {(type === 'bullets' || type === 'image') && <div className="mb-4">{renderArrayField(bullets, setBullets, 'Bullet Points', 'Enter bullet point')}</div>}

        {/* Paragraphs (for paragraphs type) */}
        {type === 'paragraphs' && <div className="mb-4">{renderArrayField(paragraphs, setParagraphs, 'Paragraphs', 'Enter paragraph text')}</div>}

        {/* Image URL (for image type) */}
        {type === 'image' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL (optional)"
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
        )}

        {/* Narration */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Narration *</label>
          <textarea
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            placeholder="Enter the narration text for this slide..."
            rows={4}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        {/* Error Display */}
        {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">{error}</div>}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={handleClose} variant="outlined" disabled={submitting || loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            primary
            variant="contained"
            loading={submitting || loading}
            disabled={submitting || loading || !title.trim() || !narration.trim()}
          >
            Add Slide
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
