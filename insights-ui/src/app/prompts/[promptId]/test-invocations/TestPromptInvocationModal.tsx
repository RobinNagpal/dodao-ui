'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React, { useEffect, useState } from 'react';
import { PromptInvocationStatus, TestPromptInvocation } from '@prisma/client';
import { Editor } from '@monaco-editor/react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Handlebars from 'handlebars';

interface TestPromptInvocationModalProps {
  open: boolean;
  onClose: () => void;
  invocation: TestPromptInvocation;
}

export default function TestPromptInvocationModal({ open, onClose, invocation }: TestPromptInvocationModalProps) {
  const [previewHtml, setPreviewHtml] = useState<string>('');

  useEffect(() => {
    try {
      const template = Handlebars.compile(invocation.promptTemplate);
      const rendered = template(JSON.parse(invocation.inputJson as any) || '');
      setPreviewHtml(rendered);
    } catch (error: any) {
      setPreviewHtml('');
    }
  }, [invocation.promptTemplate]);

  return (
    <FullPageModal open={open} onClose={onClose} title={'Invocation'}>
      <PageWrapper className="text-left">
        <p className="mb-4">Status: {invocation.status}</p>
        <p className="mb-4">Updated At: {new Date(invocation.updatedAt).toLocaleString()}</p>
        <p className="mb-4">Updated By: {invocation.updatedBy}</p>

        <div className="mb-4">
          <h2 className="heading-color">Prompt Template</h2>
          <div className="flex-1 border-l border-gray-200">
            <Editor
              height="300px"
              defaultLanguage="markdown"
              value={invocation.promptTemplate}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'off',
                folding: false,
                fontSize: 14,
                fontFamily: 'monospace',
              }}
            />
          </div>
        </div>

        <div className="mb-4">
          <h2 className="heading-color">Prompt</h2>
          <div className="flex-1 border-l border-gray-200">
            <Editor
              height="300px"
              defaultLanguage="markdown"
              value={previewHtml}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'off',
                folding: false,
                fontSize: 14,
                fontFamily: 'monospace',
              }}
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between w-full mb-2 gap-2 items-center">
            <div>Input Json</div>
          </div>
          <div className="block-bg-color w-full py-4 px-2">
            {invocation.inputJson ? (
              <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
                {JSON.stringify(JSON.parse(invocation.inputJson as any), null, 2)}
              </pre>
            ) : (
              <pre className="text-xs">No Input JSON Added</pre>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between w-full mb-2 gap-2 items-center">
            <div>Body to append</div>
          </div>
          <div className="block-bg-color w-full py-4 px-2">
            {invocation.bodyToAppend ? (
              <pre
                className="whitespace-pre-wrap break-words overflow-x-auto max-h-[200px] overflow-y-auto text-xs"
                dangerouslySetInnerHTML={{ __html: invocation.bodyToAppend }}
              />
            ) : (
              <pre className="text-xs">No body to append</pre>
            )}
          </div>
        </div>

        {invocation.error && (
          <div className="mb-4">
            <div className="flex justify-between w-full mb-2 gap-2 items-center">
              <div>Invocation Error:</div>
            </div>
            <div className="block-bg-color w-full py-4 px-2">
              <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs text-red-500">{invocation.error}</pre>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between w-full mb-2 gap-2 items-center">
            <div>Output JSON:</div>
          </div>
          <div className="block-bg-color w-full py-4 px-2">
            {invocation.outputJson ? (
              <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
                {JSON.stringify(JSON.parse(invocation.outputJson as any), null, 2)}
              </pre>
            ) : (
              <pre className="text-xs">No Output JSON</pre>
            )}
          </div>
        </div>
      </PageWrapper>
    </FullPageModal>
  );
}
