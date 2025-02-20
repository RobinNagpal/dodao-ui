'use client';

import { MDXRemote } from 'next-mdx-remote';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

const components = {
  h1: (props: any) => <h1 className="text-4xl font-bold mt-6 mb-4" {...props} />,
  h2: (props: any) => <h2 className="text-3xl font-semibold mt-6 mb-4" {...props} />,
  h3: (props: any) => <h3 className="text-2xl font-medium mt-6 mb-4" {...props} />,
  p: (props: any) => <p className="text-lg leading-relaxed mt-2 mb-4" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-5 mt-2 mb-4" {...props} />,
};

export default function MDXRenderer({ source }: { source: MDXRemoteSerializeResult }) {
  return <MDXRemote {...source} components={components} />;
}
