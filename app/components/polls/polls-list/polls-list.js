'use strict';

angular.module('polls.list', [
  'apiServices.poll.factory',
  'bulbs.cms.config',
  'bulbsCmsApp.settings',
  'bulbsCmsApp.nonRestmodListPage',
  'moment'
])
  .config(function ($injector, $routeProvider, CmsConfigProvider) {
    var CmsConfig = $injector.invoke(CmsConfigProvider.$get);

    $routeProvider
      .when('/cms/app/polls/', {
        controller: function ($scope, $window, Poll) {
          $window.document.title = CmsConfig.getCmsName() + ' | Poll';
          $scope.modelFactory = Poll;
        },
        templateUrl: CmsConfig.buildComponentPath('polls/polls-list/polls-list-page.html')
      });
  });
