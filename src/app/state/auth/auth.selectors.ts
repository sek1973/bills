import { AppState } from '../app/app.state';

export const selectAuth = (state: AppState) => state.loggedIn;
