import { AppState } from '../app/app.state';

export const SchedulesSelectors = {

  selectAll: (state: AppState) => state.data.schedules,

};
