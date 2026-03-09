import { OrderScreen } from '@/components/screens/order-screen';
import { getDictionary, type Locale } from '@/lib/i18n';

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <OrderScreen dictionary={getDictionary(locale)} />;
}
