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
    controller: function (_, $http, $location, $q, $routeParams, $scope, $window, Answer, Poll) {
      // populate model for use
      if ($routeParams.id === 'new') {
        $scope.model = new Poll();
        $scope.isNew = true;
      } else {
        Poll.get({pollId: $routeParams.id})
          .$promise.then(function successCallback(response) {
            $scope.model = response;
            $scope.answers = response.answers;
          });
      }

      $window.scope = $scope;
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
          Answer.deleteSodaheadAnswers($scope.deletedAnswers);
          // reset deleted answers
          $scope.deletedAnswers = [];
          //
          // _.forEach($scope.model.answers, function(answer) {
          //   if(!$scope.isNew && !answer.notOnSodahead) {
          //     $scope.putSodaheadAnswer(answer);
          //   }
          //   if(!$scope.isNew && answer.notOnSodahead) {
          //     $scope.postSodaheadAnswer(answer, $scope.model.$pk);
          //   }
          // });

          return $scope.model.$save().then(function (data) {
            // if($scope.isNew) {
            //   var answerPromises = _.map($scope.answers, function (answer) {
            //     return $scope.postSodaheadAnswer(answer, data.id);
            //   });
            //   $q.all(answerPromises).then(function () {
            //     $location.path('/cms/app/polls/edit/' + data.id + '/');
            //   });
            // } else {
              $location.path('/cms/app/polls/edit/' + data.id + '/');
            // }
          });
        }
        return $q.reject();
      };

      $scope.deletedAnswers = [];

      $scope.addAnswer = function () {
        var newId = ($scope.answers) ? $scope.answers.length + 1 : 1;
        $scope.model.answers.push({id: newId, notOnSodahead: true});
      };

      // create 3 blank answer objects if this is a new poll
      if($scope.isNew) {
        $scope.model.answers = [];
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
