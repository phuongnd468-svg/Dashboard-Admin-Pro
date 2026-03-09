import { WorkplaceScreen } from '@/components/screens/workplace-screen';
import { getDictionary, type Locale } from '@/lib/i18n';

export default async function WorkplacePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <WorkplaceScreen dictionary={getDictionary(locale)} />;
}
