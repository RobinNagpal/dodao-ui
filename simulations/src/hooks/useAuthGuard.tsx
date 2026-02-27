import { useAuthCheck, UseAuthCheckOptions } from './useAuthCheck';
import AdminLoading from '@/components/admin/AdminLoading';
import InstructorLoading from '@/components/instructor/InstructorLoading';
import StudentLoading from '@/components/student/StudentLoading';

type LoadingComponentType = 'admin' | 'instructor' | 'student';

interface UseAuthGuardOptions extends UseAuthCheckOptions {
  /**
   * Type of loading component to use
   */
  loadingType: LoadingComponentType;
  /**
   * Custom loading text (optional)
   */
  loadingText?: string;
  /**
   * Custom loading subtitle (optional)
   */
  loadingSubtitle?: string;
  /**
   * Additional loading conditions (e.g., data loading states)
   */
  additionalLoadingConditions?: boolean[];
}

interface UseAuthGuardReturn {
  session: ReturnType<typeof useAuthCheck>['session'];
  isAuthorized: boolean | null;
  /**
   * Renders the appropriate loading component if auth is still being checked or user is unauthorized
   * Returns null if authorized and ready
   */
  renderAuthGuard: () => JSX.Element | null;
  /**
   * Checks if any loading condition is active
   */
  isLoading: boolean;
}

/**
 * Hook that combines authentication checking with loading state management
 * Automatically renders appropriate loading components based on user type
 */
export function useAuthGuard(options: UseAuthGuardOptions): UseAuthGuardReturn {
  const { loadingType, loadingText, loadingSubtitle, additionalLoadingConditions = [], ...authCheckOptions } = options;

  const { session, status, isAuthorized } = useAuthCheck(authCheckOptions);

  const isLoading = additionalLoadingConditions.some((condition) => condition);

  const renderAuthGuard = (): JSX.Element | null => {
    // Still checking auth or loading session
    if (status === 'loading' || isAuthorized === null) {
      const defaultText = loadingText || 'Loading...';
      const defaultSubtitle = loadingSubtitle || 'Checking authorization...';

      switch (loadingType) {
        case 'admin':
          return <AdminLoading text={defaultText} subtitle={defaultSubtitle} />;
        case 'instructor':
          return <InstructorLoading text={defaultText} subtitle={defaultSubtitle} variant="enhanced" />;
        case 'student':
          return <StudentLoading text={defaultText} subtitle={defaultSubtitle} variant="enhanced" />;
      }
    }

    // Unauthorized - show redirecting message
    if (isAuthorized === false) {
      const defaultText = 'Redirecting...';
      const defaultSubtitle = 'Taking you to login page...';

      switch (loadingType) {
        case 'admin':
          return <AdminLoading text={defaultText} subtitle={defaultSubtitle} />;
        case 'instructor':
          return <InstructorLoading text={defaultText} subtitle={defaultSubtitle} variant="enhanced" />;
        case 'student':
          return <StudentLoading text={defaultText} subtitle={defaultSubtitle} variant="enhanced" />;
      }
    }

    // Additional loading conditions (e.g., data loading)
    if (isLoading) {
      const defaultText = loadingText || 'Loading...';
      const defaultSubtitle = loadingSubtitle || 'Preparing your workspace...';

      switch (loadingType) {
        case 'admin':
          return <AdminLoading text={defaultText} subtitle={defaultSubtitle} />;
        case 'instructor':
          return <InstructorLoading text={defaultText} subtitle={defaultSubtitle} variant="enhanced" />;
        case 'student':
          return <StudentLoading text={defaultText} subtitle={defaultSubtitle} variant="enhanced" />;
      }
    }

    // Authorized and ready
    return null;
  };

  return {
    session,
    isAuthorized,
    renderAuthGuard,
    isLoading,
  };
}
