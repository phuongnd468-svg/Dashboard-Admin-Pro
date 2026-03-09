import { CategoryScreen } from '@/components/screens/category-screen';
import { getDictionary, type Locale } from '@/lib/i18n';

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <CategoryScreen dictionary={getDictionary(locale)} />;
}
