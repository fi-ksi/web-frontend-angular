import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../routes';
import { ChangelogModal } from '../shared/ChangelogModal';
import './Footer.scss';

const PARTNER_LOGOS: { href: string; title: string; img: string }[] = [
  { href: 'mailto:ksi@fi.muni.cz', title: 'ksi@fi.muni.cz', img: 'email.svg' },
  { href: 'https://www.facebook.com/ksi.fi.muni', title: 'Facebook', img: 'facebook.svg' },
  { href: 'https://www.fi.muni.cz/', title: 'Fakulta Informatiky MU', img: 'fi.svg' },
  { href: 'https://www.muni.cz/', title: 'Masarykova Univerzita Brno', img: 'mu.svg' },
  { href: 'https://kscuk.fi.muni.cz/', title: 'K-SCUK', img: 'kscuk.svg' },
  { href: 'https://intersob.math.muni.cz', title: 'Soutěž InterSoB', img: 'intersob.svg' },
  { href: 'https://interlos.fi.muni.cz', title: 'INTERnetová LOgická Soutěž', img: 'los.svg' },
  { href: 'https://zverinec.fi.muni.cz', title: 'Spolek přátel severské zvěře', img: 'zverinec.svg' },
  { href: 'http://brkos.math.muni.cz', title: 'BRněnský KOrespondenční Seminář', img: 'brkos.svg' },
  { href: 'http://ibis.sci.muni.cz/', title: 'Interaktivní BIologický Seminář', img: 'ibis.svg' },
  { href: 'https://ksp.mff.cuni.cz', title: 'Korespondenční seminář z programování', img: 'ksp.svg' },
  { href: 'https://www.youtube.com/channel/UCH0K2_tAhkJNlvfRo5NsEIg', title: 'YouTube', img: 'youtube.svg' },
  { href: 'https://github.com/fi-ksi', title: 'KSI @ GitHub', img: 'github.svg' }
];

/**
 * Page footer with partner logos, bug-report link, app version (opens the
 * changelog) and the privacy-policy link.
 */
export function Footer(): React.ReactElement {
  const { t } = useTranslation();
  const [changelogOpen, setChangelogOpen] = useState(false);

  const versionQuery = useQuery({
    queryKey: ['version'],
    queryFn: async (): Promise<string | null> => {
      try {
        const resp = await fetch('/assets/changelog/version.txt');
        if (!resp.ok) return null;
        return (await resp.text()).trim();
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60_000
  });

  return (
    <div className="ksi-footer">
      <div className="footer-above">
        <div className="links-container">
          <div className="flex-row row row-centered links-wrapper" style={{ maxWidth: '99vw' }}>
            {PARTNER_LOGOS.map((logo) => (
              <a key={logo.img} href={logo.href} title={logo.title} className="footer-logo inline-footer">
                <img src={`/assets/img/logos/${logo.img}`} alt={logo.title} />
              </a>
            ))}
          </div>
        </div>
        <a href="https://forms.gle/eyQemxCUKE3x6jFA7" target="_blank" rel="noreferrer">
          {t('root.footer.bug-report')}
        </a>
        {' - '}
        <span className="version" onClick={() => setChangelogOpen(true)}>
          {t('root.footer.version')} {versionQuery.data}
        </span>
        {' - '}
        <span>{t('root.footer.license')}</span>
        {' - '}
        <Link href={`/${ROUTES.privacyPolicy}`}>{t('root.footer.privacy-policy')}</Link>
      </div>

      <ChangelogModal
        open={changelogOpen}
        onClose={() => setChangelogOpen(false)}
        autoNotify
      />
    </div>
  );
}
