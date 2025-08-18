'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentLogin } from '@/components/login/student-login';
import { InstructorLogin } from '@/components/login/instructor-login';
import { isAdminEmail } from '@/dummy/mockData';

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'student' | 'instructor'>('student');
  const router = useRouter();

  const handleStudentLogin = (email: string) => {
    // Check if the email belongs to an admin
    if (isAdminEmail(email)) {
      localStorage.setItem('user_type', 'admin');
      localStorage.setItem('user_email', email);
      router.push('/admin');
      return;
    }

    // Regular student login
    localStorage.setItem('user_type', 'student');
    localStorage.setItem('user_email', email);
    router.push('/student');
  };

  const handleInstructorLogin = (email: string) => {
    localStorage.setItem('user_type', 'instructor');
    localStorage.setItem('user_email', email);
    router.push('/instructor');
  };

  const handleSwitchToStudent = () => {
    setLoginType('student');
  };

  const handleSwitchToInstructor = () => {
    setLoginType('instructor');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loginType === 'student' && <StudentLogin onLogin={handleStudentLogin} onSwitchToInstructor={handleSwitchToInstructor} />}
      {loginType === 'instructor' && <InstructorLogin onLogin={handleInstructorLogin} onSwitchToStudent={handleSwitchToStudent} />}
    </div>
  );
}
