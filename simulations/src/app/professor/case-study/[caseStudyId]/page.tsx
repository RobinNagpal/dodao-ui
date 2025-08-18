'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCaseStudyById, getModulesByCaseStudyId } from '@/dummy/mockData';
import type { CaseStudy, CaseStudyModule } from '@/types';
import { ArrowLeft, BookOpen, Users, BarChart3, Plus, Edit3, Target, TrendingUp, CheckCircle } from 'lucide-react';

export default function ProfessorCaseStudyManagement() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [modules, setModules] = useState<CaseStudyModule[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'analytics'>('overview');

  const router = useRouter();
  const params = useParams();
  const caseStudyId = params.caseStudyId as string;

  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    const email = localStorage.getItem('user_email');

    if (!userType || userType !== 'professor' || !email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);

    // Load case study data
    const studyData = getCaseStudyById(caseStudyId);
    if (!studyData) {
      router.push('/professor');
      return;
    }

    setCaseStudy(studyData);
    setModules(getModulesByCaseStudyId(caseStudyId));
    setIsLoading(false);
  }, [router, caseStudyId]);

  const handleBack = () => {
    router.push('/professor');
  };

  const handleEditModule = (module: CaseStudyModule) => {
    // In future, this would open an edit form
    alert(`Edit module: ${module.title}`);
  };

  const handleAddModule = () => {
    // In future, this would open a create form
    alert('Add new module feature coming soon!');
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

  const enrolledStudents = caseStudy.enrollments?.reduce((total, enrollment) => total + (enrollment.students?.length || 0), 0) || 0;

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
              <div className="h-6 w-px bg-border"></div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{caseStudy.title}</h1>
                <p className="text-muted-foreground">Professor Management Console</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Logged in as {userEmail}</div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-6">
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enrolled Students</p>
                  <p className="text-xl font-semibold text-foreground">{enrolledStudents}</p>
                </div>
              </div>
            </div>
            <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/20">
              <div className="flex items-center space-x-3">
                <div className="bg-secondary/10 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Modules</p>
                  <p className="text-xl font-semibold text-foreground">{modules.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
              <div className="flex items-center space-x-3">
                <div className="bg-accent/10 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Exercises</p>
                  <p className="text-xl font-semibold text-foreground">{modules.reduce((total, module) => total + (module.exercises?.length || 0), 0)}</p>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <div className="flex items-center space-x-3">
                <div className="bg-muted p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Progress</p>
                  <p className="text-xl font-semibold text-foreground">68%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === 'students'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Students</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Case Study Details */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Case Study Details</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{caseStudy.shortDescription}</p>
              <div className="bg-card/70 backdrop-blur-sm rounded-xl p-6 border border-border/50">
                <p className="text-foreground leading-relaxed">{caseStudy.details}</p>
              </div>
            </div>

            {/* Modules Management */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Learning Modules</h2>
                  <p className="text-muted-foreground">Manage and organize your case study content</p>
                </div>
                <button
                  onClick={handleAddModule}
                  className="flex items-center space-x-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Module</span>
                </button>
              </div>

              <div className="space-y-4">
                {modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="group border border-border rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">Module {module.orderNumber}</div>
                          <div className="h-2 w-2 rounded-full bg-muted-foreground/30"></div>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Target className="h-4 w-4 mr-1" />
                            {module.exercises?.length || 0} exercises
                          </span>
                        </div>

                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{module.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{module.shortDescription}</p>
                      </div>

                      <div className="flex items-center space-x-3 ml-6">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground mb-1">Status</div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-secondary" />
                            <span className="text-sm text-secondary font-medium">Active</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleEditModule(module)}
                          className="bg-primary/10 text-primary p-2 rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {modules.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No modules yet</h3>
                  <p className="text-muted-foreground mb-4">Start building your case study by adding the first module.</p>
                  <button onClick={handleAddModule} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Add First Module
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-card rounded-xl shadow-sm border border-border p-8">
            <div className="text-center py-12">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Student Progress Monitoring</h2>
              <div className="text-muted-foreground max-w-md mx-auto">
                <p className="mb-4">Advanced student monitoring features are coming soon!</p>
                <div className="bg-muted/30 rounded-lg p-4 text-left">
                  <p className="font-medium mb-2">This section will include:</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Individual student progress tracking</li>
                    <li>• Exercise completion analytics</li>
                    <li>• AI prompt and response analysis</li>
                    <li>• Performance insights and recommendations</li>
                    <li>• Real-time activity monitoring</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-card rounded-xl shadow-sm border border-border p-8">
            <div className="text-center py-12">
              <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Analytics & Insights Dashboard</h2>
              <div className="text-muted-foreground max-w-md mx-auto">
                <p className="mb-4">Comprehensive analytics dashboard is in development!</p>
                <div className="bg-muted/30 rounded-lg p-4 text-left">
                  <p className="font-medium mb-2">Coming features:</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Module completion rates and trends</li>
                    <li>• Common student challenges identification</li>
                    <li>• AI prompt effectiveness analysis</li>
                    <li>• Time spent on exercises breakdown</li>
                    <li>• Learning outcome assessments</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
