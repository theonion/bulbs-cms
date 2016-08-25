'use strict';

angular.module('bulbs.cms.superFeatures.list', [
  'bulbs.cms.site.config',
  'bulbs.cms.superFeatures.api',
  'bulbsCmsApp.nonRestmodListPage',
  'lodash',
  'moment',
  'ngRoute',
  'statusFilter.config'
])
  .config([
    '_', '$injector', '$routeProvider', 'CmsConfigProvider',
      'StatusFilterOptionsProvider',
    function (_, $injector, $routeProvider, CmsConfigProvider,
        StatusFilterOptionsProvider) {

      var CmsConfig = $injector.invoke(CmsConfigProvider.$get);
      var StatusFilterOptions = $injector.invoke(StatusFilterOptionsProvider.$get);

      $routeProvider
        .when('/cms/app/super-features/', {
          controller: [
            '$scope', '$window', 'SuperFeaturesApi',
            function ($scope, $window, SuperFeaturesApi) {
              $window.document.title = CmsConfig.getCmsName() + ' | Super Feature';
              $scope.modelFactory = SuperFeaturesApi;

              $scope.editPageUrlBuilder = function (item) {
                return '/cms/app/edit/' + item.id + '/' + (item.polymorphic_ctype || CmsConfig.getSuperFeaturesType());
              };

              // TODO: using status filters from content page here since list
              //  page needs them in a different format. when we move content
              //  list page to the generic list page directive, this can be
              //  removed.
              $scope.statusFilterOptions = StatusFilterOptions.getStatuses()
                .filter(function (option) {
                  return option.label !== 'All';
                })
                .map(function (option) {
                  var params = {};

                  if (option.key) {
                    params[option.key] = _.isFunction(option.value) ? option.value() : option.value;
                  }

                  return {
                    title: option.label,
                    params: params
                  };
                });
            }
          ],
          templateUrl: CmsConfig.buildComponentPath(
            'super-features',
            'super-features-list',
            'super-features-list.html'
          )
        });
    }
  ]);
