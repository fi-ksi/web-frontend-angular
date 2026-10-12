import React from 'react';
import { useTranslation } from 'react-i18next';
import { TermsOfUse } from '../shared/TermsOfUse';
import './PagePrivacyPolicy.scss';

/**
 * Privacy policy page rendering the terms-of-use text.
 */
export function PagePrivacyPolicy(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="page-privacy-policy">
      <article>
        <h2>{t('privacy-policy.title')}</h2>
        <TermsOfUse />
      </article>
    </div>
  );
}
