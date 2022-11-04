/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

// eslint-disable-next-line import/no-default-export
export default {
    // A list of paths to modules that run some code to configure or set up the testing framework
    // before each test file in the suite is executed
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // https://kulshekhar.github.io/ts-jest/docs/getting-started/options
    preset: 'ts-jest',

    // The test environment that will be used for testing
    testEnvironment: 'jsdom',

    // A map from regular expressions to module names that allow to stub out resources with a single module
    moduleNameMapper: {
        '^lodash-es$': 'lodash',
    },
}
