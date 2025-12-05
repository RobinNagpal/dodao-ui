'use client';

import { useState } from 'react';
import { X, Users, AlertCircle } from 'lucide-react';

interface InstructorBulkAddStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (students: Array<{ name?: string; email: string }>) => Promise<void> | void;
  loading?: boolean;
}

const PLACEHOLDER = `name,email
Jane Doe,jane@example.com
John Smith,john@example.com`;

export default function InstructorBulkAddStudentsModal({ isOpen, onClose, onSubmit, loading }: InstructorBulkAddStudentsModalProps) {
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkError, setBulkError] = useState('');

  if (!isOpen) return null;

  const parseCsvRows = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const rows = bulkCsvText
      .split(/\r?\n/)
      .map((row) => row.trim())
      .filter(Boolean);
    if (!rows.length) {
      setBulkError('Please enter at least one row in CSV format: name,email');
      return null;
    }

    const parsed: Array<{ name?: string; email: string }> = [];
    const errors: string[] = [];

    const hasHeader = rows[0].toLowerCase().includes('email');
    const effectiveRows = hasHeader ? rows.slice(1) : rows;

    effectiveRows.forEach((row, index) => {
      const [name, email] = row.split(',').map((v) => v.trim());
      if (!email) {
        errors.push(`Row ${index + 1}: missing email`);
        return;
      }
      if (!emailRegex.test(email)) {
        errors.push(`Row ${index + 1}: invalid email`);
        return;
      }
      parsed.push({ name, email });
    });

    if (errors.length) {
      setBulkError(errors.join('; '));
      return null;
    }

    return parsed;
  };

  const handleSubmit = async () => {
    setBulkError('');
    const students = parseCsvRows();
    if (!students) return;

    await onSubmit(students);
    setBulkCsvText('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Add Multiple Students</h3>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => {
              setBulkError('');
              setBulkCsvText('');
              onClose();
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-gray-600">
            Paste CSV rows in <code>name,email</code> format. Header row is optional.
          </p>
          <textarea
            rows={8}
            value={bulkCsvText}
            onChange={(e) => setBulkCsvText(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={PLACEHOLDER}
          />
          {bulkError && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{bulkError}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setBulkError('');
              setBulkCsvText('');
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
            <span>{loading ? 'Adding...' : 'Add Students'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
