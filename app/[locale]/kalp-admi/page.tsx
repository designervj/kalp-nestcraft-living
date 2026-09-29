import { Metadata } from 'next';
import TenantAdminLoginSection from '@/components/auth/TenantAdminLoginSection';

export const metadata: Metadata = {
  title: 'Admin Login | NestCraft Living',
  robots: { index: false, follow: false },
};

export default function KalpAdmiPage() {
  return <TenantAdminLoginSection />;
}
