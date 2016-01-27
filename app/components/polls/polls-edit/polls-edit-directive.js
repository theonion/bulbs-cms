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

        window.onbeforeunload = function (e) {
          if (!_.isEmpty($scope.model.$dirty()) ||
                $scope.isNew ||
                $scope.needsSave) {
            // unsaved changes, show confirmation alert
            return 'You have unsaved changes.';
          }
        };

        $scope.$on('$destroy', function() {
          // ensure even is cleaned up when we leave
          delete window.onbeforeunload;
        });

        // set up save state function
        $scope.saveModel = function () {
          var promise;

          if ($scope.model) {
            // have model, use save promise as deferred
            promise = $scope.model.$save().$asPromise().then(function (data) {
              $location.path('/cms/app/polls/edit/' + data.id + '/');
            });
          } else {
            // no model, this is an error, defer and reject
            var deferred = $q.defer();
            deferred.reject();
            promise = deferred.promise;
          }

          return promise;
        };

        // adding and removing response text logic

        $scope.idIncrementer = 0;

        $scope.model.answers = [
          {id: $scope.idIncrementer++},
          {id: $scope.idIncrementer++},
          {id: $scope.idIncrementer++}
         ]

        $scope.addAnswer = function () {
          $scope.model.answers.push({'id': $scope.idIncrementer++});
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
