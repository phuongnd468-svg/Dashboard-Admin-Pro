import { ProductScreen } from '@/components/screens/product-screen';
import { getDictionary, type Locale } from '@/lib/i18n';

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <ProductScreen dictionary={getDictionary(locale)} />;
}
