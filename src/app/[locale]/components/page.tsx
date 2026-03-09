import { ComponentScreen } from '@/components/screens/component-screen';
import { getDictionary, type Locale } from '@/lib/i18n';

export default async function ComponentsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <ComponentScreen dictionary={getDictionary(locale)} />;
}
