const path = require('path');

module.exports = function(app) {
  // This is a workaround for the @emotion/weak-memoize issue
  app.use('/node_modules/@emotion/weak-memoize', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../node_modules/@emotion/weak-memoize/dist/emotion-weak-memoize.esm.js'));
  });
}; 