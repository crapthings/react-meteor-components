Package.describe({
  name: 'crapthings:react-meteor-components',
  summary: 'meteor api in jsx',
  version: '0.0.1',
  git: 'https://github.com/crapthings/react-meteor-components'
})

Package.on_use(function (api) {
  api.use(['ecmascript', 'mongo', 'react-meteor-data'])
  api.mainModule('index.js')
})
