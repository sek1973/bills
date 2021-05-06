import { AppState } from '../app/app.state';

export const SchedulesSelectors = {

  selectSchedule: (state: AppState) => {
    return state.data.schedules.find(s => s.id = state.data.currentSchedule);
  },

  selectAll: (state: AppState) => state.data.schedules,

};
