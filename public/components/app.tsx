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
                        id="dashboardsJobScheduler.content"
                        defaultMessage="Attempted API call for scheduled jobs."
                      />
                    </p>
                    <p>
                      <FormattedMessage
                        id="dashboardsJobScheduler.jobs"
                        defaultMessage="Jobs: {jobs}"
                        values={{ jobs: jobs ? convertResponseToText(jobs) : 'No jobs data' }}
                      />
                    </p>
                    <EuiButton type="primary" size="s" onClick={getJobsHandler}>
                      <FormattedMessage
                        id="dashboardsJobScheduler.buttonText"
                        defaultMessage="Get jobs"
                      />
                    </EuiButton>
                    <EuiHorizontalRule />
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
