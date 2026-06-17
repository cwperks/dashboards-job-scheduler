const SPDX_LICENSE_HEADER = `
/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 */
`;

module.exports = {
  root: true,
  extends: ['@elastic/eslint-config-kibana', 'plugin:@elastic/eui/recommended'],
  env: {
    'cypress/globals': true,
  },
  plugins: ['cypress', 'unused-imports'],
  rules: {
    // "@osd/eslint/require-license-header": "off"
    '@osd/eslint/no-restricted-paths': [
      'error',
      {
        basePath: __dirname,
        zones: [
          {
            target: ['(public|server)/**/*'],
            from: ['../../packages/**/*', 'packages/**/*'],
          },
        ],
      },
    ],
    // Add cypress specific rules here
    'cypress/no-assigning-return-values': 'error',
    'cypress/no-unnecessary-waiting': 'error',
    'cypress/assertion-before-screenshot': 'warn',
    'cypress/no-force': 'warn',
    'cypress/no-async-tests': 'error',
    // Unused imports and variables rules
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
  },
  overrides: [
    {
      files: ['**/*.{js,ts,tsx}'],
      rules: {
        '@osd/eslint/require-license-header': [
          'error',
          {
            licenses: [SPDX_LICENSE_HEADER],
          },
        ],
        'no-console': 0,
      },
    },
  ],
};
