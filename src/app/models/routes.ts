export interface IRoutes {
  news: string;
  about: string;
  results: string;
  tasks: {
    _: string,
    solution: string;
    discussion: string;
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
}
