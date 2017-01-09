const path = require('path')
const htmlStandards = require('reshape-standard')
const cssStandards = require('spike-css-standards')
const placehold = require('postcss-placehold')
const brandColors = require('postcss-brand-colors')
const jsStandards = require('babel-preset-latest')
const pageId = require('spike-page-id')

module.exports = {
  devtool: 'source-map',
  vendor: 'assets/vendor/**',
  matchers: {
    html: '*(**/)*.sgr',
    css: '*(**/)*.sss'
  },
  ignore: ['**/layout.sgr', '**/_*', '**/.*', '_cache/**', 'readme.md'],
  reshape: (ctx) => {
    return htmlStandards({
      webpack: ctx,
      locals: { pageId: pageId(ctx), foo: 'bar' }
    })
  },
  postcss: (ctx) => {
    const css = cssStandards({ webpack: ctx })
    css.plugins.push(brandColors())
    css.plugins.unshift(placehold())
    // console.log(css.plugins.length)
    // console.log(css.plugins)
    return css
  },
  babel: { presets: [jsStandards] },
  server: { open: false }
}
