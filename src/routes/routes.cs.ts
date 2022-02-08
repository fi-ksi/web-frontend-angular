import { IRoutes } from "../app/models/routes";

// noinspection JSUnusedGlobalSymbols
export const ROUTES: IRoutes = {
  news: 'novinky',
  about: 'o-ksi',
  results: 'vysledky',
  tasks: {
    _: 'ulohy',
    solution: 'reseni',
    discussion: 'diskuze',
  },
  discussion: 'forum',
  profile: {
    _: 'profil',
    settings: {
      _: 'nastaveni',
      password: 'heslo'
    }
  },
  achievements: 'trofeje'
}
