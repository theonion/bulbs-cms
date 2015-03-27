'use strict';

angular.module('genericAjaxButton.controller', [])
  .controller('GenericAjaxButtonController', function ($scope) {
    $scope.STATES = {
      DONE: 'done',
      PROGRESS: 'in-progress',
      ERROR: 'error'
    };
    $scope.doClick = function () {
      $scope.state = $scope.STATES.PROGRESS;
      $scope.clickFunction()
        .then(function () {
          $scope.state = $scope.STATES.DONE;
        })
        .catch(function () {
          $scope.state = $scope.STATES.ERROR;
        });
    };
  });
