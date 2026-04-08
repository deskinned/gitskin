export default {
  sourceDir: '../dist/firefox',
  artifactsDir: '../web-ext-artifacts',
  run: {
    startUrl: ['https://github.com'],
    firefoxProfile: 'gitskin-dev',
    keepProfileChanges: true,
  },
};
