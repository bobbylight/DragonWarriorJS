import { defineConfig } from 'vite';
import {resolve} from 'path';

export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src/"),
        },
    },
    build: {
        rolldownOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
            },
        },
    },
    plugins: [],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['src/test-setup.ts'],
        coverage: {
            reporter: ['text', 'json', 'lcov'],
            reportOnFailure: true,
        },
    },
});
