angular.module('bulbs.cms.site.config', [
  'bulbs.cms.base.config'
])
  .config([
    'CmsConfigProvider',
    function (CmsConfig) {
      CmsConfig
        .setContentPartialsPath('/content_type_views/')
        .setComponentPath('/components/')
        .setDirectivePartialsPath('/views/')
        .setFirebaseSiteRoot('bulbs-cms-testing')
        .setFirebasePublicSiteRoot('bulbs-cms-testing')
        .setFirebaseUrl('https://luminous-fire-8340.firebaseio.com/')
        .setImageApiUrl('http://localimages.avclub.com')
        .setImageApiKey('abc123')
        .setSharedPath('/shared/');
    }
  ]);
