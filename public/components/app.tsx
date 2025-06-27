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

import React, { useState } from 'react';
import { i18n } from '@osd/i18n';
import { FormattedMessage, I18nProvider } from '@osd/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  EuiButton,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiTitle,
  EuiText,
  EuiBasicTable,
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

export const DashboardsJobSchedulerApp = ({
  basename,
  notifications,
  http,
  navigation,
}: DashboardsJobSchedulerAppDeps) => {
  // Use React hooks to manage state.
  const [timestamp, setTimestamp] = useState<string | undefined>();

  const [jobs, setJobs] = useState<any>();
  const [jobsByNode, setJobsByNode] = useState<any>();

  const convertResponseToText = (response: any): string => {
    return JSON.stringify(response, null, 2);
  };

  const onClickHandler = () => {
    // Use the core http service to make a response to the server API.
    http.get('/api/dashboards_job_scheduler/example').then((res) => {
      setTimestamp(res.time);
      // Use the core notifications service to display a success message.
      notifications.toasts.addSuccess(
        i18n.translate('dashboardsJobScheduler.dataUpdated', {
          defaultMessage: 'Data updated time now',
        })
      );
    });
  };

  const getJobsHandler = () => {
    // Use the core http service to make a response to the server API.
    http.get('/api/dashboards_job_scheduler/jobs')
      .then((res) => {
        setJobs(res);
        notifications.toasts.addSuccess(
          i18n.translate('dashboardsJobScheduler.dataUpdated', {
            defaultMessage: 'Jobs data retrieved',
          })
        );
      })
      .catch((error) => {
        console.error('Error:', error);
        notifications.toasts.addError(error, {
          title: 'Failed to fetch jobs'
        });
      });
  };

  const getJobsByNodeHandler = () => {
    http.get('/api/dashboards_job_scheduler/jobs/by_node')
      .then((res) => {
        setJobsByNode(res);
        notifications.toasts.addSuccess(
          i18n.translate('dashboardsJobScheduler.dataUpdated', {
            defaultMessage: 'Jobs by node data retrieved',
          })
        );
      })
      .catch((error) => {
        console.error('Error:', error);
        notifications.toasts.addError(error, {
          title: 'Failed to fetch jobs by node'
        });
      });
  };

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
    <Router basename={basename}>
      <I18nProvider>
        <>
          <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={false}
            useDefaultBehaviors={true}
          />
          <EuiPage restrictWidth="1000px">
            <EuiPageBody component="main">
              <EuiPageHeader>
                <EuiTitle size="l">
                  <h1>
                    <FormattedMessage
                      id="dashboardsJobScheduler.helloWorldText"
                      defaultMessage="{name}"
                      values={{ name: 'Schedule' }}
                    />
                  </h1>
                </EuiTitle>
              </EuiPageHeader>
              <EuiPageContent>
                <EuiPageContentHeader>
                  <EuiTitle>
                    <h2>
                      <FormattedMessage
                        id="dashboardsJobScheduler.congratulationsTitle"
                        defaultMessage="Congratulations!"
                      />
                    </h2>
                  </EuiTitle>
                </EuiPageContentHeader>
                <EuiPageContentBody>
                  <EuiText>
                    <p>
                      <FormattedMessage
                        id="dashboardsJobScheduler.content"
                        defaultMessage="Provides Scheduled job information."
                      />
                    </p>
                    <EuiHorizontalRule />
                    <p>
                      <FormattedMessage
                        id="dashboardsJobScheduler.timestampText"
                        defaultMessage="Last timestamp: {time}"
                        values={{ time: timestamp ? timestamp : 'Unknown' }}
                      />
                    </p>
                    <EuiButton type="primary" size="s" onClick={onClickHandler}>
                      <FormattedMessage
                        id="dashboardsJobScheduler.buttonText"
                        defaultMessage="Get data"
                      />
                    </EuiButton>
                    <EuiHorizontalRule />
                    <p>
                      <FormattedMessage
                        id="dashboardsJobScheduler.content2"
                        defaultMessage="Attempted API call for scheduled jobs."
                      />
                    </p>
                    <EuiButton type="primary" size="s" onClick={getJobsHandler}>
                      <FormattedMessage
                        id="dashboardsJobScheduler.buttonText"
                        defaultMessage="Get jobs"
                      />
                    </EuiButton>
                    {jobs && (
                      <>
                        <p>Failures: {jobs.failures?.length || 0} | Total Jobs: {jobs.total_jobs || 0}</p>
                        <EuiBasicTable
                          items={jobs.jobs || []}
                          columns={[
                            { field: 'job_id', name: 'Job ID' },
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
                        />
                      </>
                    )}
                    <EuiHorizontalRule />
                    <p>
                      <FormattedMessage
                        id="dashboardsJobScheduler.content3"
                        defaultMessage="Attempted API call for scheduled jobs by node."
                      />
                    </p>
                    <EuiButton type="primary" size="s" onClick={getJobsByNodeHandler}>
                      <FormattedMessage
                        id="dashboardsJobSchedulerByNode.buttonText"
                        defaultMessage="Get jobs by node"
                      />
                    </EuiButton>
                    {jobsByNode && (
                      <>
                        {jobsByNode.failures && jobsByNode.failures.length > 0 && (
                          <p>Failures: {jobsByNode.failures.join(', ')}</p>
                        )}
                        {jobsByNode.nodes?.map((node: any) => (
                          <div key={node.node_id}>
                            <p>Node: {node.node_id} | Total Jobs: {node.scheduled_job_info.total_jobs}</p>
                            <EuiBasicTable
                              items={node.scheduled_job_info.jobs || []}
                              columns={[
                                { field: 'job_id', name: 'Job ID' },
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
                            />
                          </div>
                        ))}
                      </>
                    )}
                  </EuiText>
                </EuiPageContentBody>
              </EuiPageContent>
            </EuiPageBody>
          </EuiPage>
        </>
      </I18nProvider>
    </Router>
  );
};
