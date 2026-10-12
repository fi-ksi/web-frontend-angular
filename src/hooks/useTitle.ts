import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Port of KsiTitleService: sets document.title to
 * "<short title> - <subtitle or long title>".
 * Call from a page component with its subtitle (pass null for the default).
 */
export function useTitle(subtitle: string | null = null): void {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t('root.navbar.title.short')} - ${subtitle ?? t('root.navbar.title.long')}`;
  }, [t, subtitle]);
}
