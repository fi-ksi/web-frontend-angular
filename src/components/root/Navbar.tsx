import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import { useYear } from '../../hooks/useYear';
import { useTheme } from '../../hooks/useTheme';
import { useIsMobileSmall } from '../../hooks/useWindowSize';
import { ROUTES } from '../../routes';
import { fullName } from '../../utils/utils';
import { LoginModal } from '../shared/LoginModal';
import { RegisterModal } from '../shared/RegisterModal';
import { ResetPasswordModal } from '../shared/ResetPasswordModal';
import { FeedbackModal } from '../shared/FeedbackModal';
import './Navbar.scss';

type AuthModal = 'login' | 'register' | 'resetPassword' | 'feedback' | null;

/**
 * Top navigation bar: logo, category links, year selector, user menu
 * (or login link) and the auth/feedback modals.
 */
export function Navbar(): React.ReactElement {
  const { t } = useTranslation();
  const { user, isLoggedIn, logout, login } = useAuth();
  const { years, selectedFull, setSelected } = useYear();
  const { theme, toggleTheme } = useTheme();
  const isMobileSmall = useIsMobileSmall();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [registerInitials, setRegisterInitials] = useState({ email: '', password: '' });

  const showFullMenu = !isMobileSmall || menuOpen;
  const useLongTitle = typeof window !== 'undefined' ? window.innerWidth > 1150 : true;
  const isTester = !!user && (user.role === 'admin' || user.role === 'org' || user.role === 'tester');

  const navBtn = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        className={`nav-btn${active ? ' active' : ''}`}
        href={href}
        onClick={() => setMenuOpen(false)}
      >
        {label}
      </Link>
    );
  };

  const openRegister = (email: string, password: string) => {
    setRegisterInitials({ email, password });
    setAuthModal('register');
  };

  const registeredAndLogin = async (email: string, password: string) => {
    setAuthModal(null);
    await login(email, password);
  };

  return (
    <div className="ksi-navbar">
      <nav
        className={`navigation-bar${!showFullMenu ? ' clickable' : ''}`}
        onClick={() => { if (!showFullMenu) setMenuOpen(true); }}
      >
        {showFullMenu ? (
          <>
            <Link className={`logo${pathname === '/' ? ' active' : ''}`} href="/">
              <img src="/assets/img/karlik_color.png" alt={t('root.navbar.logo')} />
              <span>{t(useLongTitle ? 'root.navbar.title.long' : 'root.navbar.title.short')}</span>
            </Link>

            <div className="navigation">
              <div className="categories">
                {navBtn(`/${ROUTES.tasks._}`, t('root.navbar.category.tasks'))}
                {navBtn(`/${ROUTES.results}`, t('root.navbar.category.results'))}
                {navBtn(`/${ROUTES.about}`, t('root.navbar.category.about'))}
                {navBtn(`/${ROUTES.news}`, t('root.navbar.category.news'))}
                {navBtn(`/${ROUTES.discussion}`, t('root.navbar.category.discussion'))}
                {isTester && navBtn(`/${ROUTES.admin._}`, t('root.navbar.category.admin'))}

                <div className={`dropdown${yearMenuOpen ? ' show' : ''}`}>
                  <span
                    id="dropdown-year"
                    className="nav-btn"
                    onClick={() => setYearMenuOpen((o) => !o)}
                  >
                    {selectedFull?.year}
                  </span>
                  <div className={`dropdown-menu${yearMenuOpen ? ' show' : ''}`} aria-labelledby="dropdown-year">
                    {years
                      .filter((year) => year.id !== selectedFull?.id)
                      .map((year) => (
                        <button
                          key={year.id}
                          className="dropdown-item"
                          onClick={() => { setSelected(year.id); setYearMenuOpen(false); }}
                        >
                          {year.year}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {isLoggedIn && user ? (
                <div className={`dropdown login-container${userMenuOpen ? ' show' : ''}`}>
                  <div
                    id="dropdown-login"
                    className="nav-btn"
                    onClick={() => setUserMenuOpen((o) => !o)}
                  >
                    <span className="username">{fullName(user)}</span>
                  </div>
                  <div className={`dropdown-menu${userMenuOpen ? ' show' : ''}`} aria-labelledby="dropdown-login">
                    <Link className="dropdown-item" href={`/${ROUTES.profile._}`} onClick={() => setUserMenuOpen(false)}>
                      {t('root.navbar.my-profile')}
                    </Link>
                    <button className="dropdown-item" onClick={() => { setUserMenuOpen(false); setAuthModal('feedback'); }}>
                      {t('root.navbar.feedback')}
                    </button>
                    <button className="dropdown-item" onClick={() => { setUserMenuOpen(false); toggleTheme(); }}>
                      {t(`root.navbar.theme.${theme}`)}
                    </button>
                    <Link
                      className="dropdown-item"
                      href={`/${ROUTES.profile._}/${ROUTES.profile.settings._}`}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t('root.navbar.settings')}
                    </Link>
                    <button className="dropdown-item" onClick={() => { setUserMenuOpen(false); logout(); }}>
                      {t('root.navbar.logout')}
                    </button>
                  </div>
                </div>
              ) : (
                <a className="nav-btn" onClick={() => setAuthModal('login')}>
                  {t('root.navbar.login')}
                </a>
              )}
            </div>
            {isMobileSmall && (
              <div
                className="menu-opener clickable"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
              >
                &#9776;
              </div>
            )}
          </>
        ) : (
          <div className="menu-opener">&#9776;</div>
        )}
      </nav>
      <div className="navbar-separator" />

      <LoginModal
        open={authModal === 'login'}
        onClose={() => setAuthModal(null)}
        onOpenRegister={openRegister}
        onOpenResetPassword={() => setAuthModal('resetPassword')}
      />
      <RegisterModal
        open={authModal === 'register'}
        onClose={() => setAuthModal(null)}
        initialEmail={registerInitials.email}
        initialPassword={registerInitials.password}
        onRegistered={registeredAndLogin}
      />
      <ResetPasswordModal
        open={authModal === 'resetPassword'}
        onClose={() => setAuthModal(null)}
      />
      <FeedbackModal
        open={authModal === 'feedback'}
        onClose={() => setAuthModal(null)}
      />
    </div>
  );
}
