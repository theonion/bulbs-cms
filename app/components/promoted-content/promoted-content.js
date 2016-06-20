'use strict';

angular.module('promotedContent', [
  'bulbs.cms.site.config',
  'promotedContentPzoneSelect',
  'promotedContentList',
  'promotedContentSearch',
  'promotedContentTimePicker',
  'promotedContentOperationsList',
])
  .config(function ($injector, $routeProvider, CmsConfigProvider) {
    var CmsConfig = $injector.invoke(CmsConfigProvider.$get);

    $routeProvider
      .when('/cms/app/promotion/', {
        controller: [
          '$window', 'CmsConfig',
          function ($window) {
            $window.document.title = CmsConfig.getCmsName() + ' | Promotion Tool';
          }
        ],
        templateUrl: CmsConfig.buildComponentPath('promoted-content/promoted-content.html'),
        reloadOnSearch: false
      });
  });
