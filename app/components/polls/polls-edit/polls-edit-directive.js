'use strict';

angular.module('polls.edit.directive', [
  'apiServices.answer.factory',
  'apiServices.poll.factory',
  'BettyCropper',
  'bulbs.cms.site.config',
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
.directive('pollsEdit', function (CmsConfig) {
  return {
    templateUrl: CmsConfig.buildComponentPath('polls/polls-edit/polls-edit.html'),
    controller: function (_, $http, $location, $q, $routeParams, $scope, $timeout, Answer, Poll) {
      // populate model for use
      if ($routeParams.id === 'new') {
        $scope.model = {};
        $scope.isNew = true;
      } else {
        Poll.getPoll($routeParams.id)
          .then(function successCallback(response) {
            $scope.model = response;
            $scope.answers = _.cloneDeep(response.answers);
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

      $scope.validatePublication = function () {
        // The datetime-selection-modal-opener interacts with scope
        // in such a way that modal-on-close="validatePublication()"
        // fires before the scope model data has changed.
        $timeout(function () {
          var published = $scope.model.published;
          var endDate = $scope.model.end_date;
          var publishedField = $scope.pollForm.published;
          var endDateField = $scope.pollForm.endDate;

          publishedField.$setValidity(
            'requiredWithEndDate',
            !(endDate && !published)
          );

          var comesAfterPublishedValid = true;
          if (endDate && published) {
            comesAfterPublishedValid = published.isBefore(endDate);
          }
          endDateField.$setValidity(
            'comesAfterPublished',
            comesAfterPublishedValid
          );
        });
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
