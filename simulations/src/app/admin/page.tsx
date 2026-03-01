import { redirect } from 'next/navigation';

// This page redirects to the case-studies tab by default
// to maintain backward compatibility while providing separate URLs for each tab
export default function AdminPage() {
  redirect('/admin/case-studies');
}