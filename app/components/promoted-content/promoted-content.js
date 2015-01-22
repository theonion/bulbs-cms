'use strict';

angular.module('promotedContent', [
  'bulbsCmsApp.settings',
  'promotedContentPzoneSelect',
  'promotedContentList',
  'promotedContentSearch',
  'promotedContentTimePicker',
  'promotedContentOperationsList'
])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/promotion/', {
        controller: function ($window) {
          // set title
          $window.document.title = routes.CMS_NAMESPACE + ' | Promotion Tool';
        },
        templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content.html',
        reloadOnSearch: false
      });
  });
