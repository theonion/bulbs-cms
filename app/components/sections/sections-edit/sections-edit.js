'use strict';

angular.module('sections.edit', [
  'bulbs.cms.config',
  'sections.edit.directive'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/cms/app/section/edit/:id/', {
        controller: function ($routeParams, $scope, $window, CmsConfig) {
          $window.document.title = CmsConfig.getCmsName() + ' | Edit Section';
          $scope.routeId = $routeParams.id;
        },
        template: '<sections-edit model-id="routeId"></sections-edit>',
        reloadOnSearch: false
      });
  });
