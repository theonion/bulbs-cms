'use strict';

angular.module('promotedContent', [
  'bulbsCmsApp.settings',
  'promotedContentPzoneSelect',
  'promotedContentList',
  'promotedContentSearch',
  'promotedContentTimePicker',
  'promotedContentOperationsList',
])
  .config(function ($routeProvider, COMPONENTS_URL, CMS_NAMESPACE) {
    $routeProvider
      .when('/cms/app/promotion/', {
        controller: [
          '$window',
          function ($window) {
            // set title
            $window.document.title = CMS_NAMESPACE + ' | Promotion Tool';
          }
        ],
        templateUrl: COMPONENTS_URL + 'promoted-content/promoted-content.html',
        reloadOnSearch: false
      });
  });
