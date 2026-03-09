import { RulesListScreen } from '@/components/screens/rules-list-screen';
import { getDictionary, type Locale } from '@/lib/i18n';

export default async function ListPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <RulesListScreen dictionary={getDictionary(locale)} />;
}
