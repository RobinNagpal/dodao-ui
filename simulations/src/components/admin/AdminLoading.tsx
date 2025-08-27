import { Sparkles } from 'lucide-react';

interface AdminLoadingProps {
  text?: string;
  subtitle?: string;
  variant?: 'simple' | 'enhanced';
}

export default function AdminLoading({ text = 'Loading...', subtitle = 'Please wait while we prepare your content', variant = 'simple' }: AdminLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        {variant === 'enhanced' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        )}
      </div>

      {/* Loading Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100">
        {variant === 'enhanced' ? (
          <div className="p-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-emerald-600 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{text}</h2>
                {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 px-8 py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <div>
              <span className="text-lg font-medium bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{text}</span>
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
