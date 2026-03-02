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
