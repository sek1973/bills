import { AppState } from '../app/app.state';

export const SchedulesSelectors = {

  selectSchedule: (state: AppState) => {
    return state.schedules.find(s => s.id = state.currentSchedule);
  },

  selectAll: (state: AppState) => state.schedules,

};
