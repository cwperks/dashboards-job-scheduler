import { PluginInitializerContext } from '../../../src/core/server';
import { DashboardsJobSchedulerPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new DashboardsJobSchedulerPlugin(initializerContext);
}

export { DashboardsJobSchedulerPluginSetup, DashboardsJobSchedulerPluginStart } from './types';
