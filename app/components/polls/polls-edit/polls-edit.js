'use strict';

angular.module('polls.edit', [
  'polls.edit.directive'
])
  .config(function ($routeProvider, routes) {
    $routeProvider
    .when('/cms/app/polls/edit/:id/', {
      controller: function ($routeParams, $scope, $window) {

        // set title
        $window.document.title = routes.CMS_NAMESPACE + ' | Edit Poll';

        $scope.routeId = $routeParams.id;
      },
      template: '<polls-edit model-id="routeId"></polls-edit>',
      reloadOnSearch: false
    });
  });
