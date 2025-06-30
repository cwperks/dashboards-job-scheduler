/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import React, { useState, useEffect } from 'react';
import { i18n } from '@osd/i18n';
import { FormattedMessage, I18nProvider } from '@osd/i18n/react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import {
  EuiButton,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiPageSideBar,
  EuiSideNav,
  EuiTitle,
  EuiText,
  EuiBasicTable,
  EuiSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldSearch,
} from '@elastic/eui';

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { PLUGIN_ID } from '../../common';

interface DashboardsJobSchedulerAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
}

const NAV_ITEMS = [
  { id: 'all-jobs', name: 'All Jobs', href: '/all-jobs' },
  { id: 'active-jobs', name: 'Active Jobs', href: '/active-jobs' },
  { id: 'jobs-by-node', name: 'Jobs by Node', href: '/jobs-by-node' },
];

const JobsTable = ({ jobs, pageIndex, pageSize, onPageChange, jobTypeFilter, onJobTypeFilterChange, searchQuery, onSearchChange }: any) => {
  let filteredJobs = jobTypeFilter === 'all' ? jobs : jobs?.filter((job: any) => job.job_type === jobTypeFilter) || [];
  if (searchQuery) {
    filteredJobs = filteredJobs?.filter((job: any) => job.name?.toLowerCase().includes(searchQuery.toLowerCase())) || [];
  }
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = filteredJobs?.slice(startIndex, endIndex) || [];
  
  const jobTypes = ['all', ...Array.from(new Set(jobs?.map((job: any) => job.job_type) || []))];
  const jobTypeOptions = jobTypes.map(type => ({ value: String(type), text: type === 'all' ? 'All Types' : String(type) }));
  
  return (
    <>
      <EuiFlexGroup gutterSize="m">
        <EuiFlexItem grow={false}>
          <EuiSelect
            options={jobTypeOptions}
            value={jobTypeFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onJobTypeFilterChange(e.target.value)}
            prepend="Job Type:"
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFieldSearch
            placeholder="Search by job name..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiBasicTable
        items={pageItems}
      columns={[
      { 
        field: 'job_id', 
        name: 'Job ID',
        render: (jobId: string) => {
          const basePath = window.location.pathname.split('/app/')[0];
          return (
            <a href={`${window.location.origin}${basePath}/app/reports-dashboards#/report_definition_details/${jobId}`} target="_blank" rel="noopener noreferrer">
              {jobId}
            </a>
          );
        }
      },
      { field: 'name', name: 'Name' },
      { field: 'job_type', name: 'Type' },
      { field: 'index_name', name: 'Index' },
      { field: 'descheduled', name: 'Descheduled' },
      { field: 'enabled', name: 'Enabled' },
      { field: 'enabled_time', name: 'Enabled Time' },
      { field: 'last_update_time', name: 'Last Update' },
      { field: 'last_execution_time', name: 'Last Execution' },
      { field: 'last_expected_execution_time', name: 'Last Expected' },
      { field: 'next_expected_execution_time', name: 'Next Execution' },
      { 
        field: 'schedule', 
        name: 'Schedule',
        render: (schedule: any) => {
          if (schedule?.type === 'cron') {
            return `Cron: ${schedule.expression} (${schedule.timezone})`;
          } else if (schedule?.type === 'interval') {
            return `Interval: ${schedule.interval} ${schedule.unit}`;
          }
          return 'N/A';
        }
      },
      { field: 'delay', name: 'Delay' },
      { field: 'jitter', name: 'Jitter' },
      { field: 'lock_duration', name: 'Lock Duration' },
    ]}
    pagination={{
      pageIndex,
      pageSize,
      totalItemCount: filteredJobs?.length || 0,
      pageSizeOptions: [5, 10, 20, 50]
    }}
    onChange={onPageChange}
    />
    </>
  );
};

const AllJobsPanel = ({ http, notifications }: any) => {
  const [jobs, setJobs] = useState<any>();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    http.get('/api/dashboards_job_scheduler/jobs')
      .then((res: any) => {
        setJobs(res.jobs);
        notifications.toasts.addSuccess('All jobs loaded');
      })
      .catch((error: any) => {
        notifications.toasts.addError(error, { title: 'Failed to fetch jobs' });
      });
  }, []);

  return (
    <>
      <EuiPageHeader>
        <EuiTitle size="l"><h1>All Jobs</h1></EuiTitle>
      </EuiPageHeader>
      <EuiPageContent>
        <EuiPageContentBody>
          <p>Total Jobs: {jobs?.length || 0}</p>
          <JobsTable 
            jobs={jobs} 
            pageIndex={pageIndex} 
            pageSize={pageSize}
            jobTypeFilter={jobTypeFilter}
            searchQuery={searchQuery}
            onJobTypeFilterChange={(filter: string) => {
              setJobTypeFilter(filter);
              setPageIndex(0);
            }}
            onSearchChange={(query: string) => {
              setSearchQuery(query);
              setPageIndex(0);
            }}
            onPageChange={({ page }: { page?: { index: number; size: number } }) => {
              if (page) {
                setPageIndex(page.index);
                setPageSize(page.size);
              }
            }}
          />
        </EuiPageContentBody>
      </EuiPageContent>
    </>
  );
};

const ActiveJobsPanel = ({ http, notifications }: any) => {
  const [jobs, setJobs] = useState<any>();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    http.get('/api/dashboards_job_scheduler/jobs')
      .then((res: any) => {
        const activeJobs = res.jobs?.filter((job: any) => job.lock_duration != 'no_lock') || [];
        setJobs(activeJobs);
        notifications.toasts.addSuccess('Active jobs loaded');
      })
      .catch((error: any) => {
        notifications.toasts.addError(error, { title: 'Failed to fetch active jobs' });
      });
  }, []);

  return (
    <>
      <EuiPageHeader>
        <EuiTitle size="l"><h1>Active Jobs</h1></EuiTitle>
      </EuiPageHeader>
      <EuiPageContent>
        <EuiPageContentBody>
          <p>Active Jobs: {jobs?.length || 0}</p>
          <JobsTable 
            jobs={jobs} 
            pageIndex={pageIndex} 
            pageSize={pageSize}
            jobTypeFilter={jobTypeFilter}
            searchQuery={searchQuery}
            onJobTypeFilterChange={(filter: string) => {
              setJobTypeFilter(filter);
              setPageIndex(0);
            }}
            onSearchChange={(query: string) => {
              setSearchQuery(query);
              setPageIndex(0);
            }}
            onPageChange={({ page }: { page?: { index: number; size: number } }) => {
              if (page) {
                setPageIndex(page.index);
                setPageSize(page.size);
              }
            }}
          />
        </EuiPageContentBody>
      </EuiPageContent>
    </>
  );
};

const JobsByNodePanel = ({ http, notifications }: any) => {
  const [jobsByNode, setJobsByNode] = useState<any>();
  const [nodePageStates, setNodePageStates] = useState<{[key: string]: {pageIndex: number, pageSize: number, jobTypeFilter?: string, searchQuery?: string}}>({});

  useEffect(() => {
    http.get('/api/dashboards_job_scheduler/jobs/by_node')
      .then((res: any) => {
        setJobsByNode(res);
        notifications.toasts.addSuccess('Jobs by node loaded');
      })
      .catch((error: any) => {
        notifications.toasts.addError(error, { title: 'Failed to fetch jobs by node' });
      });
  }, []);

  return (
    <>
      <EuiPageHeader>
        <EuiTitle size="l"><h1>Jobs by Node</h1></EuiTitle>
      </EuiPageHeader>
      <EuiPageContent>
        <EuiPageContentBody>
          {jobsByNode?.failures && jobsByNode.failures.length > 0 && (
            <p>Failures: {jobsByNode.failures.join(', ')}</p>
          )}
          {jobsByNode?.nodes?.map((node: any) => (
            <div key={node.node_id}>
              <p>Node: {node.node_name || node.node_id} (ID: {node.node_id}) | Total Jobs: {node.scheduled_job_info.total_jobs}</p>
              <EuiFlexGroup gutterSize="m">
                <EuiFlexItem grow={false}>
                  <EuiSelect
                    options={[
                      { value: 'all', text: 'All Types' },
                      ...Array.from(new Set(node.scheduled_job_info.jobs?.map((job: any) => job.job_type) || [])).map((type: any) => ({ value: String(type), text: String(type) }))
                    ]}
                    value={nodePageStates[node.node_id]?.jobTypeFilter || 'all'}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setNodePageStates(prev => ({
                        ...prev,
                        [node.node_id]: {
                          ...prev[node.node_id],
                          jobTypeFilter: e.target.value,
                          pageIndex: 0
                        }
                      }));
                    }}
                    prepend="Job Type:"
                  />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFieldSearch
                    placeholder="Search by job name..."
                    value={nodePageStates[node.node_id]?.searchQuery || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setNodePageStates(prev => ({
                        ...prev,
                        [node.node_id]: {
                          ...prev[node.node_id],
                          searchQuery: e.target.value,
                          pageIndex: 0
                        }
                      }));
                    }}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiBasicTable
                items={(() => {
                  const nodeJobs = node.scheduled_job_info.jobs || [];
                  const jobTypeFilter = nodePageStates[node.node_id]?.jobTypeFilter || 'all';
                  const searchQuery = nodePageStates[node.node_id]?.searchQuery || '';
                  let filteredJobs = jobTypeFilter === 'all' ? nodeJobs : nodeJobs.filter((job: any) => job.job_type === jobTypeFilter);
                  if (searchQuery) {
                    filteredJobs = filteredJobs.filter((job: any) => job.name?.toLowerCase().includes(searchQuery.toLowerCase()));
                  }
                  const nodePageIndex = nodePageStates[node.node_id]?.pageIndex || 0;
                  const nodePageSize = nodePageStates[node.node_id]?.pageSize || 10;
                  const startIndex = nodePageIndex * nodePageSize;
                  const endIndex = startIndex + nodePageSize;
                  return filteredJobs.slice(startIndex, endIndex);
                })()}
                columns={[
                  { 
                    field: 'job_id', 
                    name: 'Job ID',
                    render: (jobId: string) => {
                      const basePath = window.location.pathname.split('/app/')[0];
                      return (
                        <a href={`${window.location.origin}${basePath}/app/reports-dashboards#/report_definition_details/${jobId}`} target="_blank" rel="noopener noreferrer">
                          {jobId}
                        </a>
                      );
                    }
                  },
                  { field: 'name', name: 'Name' },
                  { field: 'job_type', name: 'Type' },
                  { field: 'index_name', name: 'Index' },
                  { field: 'descheduled', name: 'Descheduled' },
                  { field: 'enabled', name: 'Enabled' },
                  { field: 'enabled_time', name: 'Enabled Time' },
                  { field: 'last_update_time', name: 'Last Update' },
                  { field: 'last_execution_time', name: 'Last Execution' },
                  { field: 'last_expected_execution_time', name: 'Last Expected' },
                  { field: 'next_expected_execution_time', name: 'Next Execution' },
                  { 
                    field: 'schedule', 
                    name: 'Schedule',
                    render: (schedule: any) => {
                      if (schedule?.type === 'cron') {
                        return `Cron: ${schedule.expression} (${schedule.timezone})`;
                      } else if (schedule?.type === 'interval') {
                        return `Interval: ${schedule.interval} ${schedule.unit}`;
                      }
                      return 'N/A';
                    }
                  },
                  { field: 'delay', name: 'Delay' },
                  { field: 'jitter', name: 'Jitter' },
                  { field: 'lock_duration', name: 'Lock Duration' },
                ]}
                pagination={{
                  pageIndex: nodePageStates[node.node_id]?.pageIndex || 0,
                  pageSize: nodePageStates[node.node_id]?.pageSize || 10,
                  totalItemCount: (() => {
                    const nodeJobs = node.scheduled_job_info.jobs || [];
                    const jobTypeFilter = nodePageStates[node.node_id]?.jobTypeFilter || 'all';
                    const searchQuery = nodePageStates[node.node_id]?.searchQuery || '';
                    let filteredJobs = jobTypeFilter === 'all' ? nodeJobs : nodeJobs.filter((job: any) => job.job_type === jobTypeFilter);
                    if (searchQuery) {
                      filteredJobs = filteredJobs.filter((job: any) => job.name?.toLowerCase().includes(searchQuery.toLowerCase()));
                    }
                    return filteredJobs.length;
                  })(),
                  pageSizeOptions: [5, 10, 20, 50]
                }}
                onChange={({ page }: { page?: { index: number; size: number } }) => {
                  if (page) {
                    setNodePageStates(prev => ({
                      ...prev,
                      [node.node_id]: {
                        ...prev[node.node_id],
                        pageIndex: page.index,
                        pageSize: page.size
                      }
                    }));
                  }
                }}
              />
            </div>
          ))}
        </EuiPageContentBody>
      </EuiPageContent>
    </>
  );
};

export const DashboardsJobSchedulerApp = ({
  basename,
  notifications,
  http,
  navigation,
}: DashboardsJobSchedulerAppDeps) => {
  const [currentPath, setCurrentPath] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const buildNavItems = () => [
    {
      name: 'Job Scheduler',
      id: 'job-scheduler',
      items: NAV_ITEMS.map((item) => ({
        id: item.id,
        name: item.name,
        href: '#' + item.href,
        isSelected: currentPath === '#' + item.href,
      })),
    },
  ];

  return (
    <Router basename={basename}>
      <I18nProvider>
        <>
          <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={false}
            useDefaultBehaviors={true}
          />
          <EuiPage restrictWidth="1700px">
            {NAV_ITEMS.map((item) => (
              <Route key={item.href} path={item.href} exact>
                <EuiPageSideBar>
                  <EuiSideNav items={buildNavItems()} />
                </EuiPageSideBar>
              </Route>
            ))}
            <EuiPageBody component="main">
              <Switch>
                <Route path="/all-jobs" render={() => <AllJobsPanel http={http} notifications={notifications} />} />
                <Route path="/active-jobs" render={() => <ActiveJobsPanel http={http} notifications={notifications} />} />
                <Route path="/jobs-by-node" render={() => <JobsByNodePanel http={http} notifications={notifications} />} />
                <Redirect exact from="/" to="/all-jobs" />
              </Switch>
            </EuiPageBody>
          </EuiPage>
        </>
      </I18nProvider>
    </Router>
  );
};
