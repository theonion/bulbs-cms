angular.module('bulbs.cms.base.config', [
  'bulbs.cms.config',
  'ngClipboard'
])
  .config([
    'CmsConfigProvider', 'ngClipProvider',
    function (CmsConfigProvider, ngClipProvider) {

      CmsConfigProvider
        .setCacheBuster('?' + new Date())
        .setContentPartialsPath('/content_type_views')
        .setComponentPath('/components')
        .setDirectivePartialsPath('/views')
        .setSharedPath('/shared')
        .setTopBarMapping('nav', '/views/nav.html')
        .setTopBarMapping('reportbar', '/views/reportbar.html')
        .setTopBarMapping('toolbar', '/views/toolbar.html')
        .setUnpublishedPath('unpublished');

      ngClipProvider.setPath('/bower_components/zeroclipboard/dist/ZeroClipboard.swf');
    }
  ]);
