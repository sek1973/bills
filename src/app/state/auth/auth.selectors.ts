import { AppState } from '../app/app.state';

export const AuthSelectors = {
  selectAuth: (state: AppState) => state.loggedIn
};
