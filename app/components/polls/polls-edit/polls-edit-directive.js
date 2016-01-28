'use strict';

angular.module('polls.edit.directive', [
  'apiServices.poll.factory',
  'BettyCropper',
  'lodash',
  'saveButton.directive',
  'topBar'
]).constant('RESPONSE_TYPES', [
  {
    name: 'Text Only',
    value: 'Text'
  },
  {
    name: 'Image + Text',
    value: 'Image'
  }
])
  .directive('pollsEdit', function (routes) {
    return {
      templateUrl: routes.COMPONENTS_URL + 'polls/polls-edit/polls-edit.html',
      controller: function (_, $location, $q, $routeParams, $scope, $window, Poll) {
        // populate model for use
        if ($routeParams.id === 'new') {
          $scope.model = Poll.$build();
          $scope.isNew = true;
        } else {
          $scope.model = Poll.$find($routeParams.id);
        }

        var removeUnsavedChangesGuard = $window.addEventListener('onbeforeunload',  function (e) {
          if(!_.isEmpty($scope.model.$dirty()) || $scope.isNew || $scope.needsSave) {
            return 'You have unsaved changes.';
          }
        });

      $scope.$on('$destroy', removeUnsavedChangesGuard);

      $scope.saveModel = function () {
        if ($scope.model) {
          return $scope.model.$save().$asPromise().then(function (data) {
            $location.path('/cms/app/polls/edit/' + data.id + '/');
          });
        }
        return $q.reject();
      };

      // adding and removing response text logic
      $scope.idIncrementer = 0;

      $scope.model.answers = [
        {id: $scope.idIncrementer++},
        {id: $scope.idIncrementer++},
        {id: $scope.idIncrementer++}
      ];

      $scope.addAnswer = function () {
        $scope.model.answers.push({id: $scope.idIncrementer++});
      };

      $scope.removeAnswer = function (answerId) {
        _.remove($scope.model.answers, function (a) {
          return a.id === answerId;
        });
      };

      },
      restrict: 'E',
      scope: { getModelId: '&modelId' },
    };
  });
