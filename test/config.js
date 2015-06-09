'use strict';

angular.module('BettyCropper').constant('IMAGE_SERVER_URL', 'http://localimages.avclub.com');
angular.module('BettyCropper').constant('BC_API_KEY', 'http://localimages.avclub.com');

angular.module('apiServices.settings', []).constant('API_URL_ROOT', '/cms/api/v1/');

angular.module('bulbsCmsApp')
  .config(function (CmsConfigProvider, CONTENT_PARTIALS_URL, DIRECTIVE_PARTIALS_URL, PARTIALS_URL) {
    CmsConfigProvider.setApiPath('/cms/api/v1/');
    CmsConfigProvider.setLogoUrl('/images/onion-logo.png');
    CmsConfigProvider.setToolbarMappings({
      toolbar: PARTIALS_URL + 'toolbar.html'
    });
    CmsConfigProvider.addEditPageMapping(
      CONTENT_PARTIALS_URL + 'content_content.html',
      'content_content'
    );
    CmsConfigProvider.setCreateContentTemplateUrl(DIRECTIVE_PARTIALS_URL + 'create-content.html');
  });

angular.module('bulbsCmsApp.settings')
  .constant('AUTO_ADD_AUTHOR', false)
  .constant('BC_ADMIN_URL', 'http://localimages.avclub.com')
  .constant('CACHEBUSTER', '?' + Date.now())
  .constant('CMS_NAMESPACE', 'Bulbs')
  .constant('COMPONENTS_URL', '/components/')
  .constant('CONTENT_PARTIALS_URL', '/content_type_views/')
  .constant('DEFAULT_IMAGE_WIDTH', 1200)
  .constant('DIRECTIVE_PARTIALS_URL', '/views/')
  .constant('IMAGE_SERVER_URL', 'http://localimages.avclub.com')
  .constant('LOADING_IMG_SRC', '/images/loading.gif')
  .constant('MEDIA_ITEM_PARTIALS_URL', '/cms/api/partials/media_items/')
  .constant('PARTIALS_URL', '/views/')
  .constant('SHARED_URL', '/shared/')
  .constant('STATIC_URL', '/static/')
  .constant('RESTANGULAR_API_URL_ROOT', '/cms/api/v1')
  .constant('TIMEZONE_NAME', 'America/Chicago')
  .constant('VIDEO_EMBED_URL', 'http://www.avclub.com/video/embed?id=')
  .constant('firebaseApiConfig', {
      FIREBASE_ROOT: 'bulbs-cms-test',
      FIREBASE_URL: 'https://luminous-fire-8340.firebaseio.com/'
  })
  .constant('TAR_OPTIONS', {
    namespace: 'Woodruff',
    endpoint: '/ads/targeting'
  })
  .constant('ZERO_CLIPBOARD_SWF', '/static/ZeroClipboard.swf');
