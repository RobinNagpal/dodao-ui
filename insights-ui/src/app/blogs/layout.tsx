import { BlogsLoginModal } from '@/components/login/blogs-login-modal';

export default function BlogsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <BlogsLoginModal />
    </>
  );
}
