import { Brain, BookOpen } from 'lucide-react';

interface StudentLoadingProps {
  text?: string;
  subtitle?: string;
  variant?: 'simple' | 'enhanced';
}

export default function StudentLoading({
  text = 'Loading...',
  subtitle = 'Please wait while we prepare your content',
  variant = 'simple',
}: StudentLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        {variant === 'enhanced' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        )}
      </div>

      {/* Loading Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100">
        {variant === 'enhanced' ? (
          <div className="flex flex-col items-center space-y-4 p-8">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{text}</h3>
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 px-8 py-6">
            <div className="relative">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-blue-600 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{text}</span>
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
