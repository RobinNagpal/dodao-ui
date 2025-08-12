'use client';

import { useState } from 'react';
import { StudentLogin } from '@/components/login/student-login';
import { ProfessorLogin } from '@/components/login/professor-login';
import { ProfessorCaseManagement } from '@/components/professor/professor-case-management';
import { ProfessorMonitoring } from '@/components/professor/professor-monitoring';
import { CourseDashboard } from '@/components/student/course-dashboard';
import { LandingScreen } from '@/components/student/landing-screen';
import { ExerciseWorkflow } from '@/components/student/exercise-workflow';
import { ModelTransition } from '@/components/student/model-transition';
import { FinalOutput } from '@/components/student/final-output';
import { CaseStudy, Exercise, StudentProgress, Screen, UserType } from '@/types';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('student-login');
  const [userType, setUserType] = useState<UserType>('student');
  const [userEmail, setUserEmail] = useState<string>('');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [progress, setProgress] = useState<StudentProgress>({
    currentModel: '4Cs',
    currentExercise: 'customer-needs',
    completedExercises: [],
    answers: {},
  });

  const exercises: Exercise[] = [
    // 4Cs Exercises
    {
      id: 'customer-needs',
      title: 'Customer – Identify Top Needs and Wants',
      model: '4Cs of Marketing',
      modelStep: 1,
      totalSteps: 5,
      instructions: 'Prompt AI to list the top 5 needs or wants of Allbirds customers when buying a new eco-friendly performance running shoe.',
      guidelines: [
        'Be specific: mention "Allbirds" and "sustainable shoe" in your prompt',
        'Ask for prioritized insights (e.g. rank by importance)',
        'Limit to five clear, distinct items',
        'Focus on the new category (performance running shoes)',
      ],
      examplePrompt:
        "Using recent market data on eco-friendly footwear, list and briefly explain the top 5 customer needs for Allbirds' upcoming sustainable performance running shoe, ranked by importance.",
      expectedOutput:
        '1. All-day comfort: Lightweight cushioning that supports varied terrain\n2. Eco-materials: 100% natural wool or plant-based alternatives\n3. Durability: Resistance to wear, water, and mud on trails\n4. Breathability: Moisture-wicking design for long runs\n5. Style versatility: Looks good both on the trail and in casual settings',
    },
    {
      id: 'cost-willingness',
      title: 'Cost – Gauge Willingness to Pay',
      model: '4Cs of Marketing',
      modelStep: 2,
      totalSteps: 5,
      instructions: 'Ask AI to estimate the price range that target customers expect for this new Allbirds performance running shoe.',
      guidelines: [
        'Reference comparable sustainable-shoe brands',
        'Ask for rationale behind the price points',
        'Keep the range realistic (in USD)',
        'Include any premium for eco-credentials',
      ],
      examplePrompt:
        "Based on competitor pricing and customer surveys, what price range (low–high) would Allbirds' eco-conscious buyers accept for a new plant-based performance running shoe? Include any premium % for sustainability.",
      expectedOutput:
        'Price range: $120–$160\nEco-premium: Customers will pay ~15% more for fully plant-based materials\nRationale: Aligns with competitor prices (Patagonia Trail Runners at $140) and adds value for sustainability',
    },
    {
      id: 'convenience-purchase',
      title: 'Convenience – Map Purchase & Delivery Preferences',
      model: '4Cs of Marketing',
      modelStep: 3,
      totalSteps: 5,
      instructions: 'Have AI outline where and how target customers prefer to buy, covering channels and fulfillment preferences.',
      guidelines: [
        'Specify "Allbirds shoppers" and "new running shoe"',
        'Ask for channel ranking or approximate % usage',
        'Include key delivery features (e.g. free 30-day return)',
        'Focus on convenience factors',
      ],
      examplePrompt:
        "For Allbirds' performance running shoe buyers, list the top 3 purchase channels (with % estimates) and their delivery/return preferences.",
      expectedOutput:
        '1. Allbirds.com (60%) – Free standard shipping, 30-day free returns\n2. Amazon (25%) – Prime two-day delivery, paid returns\n3. Outdoor retailers (15%) – In-store try-on, same-day pickup where available',
    },
    {
      id: 'communication-channels',
      title: 'Communication – Find Best Discovery Channels & Messages',
      model: '4Cs of Marketing',
      modelStep: 4,
      totalSteps: 5,
      instructions: 'Prompt AI for the three most effective marketing channels and core message themes to reach these buyers.',
      guidelines: [
        'Focus on socially driven channels (e.g. Instagram, running blogs)',
        'Ask for both channel and one key "hook"',
        'Keep each hook to one sentence',
        'Target eco-conscious runners specifically',
      ],
      examplePrompt:
        'Which 3 channels will most influence eco-runners to try Allbirds\' new performance running shoe, and what one-sentence message ("hook") should we use in each?',
      expectedOutput:
        'Instagram influencers: "Run cleaner—your new favorite running shoe is 100% plant-based and built for performance"\nRunning blogs & podcasts: "Tackle any distance guilt-free with Allbirds\' sustainable performance runner"\nEmail newsletter: "Be first: pre-order our eco-engineered running shoe with free returns"',
    },
    {
      id: 'synthesis-4cs',
      title: 'Synthesis – Build Your 4Cs Summary Table',
      model: '4Cs of Marketing',
      modelStep: 5,
      totalSteps: 5,
      instructions: 'Combine your findings into a simple 4×2 table: one row per "C," two columns ("Insight" and "Key data").',
      guidelines: [
        'Use the exact phrasing from your outputs',
        'Keep each cell to one sentence',
        'Make sure "Key data" cites a number or fact',
        'Synthesize all previous exercises',
      ],
      examplePrompt:
        'Create a summary table with my 4Cs findings: Customer (comfort + eco-materials), Cost ($120-160 + 15% eco premium), Convenience (60% Allbirds.com), Communication (Instagram "Run cleaner" message).',
      expectedOutput:
        'Customer | Trail-runners need eco-materials plus all-day comfort | Ranked #1 need → comfort\nCost | Buyers accept $120–$160, with a 15% eco-premium | Price range $120–$160\nConvenience | Most buy on Allbirds.com with free shipping & returns | 60% via Allbirds.com\nCommunication | Instagram hooks them with "Run cleaner" | Top channel: Instagram',
    },
  ];

  const handleStudentLogin = (email: string) => {
    setUserEmail(email);
    setUserType('student');
    setCurrentScreen('dashboard');
  };

  const handleProfessorLogin = (email: string) => {
    setUserEmail(email);
    setUserType('professor');
    setCurrentScreen('professor-case-management');
  };

  const handleLogout = () => {
    setUserEmail('');
    setSelectedCaseStudy(null);
    setCurrentScreen('student-login');
    setProgress({
      currentModel: '4Cs',
      currentExercise: 'customer-needs',
      completedExercises: [],
      answers: {},
    });
  };

  const handleSwitchToStudent = () => {
    setCurrentScreen('student-login');
  };

  const handleSwitchToProfessor = () => {
    setCurrentScreen('professor-login');
  };

  const handleCaseStudySelect = (caseStudy: CaseStudy) => {
    setSelectedCaseStudy(caseStudy);
    setCurrentScreen('landing');
  };

  const handleViewCaseStudy = (caseStudy: CaseStudy) => {
    setSelectedCaseStudy(caseStudy);
    setCurrentScreen('professor-monitoring');
  };

  const handleScreenChange = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleProgressUpdate = (newProgress: Partial<StudentProgress>) => {
    setProgress((prev) => ({ ...prev, ...newProgress }));
  };

  const getCurrentExercise = () => {
    return exercises.find((ex) => ex.id === progress.currentExercise) || exercises[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === 'student-login' && <StudentLogin onLogin={handleStudentLogin} onSwitchToProfessor={handleSwitchToProfessor} />}

      {currentScreen === 'professor-login' && <ProfessorLogin onLogin={handleProfessorLogin} onSwitchToStudent={handleSwitchToStudent} />}

      {currentScreen === 'dashboard' && userType === 'student' && (
        <CourseDashboard studentEmail={userEmail} onCaseStudySelect={handleCaseStudySelect} onLogout={handleLogout} />
      )}

      {currentScreen === 'professor-case-management' && userType === 'professor' && (
        <ProfessorCaseManagement professorEmail={userEmail} onLogout={handleLogout} onViewCaseStudy={handleViewCaseStudy} />
      )}

      {currentScreen === 'professor-monitoring' && userType === 'professor' && (
        <ProfessorMonitoring
          professorEmail={userEmail}
          onLogout={handleLogout}
          selectedCaseStudy={selectedCaseStudy}
          onBack={() => setCurrentScreen('professor-case-management')}
        />
      )}

      {currentScreen === 'landing' && selectedCaseStudy && (
        <LandingScreen
          onStart={() => handleScreenChange('exercise')}
          progress={progress}
          caseStudy={selectedCaseStudy}
          onBack={() => handleScreenChange('dashboard')}
        />
      )}

      {currentScreen === 'exercise' && (
        <ExerciseWorkflow
          exercise={getCurrentExercise()}
          progress={progress}
          onProgressUpdate={handleProgressUpdate}
          onNext={() => {
            // Logic to determine next screen
            const currentIndex = exercises.findIndex((ex) => ex.id === progress.currentExercise);
            if (currentIndex < exercises.length - 1) {
              // Move to next exercise
              const nextExercise = exercises[currentIndex + 1];
              handleProgressUpdate({ currentExercise: nextExercise.id });
            } else {
              // Move to transition or final screen
              handleScreenChange('transition');
            }
          }}
          onBack={() => handleScreenChange('landing')}
        />
      )}

      {currentScreen === 'transition' && (
        <ModelTransition
          completedModel="4Cs of Marketing"
          nextModel="STP Model"
          answers={progress.answers}
          onContinue={() => handleScreenChange('exercise')}
          onBack={() => handleScreenChange('exercise')}
        />
      )}

      {currentScreen === 'final' && (
        <FinalOutput
          answers={progress.answers}
          onRestart={() => {
            setProgress({
              currentModel: '4Cs',
              currentExercise: 'customer-needs',
              completedExercises: [],
              answers: {},
            });
            handleScreenChange('landing');
          }}
        />
      )}
    </div>
  );
}
