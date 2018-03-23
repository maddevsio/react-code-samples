// https://github.com/diegohaz/arc/wiki/Containers
const req = require.context('.', false, /^((?!index).)*\.js$/)

req.keys().forEach((key) => {
  const helperName = key.replace(/^\.\/([^.]+)\.js$/, '$1')
  module.exports[helperName] = req(key).default
})
