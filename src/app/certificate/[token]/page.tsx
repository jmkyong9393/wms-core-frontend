import { notFound } from 'next/navigation';
import { getCertificate } from '@/features/certificate/api/certificateService';
import CertificateView from '@/features/certificate/components/CertificateView';

interface CertificatePageProps {
  params: Promise<{ token: string }>;
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { token } = await params;
  const certificate = await getCertificate(token);

  if (!certificate) {
    notFound();
  }

  return <CertificateView certificate={certificate} />;
}
