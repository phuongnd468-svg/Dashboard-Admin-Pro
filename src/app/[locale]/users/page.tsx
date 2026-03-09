import { UserManagementScreen } from '@/components/screens/user-management-screen';
import { getDictionary, type Locale } from '@/lib/i18n';

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <UserManagementScreen dictionary={getDictionary(locale)} />;
}
