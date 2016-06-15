'use strict';

angular.module('polls.edit', [
  'bulbs.cms.config',
  'polls.edit.directive'
])
  .config(function ($routeProvider) {
    $routeProvider
    .when('/cms/app/polls/edit/:id/', {
      controller: function ($routeParams, $scope, $window, CmsConfig) {
        $window.document.title = CmsConfig.getCmsName() + ' | Edit Poll';
        $scope.routeId = $routeParams.id;
      },
      template: '<polls-edit model-id="routeId"></polls-edit>',
      reloadOnSearch: false
    });
  });
