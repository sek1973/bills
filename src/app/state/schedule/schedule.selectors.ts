import { AppState } from '../app/app.state';

export const selectSchedule = (state: AppState) => {
  return state.schedules.find(s => s.id = state.currentSchedule);
};

export const selectAll = (state: AppState) => state.schedules;
