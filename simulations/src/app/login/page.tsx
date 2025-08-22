'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentLogin } from '@/components/login/student-login';
import { InstructorLogin } from '@/components/login/instructor-login';
import { isAdminEmail, isInstructorEmail, isStudentEmail } from '@/dummy/mockData';

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'student' | 'instructor'>('student');
  const [studentErrorMessage, setStudentErrorMessage] = useState<string | undefined>(undefined);
  const [instructorErrorMessage, setInstructorErrorMessage] = useState<string | undefined>(undefined);
  const router = useRouter();

  const handleStudentLogin = (email: string) => {
    // Clear any previous error message
    setStudentErrorMessage(undefined);

    // Check if the email belongs to an admin
    if (isAdminEmail(email)) {
      localStorage.setItem('user_type', 'admin');
      localStorage.setItem('user_email', email);
      router.push('/admin');
      return;
    }

    // Regular student login
    if (isStudentEmail(email)) {
      localStorage.setItem('user_type', 'student');
      localStorage.setItem('user_email', email);
      router.push('/student');
      return;
    }

    // If we get here, the email is not valid
    setStudentErrorMessage('No student record exists for the email you entered.');
  };

  const handleInstructorLogin = (email: string) => {
    // Clear any previous error message
    setInstructorErrorMessage(undefined);

    if (isAdminEmail(email)) {
      localStorage.setItem('user_type', 'admin');
      localStorage.setItem('user_email', email);
      router.push('/admin');
      return;
    }

    if (isInstructorEmail(email)) {
      localStorage.setItem('user_type', 'instructor');
      localStorage.setItem('user_email', email);
      router.push('/instructor');
      return;
    }

    // If we get here, the email is not valid
    setInstructorErrorMessage('No instructor record exists for the email you entered.');
  };

  const handleSwitchToStudent = () => {
    setLoginType('student');
    setStudentErrorMessage(undefined);
  };

  const handleSwitchToInstructor = () => {
    setLoginType('instructor');
    setInstructorErrorMessage(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loginType === 'student' && (
        <StudentLogin onLogin={handleStudentLogin} onSwitchToInstructor={handleSwitchToInstructor} errorMessage={studentErrorMessage} />
      )}
      {loginType === 'instructor' && (
        <InstructorLogin onLogin={handleInstructorLogin} onSwitchToStudent={handleSwitchToStudent} errorMessage={instructorErrorMessage} />
      )}
    </div>
  );
}
