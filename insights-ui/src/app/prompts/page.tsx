// app/prompts/page.tsx
'use client';

import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Prompt } from '@prisma/client'; // or wherever your TS types are generated
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PromptsListPage(): JSX.Element {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const router = useRouter();

  useEffect(() => {
    // For example, fetch from our new endpoint:
    // This is a client side fetch; you'd specify the spaceId or get it from user context
    // You might also do this from a server component, but here's a simple client version:
    fetch(`/api/koala_gains/prompts`)
      .then((res) => res.json())
      .then((data: Prompt[]) => setPrompts(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <PageWrapper>
      <div className="p-4 text-color">
        <h1 className="text-2xl heading-color mb-4">All Prompts</h1>
        <div className="flex justify-end">
          <button onClick={() => router.push('/prompts/create')} className="border border-color px-4 py-2 block-bg-color hover:bg-primary-text text-color">
            Create Prompt
          </button>
        </div>
        <table className="mt-4 w-full border border-color">
          <thead className="block-bg-color">
            <tr>
              <th className="text-left p-2 border-color border">Name</th>
              <th className="text-left p-2 border-color border">Key</th>
              <th className="text-left p-2 border-color border">Active Version</th>
              <th className="text-left p-2 border-color border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prompts.map((prompt) => (
              <tr key={prompt.id} className="border border-color">
                <td className="p-2 border border-color">{prompt.name}</td>
                <td className="p-2 border border-color">{prompt.key}</td>
                <td className="p-2 border border-color">{prompt.activePromptVersionId || 'Not Set'}</td>
                <td className="p-2 border border-color">
                  <Link href={`/prompts/${prompt.id}`} className="link-color underline mr-4">
                    View
                  </Link>
                  <Link href={`/prompts/edit/${prompt.id}`} className="link-color underline mr-4">
                    Edit
                  </Link>
                  <Link href={`/prompts/${prompt.id}/invocations`} className="link-color underline">
                    Invocations
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
