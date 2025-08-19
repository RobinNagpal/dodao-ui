'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Mail, Sparkles } from 'lucide-react';
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
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border border-emerald-100/50 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-emerald-50 to-green-50 -m-6 mb-4 p-6 rounded-t-lg border-b border-emerald-100">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <span>Create New Enrollment</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="caseStudy" className="text-emerald-700 font-medium flex items-center space-x-2 mb-2">
              <BookOpen className="h-4 w-4" />
              <span>Case Study *</span>
            </Label>
            <Select value={selectedCaseStudyId} onValueChange={setSelectedCaseStudyId}>
              <SelectTrigger
                className={`bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 ${errors.caseStudy ? 'border-red-500' : ''}`}
              >
                <SelectValue placeholder="Select a case study" />
              </SelectTrigger>
              <SelectContent className="bg-white border-emerald-100">
                {loadingCaseStudies ? (
                  <SelectItem value="loading" disabled className="text-gray-500">
                    Loading case studies...
                  </SelectItem>
                ) : caseStudies && caseStudies.length > 0 ? (
                  caseStudies.map((caseStudy) => (
                    <SelectItem key={caseStudy.id} value={caseStudy.id} className="text-gray-900 hover:bg-emerald-50">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{caseStudy.title}</span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{caseStudy.subject}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-case-studies" disabled className="text-gray-500">
                    No case studies available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.caseStudy && <p className="text-sm text-red-500 mt-1">{errors.caseStudy}</p>}
          </div>

          <div>
            <Label htmlFor="instructor" className="text-emerald-700 font-medium flex items-center space-x-2 mb-2">
              <Mail className="h-4 w-4" />
              <span>Assigned Instructor Email *</span>
            </Label>
            <Input
              id="instructor"
              type="email"
              value={assignedInstructorId}
              onChange={(e) => setAssignedInstructorId(e.target.value)}
              placeholder="instructor@university.edu"
              className={`bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 placeholder:text-gray-500 ${
                errors.instructor ? 'border-red-500' : ''
              }`}
            />
            {errors.instructor && <p className="text-sm text-red-500 mt-1">{errors.instructor}</p>}
          </div>
        </div>

        <DialogFooter className="gap-3 pt-4 border-t border-emerald-100">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || loadingCaseStudies}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? 'Creating...' : 'Create Enrollment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
