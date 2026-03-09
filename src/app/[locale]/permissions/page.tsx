import { PermissionManagementScreen } from '@/components/screens/permission-management-screen';
import { getDictionary, type Locale } from '@/lib/i18n';

export default async function PermissionsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return <PermissionManagementScreen dictionary={getDictionary(locale)} />;
}
