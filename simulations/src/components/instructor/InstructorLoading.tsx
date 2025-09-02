import { GraduationCap } from 'lucide-react';

interface InstructorLoadingProps {
  text?: string;
  subtitle?: string;
  variant?: 'simple' | 'enhanced';
}

export default function InstructorLoading({
  text = 'Loading...',
  subtitle = 'Please wait while we prepare your content',
  variant = 'simple',
}: InstructorLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        {variant === 'enhanced' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        )}
      </div>

      {/* Loading Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100">
        {variant === 'enhanced' ? (
          <div className="text-center p-8">
            <div className="relative mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-purple-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{text}</h3>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
        ) : (
          <div className="flex items-center space-x-3 px-8 py-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-purple-600 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-lg font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{text}</span>
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
