import { IRoutes } from '../app/models/routes';

// noinspection JSUnusedGlobalSymbols
export const ROUTES: IRoutes = {
  news: 'novinky',
  about: 'o-ksi',
  results: 'vysledky',
  tasks: {
    _: 'ulohy',
    solution: 'reseni',
    discussion: 'diskuze',
    results: 'vysledky',
    assessment: 'hodnoceni'
  },
  discussion: 'forum',
  profile: {
    _: 'profil',
    settings: {
      _: 'nastaveni',
      password: 'heslo'
    }
  },
  achievements: 'trofeje',
  admin: {
    _: 'admin',
    tasks: 'ulohy',
    monitor: 'monitor',
    email: 'email',
    discussion: 'forum',
    achievements: 'trofeje',
    instanceConfig: 'nastaveni-serveru'
  },
  privacyPolicy: 'zpracovani-osobnich-udaju'
};
