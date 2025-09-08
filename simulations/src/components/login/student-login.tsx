/**
 * @deprecated This component is deprecated. Use UserLogin component with role="student" instead.
 * See /src/components/login/user-login.tsx
 */

'use client';

import { UserLogin } from './user-login';

export function StudentLogin(props: any) {
  console.warn('StudentLogin is deprecated. Use UserLogin with role="student" instead.');
  return <UserLogin role="student" {...props} />;
}
