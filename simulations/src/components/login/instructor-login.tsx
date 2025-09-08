/**
 * @deprecated This component is deprecated. Use UserLogin component with role="instructor" instead.
 * See /src/components/login/user-login.tsx
 */

'use client';

import { UserLogin } from './user-login';

export function InstructorLogin(props: any) {
  console.warn('InstructorLogin is deprecated. Use UserLogin with role="instructor" instead.');
  return <UserLogin role="instructor" {...props} />;
}
