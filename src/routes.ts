export interface IRoutes {
  news: string;
  about: string;
  results: string;
  tasks: {
    _: string,
    solution: string;
    discussion: string;
    results: string;
    assessment: string;
  }
  discussion: string;
  profile: {
    _: string;
    settings: {
      _: string;
      password: string;
    }
  }
  achievements: string;
  admin: {
    _: string;
    tasks: string;
    monitor: string;
    email: string;
    discussion: string;
    achievements: {
      _: string;
      edit: string;
      grant: string;
    },
    instanceConfig: string;
    waves: {
      _: string;
      edit: string;
    },
    years: {
      _: string;
      edit: string;
    },
    articles: {
      _: string;
      edit: string;
    },
    exec: string;
    grading: string;
    users: string;
  };
  privacyPolicy: string;
}

// Production (Czech) routes, mirroring src/routes/routes.cs.ts from the Angular app
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
    achievements: {
      _: 'trofeje',
      edit: 'upravit',
      grant: 'pridelit'
    },
    instanceConfig: 'nastaveni-serveru',
    waves: {
      _: 'waves',
      edit: 'upravit'
    },
    years: {
      _: 'years',
      edit: 'edit'
    },
    articles: {
      _: 'articles',
      edit: 'upravit'
    },
    exec: 'exec',
    grading: 'opravovani',
    users: 'users'
  },
  privacyPolicy: 'zpracovani-osobnich-udaju'
};
