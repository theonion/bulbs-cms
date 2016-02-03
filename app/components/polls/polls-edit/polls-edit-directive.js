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
      controller: function (_, $http, $location, $q, $routeParams, $scope, Poll) {
        // populate model for use
        if ($routeParams.id === 'new') {
          $scope.model = Poll.$build();
          $scope.poll = Poll.$build();
          $scope.isNew = true;
        } else {
          $scope.model = Poll.$find($routeParams.id);
          $scope.poll = Poll.$find($routeParams.id);
        }

        window.onbeforeunload = function (e) {
          if(!_.isEmpty($scope.model.$dirty()) || $scope.isNew || $scope.needsSave) {
            // show confirmation alert
            return 'You have unsaved changes.';
          }
        };

        $scope.$on('$destroy', function () {
          // remove alert when we go
          delete window.onbeforeunload;
        });

      $scope.saveModel = function () {
        if ($scope.model) {
          // delete answers
          var answerUrl = '/cms/api/v1/answer/';
          _.forEach($scope.deletedAnswers, function(deletedAnswer) {
            $http.delete(answerUrl + deletedAnswer.id);
          });

          _.forEach($scope.model.answers, function(answer) {
          // update existing answers
          if(!$scope.isNew) {
            var oldAnswer = _.filter($scope.poll.answers, {id: answer.id})[0];
            if(answer.answerText !== oldAnswer.answerText) {
              $http.put(answerUrl + answer.id, { answer_text: answer.answerText});
            }
          }

          // post new answers
          if(!$scope.isNew && answer.notOnSodahead) {
              $http.post(answerUrl, {
                poll: $scope.model.$pk,
                answer_text: answer.answerText
              });
            }
          });

          // save poll
          $scope.answers = $scope.model.answers;
          return $scope.model.$save().$asPromise().then(function (data) {
            if($scope.isNew) {
              _.forEach($scope.answers, function (answer) {
                $http.post(answerUrl, {
                  poll: data.id,
                  answer_text: answer.answerText
                });
              });
            }
            $location.path('/cms/app/polls/edit/' + data.id + '/');
          });

        }
        return $q.reject();
      };

      $scope.deletedAnswers = [];

      $scope.addAnswer = function () {
        var newId = ($scope.model.answers) ? $scope.model.answers.length + 1 : 1;
        $scope.model.answers.push({id: newId, notOnSodahead: true});
      };

      // create 3 blank answer objects if this is a new poll
      if($scope.isNew) {
        $scope.model.answers = [];
        _.times(3, $scope.addAnswer);
      }

      $scope.removeAnswer = function (answerId) {
        var deletedAnswer = _.remove($scope.model.answers, function (a) {
          return a.id === answerId;
        });
        if(deletedAnswer[0].notOnSodahead) { return; }
        $scope.deletedAnswers.push(deletedAnswer[0]);
      };

      },
      restrict: 'E',
      scope: { getModelId: '&modelId' },
    };
  });
