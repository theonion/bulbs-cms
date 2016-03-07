'use strict';

angular.module('polls.edit.directive', [
  'apiServices.poll.factory',
  'apiServices.answer.factory',
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
    controller: function (_, $http, $location, $q, $routeParams, $scope, Answer, Poll) {
      // populate model for use
      if ($routeParams.id === 'new') {
        $scope.model = {};
        $scope.isNew = true;
      } else {
        Poll.getPoll($routeParams.id)
          .then(function successCallback(response) {
            $scope.model = response;
            $scope.answers = response.answers;
          });
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

      $scope.embedCode = function () {
        return '<bulbs-poll src="/poll/' + $scope.model.id + '/merged.json"></bulbs-poll>';
      };

      $scope.saveModel = function () {
        if ($scope.model) {

          if(!$scope.isNew) {
            Answer.updatePollAnswers($scope);
            // reset deleted answers
            $scope.deletedAnswers = [];
            return Poll.updatePoll($scope.model);

          } else {
            return Poll.postPoll($scope.model).then(function (data) {
              var answerPromise = _.map($scope.answers, function (answer) {
                return Answer.postAnswer(answer, data.id);
              });

              return $q.all(answerPromise).then(function () {
                $location.path('/cms/app/polls/edit/' + data.id + '/');
              });
            });
          }
        } else {
          return $q.reject('Save failed');
        }
      };

      $scope.deletedAnswers = [];
      var newId = ($scope.answers) ? $scope.answers.length : 0;

      $scope.addAnswer = function () {
        $scope.answers.push({id: newId++, notOnSodahead: true});
      };

      // create 3 blank answer objects if this is a new poll
      if($scope.isNew) {
        $scope.answers = [];
        _.times(3, $scope.addAnswer);
      }


      $scope.removeAnswer = function (answerId) {
        var deletedAnswer = _.remove($scope.answers, function (a) {
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
