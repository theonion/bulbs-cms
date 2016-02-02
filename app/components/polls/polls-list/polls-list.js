'use strict';

angular.module('polls.list', [
  'apiServices.poll.factory',
  'bulbsCmsApp.settings',
  'listPage',
  'moment'
])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/polls/', {
        controller: function ($scope, $window, Poll) {
          // set title
          $window.document.title = routes.CMS_NAMESPACE + ' | Poll';

          $scope.modelFactory = Poll;
        },
        templateUrl: routes.COMPONENTS_URL + 'polls/polls-list/polls-list-page.html'
      });
  });
