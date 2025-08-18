'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';

interface CaseStudy {
  id: string;
  title: string;
  subject: string;
}

interface CreateEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateEnrollmentModal({ isOpen, onClose, onSuccess }: CreateEnrollmentModalProps) {
  const [selectedCaseStudyId, setSelectedCaseStudyId] = useState('');
  const [assignedInstructorId, setAssignedInstructorId] = useState('');
  const [errors, setErrors] = useState({ caseStudy: '', instructor: '' });
  const [adminEmail, setAdminEmail] = useState<string>('admin@example.com');

  // Get admin email from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('user_email') || 'admin@example.com';
      setAdminEmail(email);
    }
  }, []);

  // Fetch case studies
  const { data: caseStudies, loading: loadingCaseStudies } = useFetchData<CaseStudy[]>(
    '/api/case-studies',
    { skipInitialFetch: !isOpen },
    'Failed to load case studies'
  );

  const { postData, loading } = usePostData(
    {
      successMessage: 'Enrollment created successfully!',
      errorMessage: 'Failed to create enrollment',
    },
    {
      headers: {
        'admin-email': adminEmail,
      },
    }
  );

  const resetForm = () => {
    setSelectedCaseStudyId('');
    setAssignedInstructorId('');
    setErrors({ caseStudy: '', instructor: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // Reset errors
    setErrors({ caseStudy: '', instructor: '' });

    // Validation
    let hasErrors = false;
    const newErrors = { caseStudy: '', instructor: '' };

    if (!selectedCaseStudyId || selectedCaseStudyId === 'loading' || selectedCaseStudyId === 'no-case-studies') {
      newErrors.caseStudy = 'Please select a case study';
      hasErrors = true;
    }

    if (!assignedInstructorId.trim()) {
      newErrors.instructor = 'Please enter an instructor email';
      hasErrors = true;
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(assignedInstructorId)) {
        newErrors.instructor = 'Please enter a valid email address';
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      caseStudyId: selectedCaseStudyId,
      assignedInstructorId: assignedInstructorId.trim(),
    };

    try {
      const result = await postData('/api/enrollments', payload);

      if (result) {
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error creating enrollment:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Create New Enrollment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="caseStudy" className="text-gray-700 dark:text-gray-300">
              Case Study *
            </Label>
            <Select value={selectedCaseStudyId} onValueChange={setSelectedCaseStudyId}>
              <SelectTrigger
                className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
                  errors.caseStudy ? 'border-red-500' : ''
                }`}
              >
                <SelectValue placeholder="Select a case study" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                {loadingCaseStudies ? (
                  <SelectItem value="loading" disabled className="text-gray-500 dark:text-gray-400">
                    Loading case studies...
                  </SelectItem>
                ) : caseStudies && caseStudies.length > 0 ? (
                  caseStudies.map((caseStudy) => (
                    <SelectItem key={caseStudy.id} value={caseStudy.id} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                      {caseStudy.title} ({caseStudy.subject})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-case-studies" disabled className="text-gray-500 dark:text-gray-400">
                    No case studies available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.caseStudy && <p className="text-sm text-red-500 mt-1">{errors.caseStudy}</p>}
          </div>

          <div>
            <Label htmlFor="instructor" className="text-gray-700 dark:text-gray-300">
              Assigned Instructor Email *
            </Label>
            <Input
              id="instructor"
              type="email"
              value={assignedInstructorId}
              onChange={(e) => setAssignedInstructorId(e.target.value)}
              placeholder="instructor@university.edu"
              className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                errors.instructor ? 'border-red-500' : ''
              }`}
            />
            {errors.instructor && <p className="text-sm text-red-500 mt-1">{errors.instructor}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || loadingCaseStudies}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Enrollment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
