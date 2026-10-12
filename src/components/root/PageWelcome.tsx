import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../routes';
import { useArticles, useOrganisators } from '../../hooks/useNews';
import { ArticlePreview } from '../shared/ArticlePreview';
import { Spinner } from '../shared/Spinner';
import { fullName } from '../../utils/utils';
import './PageWelcome.scss';

const ABOUT_SLIDES = [
  { img: 'seminar.svg', key: 'seminar', cta: 'tasks' },
  { img: 'kscuk.svg', key: 'kscuk', cta: 'kscuk' },
  { img: 'achievements.svg', key: 'achievements', cta: 'achievements' }
] as const;

/**
 * Landing page: banner with about slides, links into the tasks and news
 * article previews plus the organisers of the selected year.
 */
export function PageWelcome(): React.ReactElement {
  const { t } = useTranslation();
  const [aboutInfoSlide, setAboutInfoSlide] = useState(0);
  const [aboutInfoShown, setAboutInfoShown] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const { articles, isLoading: articlesLoading } = useArticles();
  const { organisators, isLoading: organisatorsLoading } = useOrganisators();

  const toggleAboutInfo = (slide: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (aboutInfoShown && aboutInfoSlide === slide) {
      setAboutInfoShown(false);
      return;
    }
    setAboutInfoShown(true);
    setAboutInfoSlide(slide);
    window.setTimeout(() => {
      const el = carouselRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        }
      }
    });
  };

  const slide = ABOUT_SLIDES[aboutInfoSlide];

  return (
    <div className="page-welcome">
      <div className="about">
        <h1 className="name">
          <span>{t('root.navbar.title.long')}</span>
        </h1>
        <div className="images">
          {ABOUT_SLIDES.map((s, i) => (
            <a key={s.key} href="#" onClick={toggleAboutInfo(i)}>
              <img
                src={`/assets/img/about/${s.img}`}
                alt={t(`root.welcome.about.${s.key}.title`)}
                className={aboutInfoShown && aboutInfoSlide === i ? 'active' : ''}
              />
            </a>
          ))}
        </div>
      </div>

      <div className="begin">
        <Link href={`/${ROUTES.tasks._}`} className="tasks">
          <button className="btn-lg btn btn-ksi">{t('root.welcome.about.begin')}</button>
        </Link>
        <Link className="more-info" href={`/${ROUTES.about}`}>- {t('root.welcome.about.more-info')} -</Link>
        <div className="subjects">
          {ABOUT_SLIDES.map((s, i) => (
            <React.Fragment key={s.key}>
              {i > 0 && <span>-</span>}
              <a
                href="#"
                onClick={toggleAboutInfo(i)}
                className={aboutInfoShown && aboutInfoSlide === i ? 'active' : ''}
              >
                {t(`root.welcome.about.${s.key}.title`)}
              </a>
            </React.Fragment>
          ))}
        </div>
      </div>

      {aboutInfoShown && (
        <div className="about-carousel" ref={carouselRef}>
          <div className="content">
            <span className="text">{t(`root.welcome.about.${slide.key}.text`)}</span>
            {slide.cta === 'tasks' && (
              <Link href={`/${ROUTES.tasks._}`} className="btn-lg btn btn-go">
                {t('root.welcome.about.lets-start')}
              </Link>
            )}
            {slide.cta === 'kscuk' && (
              <button className="btn-lg btn btn-go" onClick={() => { window.location.href = 'https://kscuk.fi.muni.cz/'; }}>
                {t('root.welcome.about.lets-start')}
              </button>
            )}
            {slide.cta === 'achievements' && (
              <Link href={`/${ROUTES.achievements}`} className="btn-lg btn btn-go">
                {t('root.welcome.about.lets-start')}
              </Link>
            )}
          </div>
        </div>
      )}
      <div className="about-carousel-border" />

      <div className="articles-organisators-container">
        <div className="articles-container">
          <span className="header">{t('root.welcome.news.title')}</span>
          <Spinner show={articlesLoading} />
          <div className="articles">
            {articles.map((article) => (
              <ArticlePreview key={article.id} article={article} clickable />
            ))}
          </div>
        </div>
        <div className="organisators-container">
          <span className="header">{t('root.welcome.organisators.title')}</span>
          <Spinner show={organisatorsLoading} />
          <div className="organisators">
            {organisators.map((organiser) => (
              <Link
                key={organiser.id}
                className="frame-organisator"
                href={`/${ROUTES.profile._}/${organiser.id}`}
              >
                <img src={organiser.profile_picture} alt="" className="pic" />
                <span className="name">{fullName(organiser).toUpperCase()}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
