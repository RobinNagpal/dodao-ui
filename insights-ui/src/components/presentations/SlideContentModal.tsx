'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import React, { useState, useEffect } from 'react';
import { Slide, SlideType } from '@/types/presentation/presentation-types';

type ArrayField = 'bullets' | 'paragraphs' | 'bulletAccents' | 'paragraphAccents';

export interface SlideContentModalProps {
  open: boolean;
  onClose: () => void;
  slide: Slide | undefined;
  slideNumber: string;
  onSave: (slide: Slide) => void;
  readOnly?: boolean;
}

const SLIDE_TYPES: SlideType[] = ['title', 'bullets', 'paragraphs', 'image'];

export default function SlideContentModal({ open, onClose, slide, slideNumber, onSave, readOnly = false }: SlideContentModalProps) {
  const [editedSlide, setEditedSlide] = useState<Slide | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (slide) {
      setEditedSlide({ ...slide });
      setIsEditing(false);
    }
  }, [slide, open]);

  if (!editedSlide) return null;

  const handleFieldChange = (field: string, value: any) => {
    setEditedSlide((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleArrayChange = (field: ArrayField, index: number, value: string) => {
    setEditedSlide((prev) => {
      if (!prev) return null;

      // Type-safe handling for array fields
      if (field === 'bullets' && (prev.type === 'bullets' || prev.type === 'image')) {
        const arr = [...(prev.bullets || [])];
        arr[index] = value;
        return { ...prev, bullets: arr };
      } else if (field === 'bulletAccents' && (prev.type === 'bullets' || prev.type === 'image')) {
        const arr = [...(prev.bulletAccents || [])];
        arr[index] = value;
        return { ...prev, bulletAccents: arr };
      } else if (field === 'paragraphs' && prev.type === 'paragraphs') {
        const arr = [...(prev.paragraphs || [])];
        arr[index] = value;
        return { ...prev, paragraphs: arr };
      } else if (field === 'paragraphAccents' && prev.type === 'paragraphs') {
        const arr = [...(prev.paragraphAccents || [])];
        arr[index] = value;
        return { ...prev, paragraphAccents: arr };
      }

      return prev;
    });
  };

  const handleAddArrayItem = (field: ArrayField) => {
    setEditedSlide((prev) => {
      if (!prev) return null;

      // Type-safe handling for array fields
      if (field === 'bullets' && (prev.type === 'bullets' || prev.type === 'image')) {
        const arr = [...(prev.bullets || []), ''];
        return { ...prev, bullets: arr };
      } else if (field === 'bulletAccents' && (prev.type === 'bullets' || prev.type === 'image')) {
        const arr = [...(prev.bulletAccents || []), ''];
        return { ...prev, bulletAccents: arr };
      } else if (field === 'paragraphs' && prev.type === 'paragraphs') {
        const arr = [...(prev.paragraphs || []), ''];
        return { ...prev, paragraphs: arr };
      } else if (field === 'paragraphAccents' && prev.type === 'paragraphs') {
        const arr = [...(prev.paragraphAccents || []), ''];
        return { ...prev, paragraphAccents: arr };
      }

      return prev;
    });
  };

  const handleRemoveArrayItem = (field: ArrayField, index: number) => {
    setEditedSlide((prev) => {
      if (!prev) return null;

      // Type-safe handling for array fields
      if (field === 'bullets' && (prev.type === 'bullets' || prev.type === 'image')) {
        const arr = [...(prev.bullets || [])];
        arr.splice(index, 1);
        return { ...prev, bullets: arr };
      } else if (field === 'bulletAccents' && (prev.type === 'bullets' || prev.type === 'image')) {
        const arr = [...(prev.bulletAccents || [])];
        arr.splice(index, 1);
        return { ...prev, bulletAccents: arr };
      } else if (field === 'paragraphs' && prev.type === 'paragraphs') {
        const arr = [...(prev.paragraphs || [])];
        arr.splice(index, 1);
        return { ...prev, paragraphs: arr };
      } else if (field === 'paragraphAccents' && prev.type === 'paragraphs') {
        const arr = [...(prev.paragraphAccents || [])];
        arr.splice(index, 1);
        return { ...prev, paragraphAccents: arr };
      }

      return prev;
    });
  };

  const handleSave = () => {
    if (editedSlide) {
      onSave(editedSlide);
      onClose();
    }
  };

  const renderArrayField = (field: ArrayField, label: string, items: string[]) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleArrayChange(field, index, e.target.value)}
            disabled={!isEditing}
            className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 disabled:opacity-60"
          />
          {isEditing && (
            <button onClick={() => handleRemoveArrayItem(field, index)} className="px-3 py-2 text-red-500 hover:bg-red-100 rounded-md">
              ×
            </button>
          )}
        </div>
      ))}
      {isEditing && (
        <button onClick={() => handleAddArrayItem(field)} className="text-sm text-blue-500 hover:underline">
          + Add item
        </button>
      )}
    </div>
  );

  return (
    <FullPageModal open={open} onClose={onClose} title={`Slide ${slideNumber} Content`}>
      <div className="p-6 max-w-2xl mx-auto">
        {/* Edit Toggle */}
        {!readOnly && (
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setIsEditing(!isEditing)} variant="outlined" size="sm">
              {isEditing ? 'Cancel Edit' : 'Edit'}
            </Button>
          </div>
        )}

        {/* Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={editedSlide.type}
            onChange={(e) => handleFieldChange('type', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 disabled:opacity-60"
          >
            {SLIDE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={editedSlide.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 disabled:opacity-60"
          />
        </div>

        {/* Title Accent (for non-title slides) */}
        {editedSlide.type !== 'title' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title Accent</label>
            <input
              type="text"
              value={'titleAccent' in editedSlide ? editedSlide.titleAccent || '' : ''}
              onChange={(e) => handleFieldChange('titleAccent', e.target.value)}
              disabled={!isEditing}
              placeholder="Text from title to highlight in accent color"
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 disabled:opacity-60"
            />
            <p className="text-xs text-gray-500 mt-1">Enter text that appears in the title to highlight it in blue</p>
          </div>
        )}

        {/* Subtitle (for title type) */}
        {editedSlide.type === 'title' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              type="text"
              value={editedSlide.subtitle || ''}
              onChange={(e) => handleFieldChange('subtitle', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 disabled:opacity-60"
            />
          </div>
        )}

        {/* Bullets (for bullets and image types) */}
        {(editedSlide.type === 'bullets' || editedSlide.type === 'image') && (
          <>
            {renderArrayField('bullets', 'Bullets', editedSlide.bullets || [])}
            {renderArrayField('bulletAccents', 'Bullet Accents (optional)', editedSlide.bulletAccents || [])}
            <p className="text-xs text-gray-500 mb-4">Enter text from each bullet to highlight in blue (one per bullet)</p>
          </>
        )}

        {/* Paragraphs (for paragraphs type) */}
        {editedSlide.type === 'paragraphs' && (
          <>
            {renderArrayField('paragraphs', 'Paragraphs', editedSlide.paragraphs || [])}
            {renderArrayField('paragraphAccents', 'Paragraph Accents (optional)', editedSlide.paragraphAccents || [])}
            <p className="text-xs text-gray-500 mb-4">Enter text from each paragraph to highlight/underline (one per paragraph)</p>
          </>
        )}

        {/* Image URL (for image type) */}
        {editedSlide.type === 'image' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              value={editedSlide.imageUrl || ''}
              onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 disabled:opacity-60"
            />
          </div>
        )}

        {/* Narration */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Narration</label>
          <textarea
            value={editedSlide.narration}
            onChange={(e) => handleFieldChange('narration', e.target.value)}
            disabled={!isEditing}
            rows={4}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 disabled:opacity-60"
          />
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button onClick={() => setIsEditing(false)} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleSave} primary variant="contained">
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </FullPageModal>
  );
}
