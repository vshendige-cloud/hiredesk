import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Integration tests share one database, so run their files one at a time.
    fileParallelism: false,
    testTimeout: 15000,
  },
});
