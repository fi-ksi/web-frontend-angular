import { IRoutes } from "../app/models/routes";

export const ROUTES: IRoutes = {
  news: 'news',
  about: 'about',
  results: 'results',
  tasks: 'tasks',
  discussion: 'discussion',
  profile: {
    _: 'profile',
    settings: {
      _: 'settings',
      password: 'password'
    }
  },
  achievements: 'achievements'
}
