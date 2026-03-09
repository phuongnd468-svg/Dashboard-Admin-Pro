import { WelcomeScreen } from '@/components/screens/welcome-screen';
import { getDictionary, type Locale } from '@/lib/i18n';

export default async function WelcomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <WelcomeScreen dictionary={getDictionary(locale)} />;
}
