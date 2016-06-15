angular.module('bulbs.cms.site.config', [
  'bulbs.cms.config'
])
  .config([
    'CmsConfigProvider',
    function (CmsConfig) {
      CmsConfig
        .setContentPartialsPath('/content_type_views/')
        .setComponentPath('/components/')
        .setImageApiUrl('http://localimages.avclub.com')
        .setImageApiKey('abc123');
    }
  ])
  .constant('routes', {
    LOADING_IMG_SRC: '/images/loading.gif',
    SHARED_URL: '/shared/',
    STATIC_URL: '/static/',
    PARTIALS_URL: '/views/',
    DIRECTIVE_PARTIALS_URL: '/views/',
    MEDIA_ITEM_PARTIALS_URL: '/cms/api/partials/media_items/'
  })
  .constant('LOADING_IMG_SRC', '/images/loading.gif')
  .constant('STATIC_URL', '/static/')
  .constant('PARTIALS_URL', '/views/')
  .constant('DIRECTIVE_PARTIALS_URL', '/views/')
  .constant('MEDIA_ITEM_PARTIALS_URL', '/cms/api/partials/media_items/')
  .constant('TIMEZONE_NAME', 'America/Chicago')
  .constant('AUTO_ADD_AUTHOR', false)
  .constant('DEFAULT_IMAGE_WIDTH', 1200)
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
