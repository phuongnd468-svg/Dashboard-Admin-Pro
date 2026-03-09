import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { getDictionary, isSupportedLocale, locales, type Locale } from '@/lib/i18n';

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);

  return {
    title: dictionary.meta.title,
    description: dictionary.meta.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dictionary = getDictionary(typedLocale);

  return (
    <AntdRegistry>
      <AppShell dictionary={dictionary} locale={typedLocale}>
        {children}
      </AppShell>
    </AntdRegistry>
  );
}
