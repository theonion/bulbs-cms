'use strict';

angular.module('bulbs.cms.superFeatures.list', [
  'bulbs.cms.superFeatures.api',
  'bulbs.cms.site.config',
  'bulbsCmsApp.nonRestmodListPage',
  'moment',
  'ngRoute'
])
  .config([
    '$injector', '$routeProvider', 'CmsConfigProvider',
    function ($injector, $routeProvider, CmsConfigProvider) {
      var CmsConfig = $injector.invoke(CmsConfigProvider.$get);

      $routeProvider
        .when('/cms/app/super-features/', {
          controller: [
            '$scope', '$window', 'SuperFeaturesApi',
            function ($scope, $window, SuperFeaturesApi) {
              $window.document.title = CmsConfig.getCmsName() + ' | Super Feature';
              $scope.modelFactory = SuperFeaturesApi;
            }
          ],
          templateUrl: CmsConfig.buildComponentPath(
            'super-features',
            'super-features-list',
            'super-features-list-page.html'
          )
        });
    }
  ]);
