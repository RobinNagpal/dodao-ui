'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCaseStudyById, getModulesByCaseStudyId } from '@/dummy/mockData';
import type { CaseStudy, CaseStudyModule } from '@/types';
import { ArrowLeft, BookOpen, Clock, Play, CheckCircle, User, Building } from 'lucide-react';

export default function CaseStudyOverview() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [modules, setModules] = useState<CaseStudyModule[]>([]);
  const router = useRouter();
  const params = useParams();
  const caseStudyId = params.caseStudyId as string;

  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    const email = localStorage.getItem('user_email');

    if (!userType || userType !== 'student' || !email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);

    // Load case study data
    const studyData = getCaseStudyById(caseStudyId);
    if (!studyData) {
      router.push('/student');
      return;
    }

    setCaseStudy(studyData);
    setModules(getModulesByCaseStudyId(caseStudyId));
    setIsLoading(false);
  }, [router, caseStudyId]);

  const handleModuleSelect = (module: CaseStudyModule) => {
    router.push(`/student/case-study/${caseStudyId}/module/${module.id}`);
  };

  const handleBack = () => {
    router.push('/student');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-lg text-foreground">Loading case study...</span>
        </div>
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Case study not found</h3>
          <p className="text-muted-foreground mb-4">The case study you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button onClick={handleBack} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getSubjectDisplayName = (subject: string) => {
    const displayNames = {
      HR: 'Human Resources',
      ECONOMICS: 'Economics',
      MARKETING: 'Marketing',
      FINANCE: 'Finance',
      OPERATIONS: 'Operations',
    };
    return displayNames[subject as keyof typeof displayNames] || subject;
  };

  const totalExercises = modules.reduce((total, module) => total + (module.exercises?.length || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button onClick={handleBack} className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="text-sm text-muted-foreground">Logged in as {userEmail}</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 mb-8 border border-border">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">{getSubjectDisplayName(caseStudy.subject)}</span>
                {caseStudy.createdBy ? (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    Created by {caseStudy.createdBy}
                  </span>
                ) : (
                  <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Building className="h-3 w-3 mr-1" />
                    Predefined Case Study
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{caseStudy.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{caseStudy.shortDescription}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Modules</p>
                  <p className="text-xl font-semibold text-foreground">{modules.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
              <div className="flex items-center space-x-3">
                <div className="bg-secondary/10 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Exercises</p>
                  <p className="text-xl font-semibold text-foreground">{totalExercises}</p>
                </div>
              </div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
              <div className="flex items-center space-x-3">
                <div className="bg-accent/10 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-xl font-semibold text-foreground">0%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Case Study Details */}
          <div className="bg-card/70 backdrop-blur-sm rounded-xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-3">Case Study Details</h3>
            <p className="text-foreground leading-relaxed">{caseStudy.details}</p>
          </div>
        </div>

        {/* Learning Modules */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Learning Modules</h2>
              <p className="text-muted-foreground">Complete each module in sequence to master the concepts and apply them to real-world scenarios.</p>
            </div>
          </div>

          <div className="space-y-4">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className="group bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer hover:border-primary/40"
                onClick={() => handleModuleSelect(module)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">Module {module.orderNumber}</div>
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30"></div>
                        <span className="text-sm text-muted-foreground">{module.exercises?.length || 0} exercises</span>
                      </div>

                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{module.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{module.shortDescription}</p>
                    </div>

                    <div className="flex items-center space-x-4 ml-6">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Status</div>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground/30"></div>
                          <span className="text-sm text-muted-foreground">Not Started</span>
                        </div>
                      </div>

                      <div className="bg-primary text-primary-foreground p-3 rounded-lg group-hover:bg-primary/90 transition-colors">
                        <Play className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-muted">
                  <div className="h-full bg-primary w-0 transition-all duration-300"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {modules.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No modules available</h3>
              <p className="text-muted-foreground">This case study doesn&apos;t have any modules yet. Please check back later or contact your instructor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
