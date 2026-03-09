import { FormScreen } from '@/components/screens/form-screen';
import { getDictionary, type Locale } from '@/lib/i18n';

export default async function FormPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <FormScreen dictionary={getDictionary(locale)} />;
}
