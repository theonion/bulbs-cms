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
        .setFirebaseSiteRoot('bulbs-cms-test')
        .setFirebaseUrl('https://luminous-fire-8340.firebaseio.com/')
        .setImageApiUrl('http://localimages.avclub.com')
        .setImageApiKey('abc123')
        .setSharedPath('/shared/');
    }
  ])
  .constant('VIDEO_EMBED_URL', 'http://www.avclub.com/video/embed?id=');
