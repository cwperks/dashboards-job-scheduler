import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface DashboardsJobSchedulerPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DashboardsJobSchedulerPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
