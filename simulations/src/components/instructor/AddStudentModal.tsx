'use client';

import { useState } from 'react';
import { X, Plus, Mail, AlertCircle } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, email: string) => Promise<void>;
  loading?: boolean;
}

export default function AddStudentModal({ isOpen, onClose, onSubmit, loading }: AddStudentModalProps) {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setEmailError('');

    if (!studentEmail.trim()) {
      setEmailError('Please enter a student email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    await onSubmit(studentName.trim(), studentEmail.trim());
    setStudentName('');
    setStudentEmail('');
    setEmailError('');
  };

  const handleClose = () => {
    setStudentName('');
    setStudentEmail('');
    setEmailError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Add Student</h3>
          </div>
          <button className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-all" onClick={handleClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Name (optional)</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Student name"
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 border-gray-200 focus:border-green-500 bg-white"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@email.com"
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 ${
                  emailError ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-green-500 bg-white'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
                disabled={loading}
              />
            </div>
            {emailError && (
              <div className="flex items-center space-x-2 mt-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">{emailError}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all" onClick={handleClose}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !studentEmail.trim()}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Add Student</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
