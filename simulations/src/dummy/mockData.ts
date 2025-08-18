import { CaseStudy, CaseStudyModule, ModuleExercise, CaseStudyEnrollment, EnrollmentStudent, BusinessSubject } from '@/types';

// Mock admin credentials for login validation
export const mockAdminCredentials = ['admin@example.com', 'admin2@example.com'];

// Helper function to check if email belongs to an admin
export const isAdminEmail = (email: string): boolean => {
  return mockAdminCredentials.includes(email.toLowerCase());
};

// Mock enrollments for case studies
// - Enrollments created by admins only (ClassCaseStudyEnrollment.createdBy = admin email)
// - Students added to enrollments by admins, EnrollmentStudent.assignedStudentId = student email, createdBy = admin email
export const mockEnrollments: CaseStudyEnrollment[] = [
  {
    id: 'enrollment-1',
    caseStudyId: 'case-study-1',
    assignedInstructorId: 'instructor@example.com',
    createdBy: 'admin@example.com', // Only admins create enrollments
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    students: [
      {
        id: 'student-1',
        enrollmentId: 'enrollment-1',
        assignedStudentId: 'student1@example.com',
        createdBy: 'admin@example.com', // Admin email who added the student
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'student-1a',
        enrollmentId: 'enrollment-1',
        assignedStudentId: 'alice@student.com',
        createdBy: 'admin@example.com', // Admin email who added the student
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ],
  },
  {
    id: 'enrollment-2',
    caseStudyId: 'case-study-2',
    assignedInstructorId: 'instructor@example.com',
    createdBy: 'admin@example.com', // Only admins create enrollments
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    students: [
      {
        id: 'student-2',
        enrollmentId: 'enrollment-2',
        assignedStudentId: 'student2@example.com',
        createdBy: 'admin@example.com', // Admin email who added the student
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: 'student-2a',
        enrollmentId: 'enrollment-2',
        assignedStudentId: 'bob@student.com',
        createdBy: 'admin@example.com', // Admin email who added the student
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
    ],
  },
  {
    id: 'enrollment-3',
    caseStudyId: 'case-study-3',
    assignedInstructorId: 'instructor-hr@example.com',
    createdBy: 'admin@example.com', // Only admins create enrollments
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    students: [
      {
        id: 'student-3',
        enrollmentId: 'enrollment-3',
        assignedStudentId: 'student3@example.com',
        createdBy: 'admin@example.com', // Admin email who added the student
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
    ],
  },
];

export const mockCaseStudies: CaseStudy[] = [
  // MARKETING Case Studies
  {
    id: 'case-study-1',
    title: 'Allbirds Performance Running Shoe Launch',
    shortDescription: 'Strategic marketing analysis for a new eco-friendly performance running shoe',
    details:
      'Allbirds wants to launch a new line of sustainable performance running shoes. Use marketing frameworks to develop a comprehensive go-to-market strategy.',
    subject: 'MARKETING',
    createdBy: 'admin@example.com', // Only admins create case studies
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    enrollments: [mockEnrollments[0]],
    modules: [
      {
        id: 'module-1',
        caseStudyId: 'case-study-1',
        title: '4Cs of Marketing',
        shortDescription: 'Customer, Cost, Convenience, and Communication analysis',
        details: 'Analyze the market using the 4Cs framework to understand customer needs, pricing, distribution, and communication strategies.',
        orderNumber: 1,
        createdBy: 'admin@example.com', // Modules created by admins
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        exercises: [
          {
            id: 'exercise-1-1',
            moduleId: 'module-1',
            title: 'Customer – Identify Top Needs and Wants',
            shortDescription: 'Analyze customer needs for eco-friendly performance running shoes',
            details: 'Prompt AI to list the top 5 needs or wants of Allbirds customers when buying a new eco-friendly performance running shoe.',
            orderNumber: 1,
            createdBy: 'admin@example.com', // Exercises created by admins
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          {
            id: 'exercise-1-2',
            moduleId: 'module-1',
            title: 'Cost – Gauge Willingness to Pay',
            shortDescription: 'Estimate price range for target customers',
            details: 'Ask AI to estimate the price range that target customers expect for this new Allbirds performance running shoe.',
            orderNumber: 2,
            createdBy: 'prof@example.com',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          {
            id: 'exercise-1-3',
            moduleId: 'module-1',
            title: 'Convenience – Map Purchase & Delivery Preferences',
            shortDescription: 'Analyze purchase channels and delivery preferences',
            details: 'Have AI outline where and how target customers prefer to buy, covering channels and fulfillment preferences.',
            orderNumber: 3,
            createdBy: 'prof@example.com',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ],
      },
      {
        id: 'module-2',
        caseStudyId: 'case-study-1',
        title: 'STP Model',
        shortDescription: 'Segmentation, Targeting, and Positioning analysis',
        details: 'Apply the STP framework to identify market segments, target audience, and positioning strategy.',
        orderNumber: 2,
        createdBy: 'prof@example.com',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        exercises: [
          {
            id: 'exercise-2-1',
            moduleId: 'module-2',
            title: 'Segmentation – Market Analysis',
            shortDescription: 'Identify market segments for running shoes',
            details: 'Analyze different market segments for eco-friendly running shoes.',
            orderNumber: 1,
            createdBy: 'prof@example.com',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ],
      },
    ],
  },

  // FINANCE Case Studies
  {
    id: 'case-study-2',
    title: 'Tesla Model Y Investment Analysis',
    shortDescription: 'Financial analysis for Tesla Model Y expansion funding',
    details: 'Evaluate the financial viability of Tesla Model Y expansion project and determine optimal funding structure.',
    subject: 'FINANCE',
    createdBy: 'admin@example.com', // Only admins create case studies
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    enrollments: [mockEnrollments[1]],
    modules: [
      {
        id: 'module-3',
        caseStudyId: 'case-study-2',
        title: 'Financial Modeling',
        shortDescription: 'Build comprehensive financial models for project evaluation',
        details: 'Create detailed financial models to assess the investment opportunity.',
        orderNumber: 1,
        createdBy: 'admin@example.com', // Modules created by admins
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        exercises: [
          {
            id: 'exercise-3-1',
            moduleId: 'module-3',
            title: 'DCF Analysis',
            shortDescription: 'Perform discounted cash flow analysis',
            details: 'Calculate the net present value of the Tesla Model Y expansion project.',
            orderNumber: 1,
            createdBy: 'admin@example.com', // Exercises created by admins
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02'),
          },
        ],
      },
    ],
  },

  // HR Case Studies
  {
    id: 'case-study-3',
    title: 'Google Remote Work Policy Implementation',
    shortDescription: 'HR strategy for implementing hybrid work model at scale',
    details: "Design and implement a comprehensive remote work policy for Google's global workforce.",
    subject: 'HR',
    createdBy: 'admin@example.com', // Only admins create case studies
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    enrollments: [mockEnrollments[2]],
    modules: [
      {
        id: 'module-4',
        caseStudyId: 'case-study-3',
        title: 'Change Management',
        shortDescription: 'Managing organizational change for remote work transition',
        details: 'Develop strategies to successfully implement organizational change.',
        orderNumber: 1,
        createdBy: 'admin-hr@example.com',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        exercises: [
          {
            id: 'exercise-4-1',
            moduleId: 'module-4',
            title: 'Stakeholder Analysis',
            shortDescription: 'Identify and analyze key stakeholders',
            details: 'Map out all stakeholders affected by the remote work policy change.',
            orderNumber: 1,
            createdBy: 'admin-hr@example.com',
            createdAt: new Date('2024-01-03'),
            updatedAt: new Date('2024-01-03'),
          },
        ],
      },
    ],
  },

  // OPERATIONS Case Studies
  {
    id: 'case-study-4',
    title: 'Amazon Supply Chain Optimization',
    shortDescription: "Optimizing Amazon's last-mile delivery operations",
    details: "Analyze and improve Amazon's supply chain efficiency for faster delivery times.",
    subject: 'OPERATIONS',
    createdBy: 'admin@example.com', // All case studies created by admins
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
    modules: [
      {
        id: 'module-5',
        caseStudyId: 'case-study-4',
        title: 'Process Optimization',
        shortDescription: 'Identify bottlenecks and optimize processes',
        details: 'Use operations research techniques to optimize delivery processes.',
        orderNumber: 1,
        createdBy: undefined,
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04'),
        exercises: [
          {
            id: 'exercise-5-1',
            moduleId: 'module-5',
            title: 'Bottleneck Analysis',
            shortDescription: 'Identify process bottlenecks',
            details: 'Analyze the delivery process to identify key bottlenecks.',
            orderNumber: 1,
            createdBy: undefined,
            createdAt: new Date('2024-01-04'),
            updatedAt: new Date('2024-01-04'),
          },
        ],
      },
    ],
  },

  // ECONOMICS Case Studies
  {
    id: 'case-study-5',
    title: 'Netflix Pricing Strategy Economics',
    shortDescription: 'Economic analysis of Netflix subscription pricing models',
    details: "Apply economic principles to analyze Netflix's pricing strategy and market positioning.",
    subject: 'ECONOMICS',
    createdBy: 'admin@example.com', // All case studies created by admins
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    modules: [
      {
        id: 'module-6',
        caseStudyId: 'case-study-5',
        title: 'Price Elasticity Analysis',
        shortDescription: 'Analyze demand elasticity for subscription services',
        details: 'Study how price changes affect demand for Netflix subscriptions.',
        orderNumber: 1,
        createdBy: undefined,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
        exercises: [
          {
            id: 'exercise-6-1',
            moduleId: 'module-6',
            title: 'Elasticity Calculation',
            shortDescription: 'Calculate price elasticity of demand',
            details: "Use historical data to calculate Netflix's price elasticity of demand.",
            orderNumber: 1,
            createdBy: undefined,
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date('2024-01-05'),
          },
        ],
      },
    ],
  },
];

// Helper function to check if student is enrolled in a case study
export const isStudentEnrolled = (caseStudyId: string, studentEmail: string): boolean => {
  const caseStudy = mockCaseStudies.find((cs) => cs.id === caseStudyId);
  if (!caseStudy?.enrollments) return false;

  return caseStudy.enrollments.some((enrollment) => enrollment.students?.some((student) => student.assignedStudentId === studentEmail));
};

// Helper function to get enrolled case studies for a student
export const getEnrolledCaseStudies = (studentEmail: string): CaseStudy[] => {
  return mockCaseStudies.filter((caseStudy) => isStudentEnrolled(caseStudy.id, studentEmail));
};

// Helper function to get case studies by subject
export const getCaseStudiesBySubject = (subject: BusinessSubject): CaseStudy[] => {
  return mockCaseStudies.filter((cs) => cs.subject === subject);
};

// Helper function to get all subjects with case study counts
export const getSubjectsWithCounts = (): Array<{ subject: BusinessSubject; count: number }> => {
  const subjects: BusinessSubject[] = ['MARKETING', 'FINANCE', 'HR', 'OPERATIONS', 'ECONOMICS'];
  return subjects.map((subject) => ({
    subject,
    count: getCaseStudiesBySubject(subject).length,
  }));
};

// Helper function to get all modules across case studies
export const getAllModules = (): CaseStudyModule[] => {
  return mockCaseStudies.flatMap((cs) => cs.modules || []);
};

// Helper function to get all exercises across modules
export const getAllExercises = (): ModuleExercise[] => {
  return getAllModules().flatMap((module) => module.exercises || []);
};

// Helper function to get case study by ID
export const getCaseStudyById = (id: string): CaseStudy | undefined => {
  return mockCaseStudies.find((cs) => cs.id === id);
};

// Helper function to get module by ID
export const getModuleById = (id: string): CaseStudyModule | undefined => {
  return getAllModules().find((module) => module.id === id);
};

// Helper function to get exercise by ID
export const getExerciseById = (id: string): ModuleExercise | undefined => {
  return getAllExercises().find((exercise) => exercise.id === id);
};

// Helper function to get modules by case study ID
export const getModulesByCaseStudyId = (caseStudyId: string): CaseStudyModule[] => {
  const caseStudy = getCaseStudyById(caseStudyId);
  return caseStudy?.modules || [];
};

// Helper function to get exercises by module ID
export const getExercisesByModuleId = (moduleId: string): ModuleExercise[] => {
  const targetModule = getModuleById(moduleId);
  return targetModule?.exercises || [];
};

// Instructor-specific helper functions

// Helper function to get all case studies (instructors can see all case studies initially)
export const getAllCaseStudiesForInstructor = (): CaseStudy[] => {
  return mockCaseStudies;
};

// Helper function to get case studies assigned to an instructor
export const getCaseStudiesAssignedToInstructor = (instructorEmail: string): CaseStudy[] => {
  return mockCaseStudies.filter((caseStudy) => caseStudy.enrollments?.some((enrollment) => enrollment.assignedInstructorId === instructorEmail));
};

// Helper function to get case studies by instructor's enrollments
export const getInstructorEnrolledCaseStudies = (instructorEmail: string): CaseStudy[] => {
  return getCaseStudiesAssignedToInstructor(instructorEmail);
};

// Helper function to check if instructor has any enrollments for a case study
export const hasInstructorEnrollments = (caseStudyId: string, instructorEmail: string): boolean => {
  const caseStudy = getCaseStudyById(caseStudyId);
  if (!caseStudy?.enrollments) return false;

  return caseStudy.enrollments.some((enrollment) => enrollment.assignedInstructorId === instructorEmail);
};

// Helper function to add a student to a case study enrollment (for instructors and admins)
export const addStudentToEnrollment = (caseStudyId: string, studentEmail: string, instructorEmail?: string): boolean => {
  const caseStudy = mockCaseStudies.find((cs) => cs.id === caseStudyId);
  if (!caseStudy?.enrollments) return false;

  // Find the enrollment for this case study
  let targetEnrollment = caseStudy.enrollments[0];

  // If instructor is specified, find enrollment assigned to them
  if (instructorEmail) {
    const instructorEnrollment = caseStudy.enrollments.find((enrollment) => enrollment.assignedInstructorId === instructorEmail);
    if (!instructorEnrollment) return false; // Instructor not assigned to this case study
    targetEnrollment = instructorEnrollment;
  }

  // Check if student is already enrolled
  const isAlreadyEnrolled = targetEnrollment.students?.some((student) => student.assignedStudentId === studentEmail);
  if (isAlreadyEnrolled) return false;

  // Add the student
  const newStudent = {
    id: `student-${Date.now()}`,
    enrollmentId: targetEnrollment.id,
    assignedStudentId: studentEmail,
    createdBy: instructorEmail || 'admin@example.com', // Admin or instructor who added the student
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (!targetEnrollment.students) {
    targetEnrollment.students = [];
  }
  targetEnrollment.students.push(newStudent);

  return true;
};

// Helper function to remove a student from enrollment (for instructors and admins)
export const removeStudentFromEnrollment = (caseStudyId: string, studentEmail: string, instructorEmail?: string): boolean => {
  const caseStudy = mockCaseStudies.find((cs) => cs.id === caseStudyId);
  if (!caseStudy?.enrollments) return false;

  // Find the enrollment for this case study
  let targetEnrollment = caseStudy.enrollments[0];

  // If instructor is specified, find enrollment assigned to them
  if (instructorEmail) {
    const instructorEnrollment = caseStudy.enrollments.find((enrollment) => enrollment.assignedInstructorId === instructorEmail);
    if (!instructorEnrollment) return false; // Instructor not assigned to this case study
    targetEnrollment = instructorEnrollment;
  }

  if (!targetEnrollment.students) return false;

  // Remove the student
  const initialLength = targetEnrollment.students.length;
  targetEnrollment.students = targetEnrollment.students.filter((student) => student.assignedStudentId !== studentEmail);

  return targetEnrollment.students.length < initialLength;
};

// Helper function to get students enrolled in a case study (for instructors to manage)
export const getEnrolledStudents = (caseStudyId: string, instructorEmail?: string): string[] => {
  const caseStudy = mockCaseStudies.find((cs) => cs.id === caseStudyId);
  if (!caseStudy?.enrollments) return [];

  // Find the enrollment for this case study
  let targetEnrollment = caseStudy.enrollments[0];

  // If instructor is specified, find enrollment assigned to them
  if (instructorEmail) {
    const instructorEnrollment = caseStudy.enrollments.find((enrollment) => enrollment.assignedInstructorId === instructorEmail);
    if (!instructorEnrollment) return []; // Instructor not assigned to this case study
    targetEnrollment = instructorEnrollment;
  }

  return targetEnrollment.students?.map((student) => student.assignedStudentId).filter((email): email is string => !!email) || [];
};
