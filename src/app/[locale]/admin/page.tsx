import { AdminScreen } from '@/components/screens/admin-screen';
import { getDictionary, type Locale } from '@/lib/i18n';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <AdminScreen dictionary={getDictionary(locale)} />;
}
