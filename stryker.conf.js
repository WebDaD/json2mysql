module.exports = function (config) {
  config.set({
    mutator: 'javascript',
    packageManager: 'npm',
    reporters: ['html', 'clear-text', 'progress'],
    testRunner: 'mocha',
    transpilers: [],
    testFramework: 'mocha',
    coverageAnalysis: 'perTest',
    mochaOptions: {files: ['test/unittest.js']},
    mutate: ['index.js']
  })
}
