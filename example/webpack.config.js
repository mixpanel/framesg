const webpackConfig = {
  entry: {
    'parent': './parent.js',
    'child': './child.js',
  },
  output: {
    filename: '[name].bundle.js',
  },
};

module.exports = webpackConfig;
