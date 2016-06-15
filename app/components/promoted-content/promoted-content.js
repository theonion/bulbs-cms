'use strict';

angular.module('promotedContent', [
  'bulbs.cms.config',
  'bulbsCmsApp.settings',
  'promotedContentPzoneSelect',
  'promotedContentList',
  'promotedContentSearch',
  'promotedContentTimePicker',
  'promotedContentOperationsList',
])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/promotion/', {
        controller: [
          '$window', 'CmsConfig',
          function ($window, CmsConfig) {
            $window.document.title = CmsConfig.getCmsName() + ' | Promotion Tool';
          }
        ],
        templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content.html',
        reloadOnSearch: false
      });
  });
