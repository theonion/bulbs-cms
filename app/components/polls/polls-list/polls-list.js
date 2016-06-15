'use strict';

angular.module('polls.list', [
  'apiServices.poll.factory',
  'bulbs.cms.config',
  'bulbsCmsApp.settings',
  'bulbsCmsApp.nonRestmodListPage',
  'moment'
])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/polls/', {
        controller: function ($scope, $window, CmsConfig, Poll) {
          $window.document.title = CmsConfig.getCmsName() + ' | Poll';
          $scope.modelFactory = Poll;
        },
        templateUrl: routes.COMPONENTS_URL + 'polls/polls-list/polls-list-page.html'
      });
  });
