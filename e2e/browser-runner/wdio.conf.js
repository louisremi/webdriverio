import os from 'node:os'
import url from 'node:url'
import path from 'node:path'
import { loadEnv } from 'vite'
import { expect } from '@wdio/globals'

const isMac = os.platform() === 'darwin' && process.env.CI
const isWindows = os.platform() === 'win32'

/**
 * skip tests if:
 */
if (
    /**
     * WebdriverIO is using this example to test its component testing features
     * and we have experienced issues with Vue when running in Windows,
     * see https://github.com/testing-library/vue-testing-library/issues/292
     * Please ignore and remove this in your project!
     */
    (process.env.CI && process.env.WDIO_PRESET === 'vue' && (isWindows || isMac)) ||
    /**
     * We are running network mocking tests on Safari in CI where Safari has no support for
     * Bidi just yet.
     */
    (process.env.CI && isMac && process.argv.includes('mock.test.ts'))
) {
    process.exit(0)
}

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
export const config = {
    /**
     * specify test files
     */
    specs: [
        path.resolve(__dirname, '*.test.tsx'),
        path.resolve(__dirname, '*.test.js')
    ],

    /**
     * capabilities
     */
    capabilities: [
        isMac
            ? { browserName: 'safari' }
            : !process.env.WDIO_PRESET
                /**
                 * We need canary in all component tests for:
                 * - element look-ups with `browsingContext.locateNodes`
                 * - network mocking
                 */
                ? { browserName: 'chrome', browserVersion: 'canary', webSocketUrl: true }
                : { browserName: 'chrome', browserVersion: 'canary', webSocketUrl: true }
    ],

    /**
     * test configurations
     */
    logLevel: 'trace',
    framework: 'mocha',
    outputDir: path.join(__dirname, 'logs', process.env.WDIO_PRESET || 'misc'),
    reporters: ['spec', 'dot', 'junit'],
    runner: ['browser', {
        preset: process.env.WDIO_PRESET,
        rootDir: path.resolve(__dirname, '..'),
        viteConfig: ({ command, mode }) => {
            const env = loadEnv(mode, __dirname, '')
            return {
                // vite config
                define: {
                    WDIO_ENV_TEST: `${JSON.stringify(env.WDIO_ENV_TEST)}`,
                    TEST_COMMAND: `${JSON.stringify(command)}`
                },
            }
        },
        coverage: {
            enabled: true,
            // we skip some tests on Mac, therefor lower coverage treshold
            /**
             * Todo(@christian-bromann): set treshold back to 100
             */
            functions: isMac ? 60 : 80
        }
    }],

    mochaOpts: {
        ui: 'bdd',
        timeout: 150000,
        require: ['./__fixtures__/setup.js']
    },

    /**
     * in order to test custom matchers added by services, we push a service instance
     * to the service list
     */
    services: [[{
        before() {
            expect.extend({
                toBeFoo(received) {
                    return received === 'foo'
                        ? {
                            message: () => `expected ${received} not to be foo`,
                            pass: true
                        }
                        : {
                            message: () => `expected ${received} to be foo`,
                            pass: false
                        }
                }
            })
        }
    }, {}],

    ['static-server',
        {
            port: 8080,
            folders: [
                { mount: '/', path: path.join(__dirname, '__fixtures__') },
            ],
        }]],

    before: () => {
        /**
         * only run this test in lit
         */
        if (process.env.WDIO_PRESET !== 'lit') {
            return
        }

        browser.addCommand('someCustomCommand', () => 'Hello World')
    }
}
