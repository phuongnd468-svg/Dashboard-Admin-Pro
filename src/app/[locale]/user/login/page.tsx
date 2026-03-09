import { LoginScreen } from '@/components/screens/login-screen';
import { getDictionary, type Locale } from '@/lib/i18n';

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { locale } = await params;
  const { redirect } = await searchParams;

  return (
    <LoginScreen
      dictionary={getDictionary(locale)}
      locale={locale}
      redirectTarget={redirect}
    />
  );
}
