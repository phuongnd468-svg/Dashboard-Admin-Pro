import Link from 'next/link';
import { Result } from 'antd';
import { defaultLocale, getDictionary } from '@/lib/i18n';

export default function NotFound() {
  const dictionary = getDictionary(defaultLocale);

  return (
    <Result
      status="404"
      title={dictionary.notFound.title}
      subTitle={dictionary.notFound.subtitle}
      extra={
        <Link href={`/${defaultLocale}/welcome`}>{dictionary.notFound.action}</Link>
      }
    />
  );
}
