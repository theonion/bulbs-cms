angular.module('bulbs.cms.site.config', [
  'bulbs.cms.base.config'
])
  .config([
    'CmsConfigProvider', 'ngClipProvider',
    function (CmsConfig, ngClipProvider) {
      CmsConfig
        .setApiUrlRoot('/cms/api/v1/')
        .setContentPartialsPath('/content_type_views/')
        .setComponentPath('/components/')
        .setDirectivePartialsPath('/views/')
        .setFirebaseSiteRoot('bulbs-cms-testing')
        .setFirebasePublicSiteRoot('bulbs-cms-testing')
        .setFirebaseUrl('https://luminous-fire-8340.firebaseio.com/')
        .setImageApiUrl('http://localimages.avclub.com')
        .setImageApiKey('abc123')
        .setSharedPath('/shared/');

      // so ng clip doesn't complain about not finding ZeroClipboard.swf in tests
      ngClipProvider.setPath('');
    }
  ]);
