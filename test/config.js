angular.module('bulbs.cms.site.config', [
  'bulbs.cms.config'
])
  .config([
    'CmsConfigProvider',
    function (CmsConfig) {
      CmsConfig
        .setContentPartialsPath('/content_type_views/')
        .setComponentPath('/components/')
        .setDirectivePartialsPath('/views/')
        .setImageApiUrl('http://localimages.avclub.com')
        .setImageApiKey('abc123')
        .setSharedPath('/shared/');
    }
  ])
  .constant('TIMEZONE_NAME', 'America/Chicago')
  .constant('VIDEO_EMBED_URL', 'http://www.avclub.com/video/embed?id=')
  .constant('firebaseApiConfig', {
      FIREBASE_ROOT: 'bulbs-cms-test',
      FIREBASE_URL: 'https://luminous-fire-8340.firebaseio.com/'
  })
  .constant('tar_options', {
    namespace: 'Woodruff',
    endpoint: '/ads/targeting'
  })
  .constant('navbar_options', {});
