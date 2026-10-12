import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Port of KsiTitleService: sets document.title to "KSI - <subtitle>".
 */
export function usePageTitle(subtitle: string): void {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = `${t('root.navbar.title.short')} - ${subtitle}`;
  }, [t, subtitle]);
}
