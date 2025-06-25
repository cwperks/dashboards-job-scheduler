import './index.scss';

import { DashboardsJobSchedulerPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.
export function plugin() {
  return new DashboardsJobSchedulerPlugin();
}
export { DashboardsJobSchedulerPluginSetup, DashboardsJobSchedulerPluginStart } from './types';
