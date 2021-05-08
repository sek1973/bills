import { AppState } from '../app/app.state';

export const AppSelectors = {
  selectError: (state: AppState) => state.data.error,

  selectLoading: (state: AppState) => state.data.loading,
};
