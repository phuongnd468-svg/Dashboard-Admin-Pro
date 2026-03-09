import { MonitorScreen } from '@/components/screens/monitor-screen';
import { getDictionary, type Locale } from '@/lib/i18n';

export default async function MonitorPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <MonitorScreen dictionary={getDictionary(locale)} />;
}
