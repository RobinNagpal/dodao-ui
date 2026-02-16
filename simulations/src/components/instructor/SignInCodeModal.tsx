'use client';

import { useState } from 'react';
import { X, Key, RefreshCw, Copy, Check } from 'lucide-react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import type { StudentSignInCode } from '@prisma/client';

interface SignInCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  studentName: string;
  studentEmail: string;
}

export default function SignInCodeModal({ isOpen, onClose, userId, studentName, studentEmail }: SignInCodeModalProps) {
  const [showConfirmNewCode, setShowConfirmNewCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    data: signInCodeData,
    loading: loadingCode,
    reFetchData: refetchCode,
  } = useFetchData<StudentSignInCode | null>(
    `${getBaseUrl()}/api/users/${userId}/sign-in-code`,
    { skipInitialFetch: !isOpen || !userId },
    'Failed to load sign-in code'
  );

  const { postData: generateNewCode, loading: generatingCode } = usePostData<{ code: string; message: string }, {}>({
    successMessage: 'New sign-in code generated successfully!',
    errorMessage: 'Failed to generate new code',
  });

  const handleGenerateNewCode = async () => {
    try {
      const result = await generateNewCode(`${getBaseUrl()}/api/users/${userId}/sign-in-code`, {});
      if (result) {
        setShowConfirmNewCode(false);
        await refetchCode();
      }
    } catch (error) {
      console.error('Error generating new code:', error);
    }
  };

  const handleCopy = async () => {
    if (signInCodeData?.code) {
      await navigator.clipboard.writeText(signInCodeData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Key className="h-4 w-4 text-blue-600" />
            <h3 className="text-base font-semibold text-gray-900">{studentName ? `${studentName} (${studentEmail})` : studentEmail}</h3>
          </div>
          <button className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-all" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {loadingCode ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-blue-700 font-medium text-sm">Loading sign-in code...</span>
              </div>
            </div>
          ) : signInCodeData?.code ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium mb-1.5">Current Sign-in Code</p>
              <div className="flex items-center justify-between">
                <code className="text-lg font-mono font-bold text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-300">{signInCodeData.code}</code>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-2 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium"
                  title="Copy code"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-3 border border-gray-200 text-center">
              <p className="text-gray-600 font-medium text-sm">No active sign-in code found.</p>
              <p className="text-xs text-gray-500 mt-1">Generate a new code for this student.</p>
            </div>
          )}

          <button
            onClick={() => setShowConfirmNewCode(true)}
            disabled={generatingCode}
            className="w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 text-sm font-medium border-2 border-blue-200"
          >
            <RefreshCw className={`h-4 w-4 ${generatingCode ? 'animate-spin' : ''}`} />
            <span>Generate New Code</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for New Code */}
      <ConfirmationModal
        open={showConfirmNewCode}
        showSemiTransparentBg={true}
        onClose={() => setShowConfirmNewCode(false)}
        onConfirm={handleGenerateNewCode}
        confirming={generatingCode}
        title="Generate New Sign-in Code"
        confirmationText="Are you sure you want to generate a new sign-in code for this student? Their current code will be deactivated and they will need to use the new code to sign in."
        askForTextInput={false}
      />
    </div>
  );
}
