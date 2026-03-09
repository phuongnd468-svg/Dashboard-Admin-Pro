import { redirect } from 'next/navigation';
import { defaultLocale, isSupportedLocale } from '@/lib/i18n';

export default async function LocaleIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = isSupportedLocale(locale) ? locale : defaultLocale;

  redirect(`/${safeLocale}/welcome`);
}
