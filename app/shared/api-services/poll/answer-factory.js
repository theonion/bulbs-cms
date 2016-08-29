'use strict';

angular.module('apiServices.answer.factory', [
  'apiServices',
  'cms.config',
  'lodash'
])
.factory('Answer', [
  '$http', '$q', '_', 'CmsConfig',
  function ($http, $q, _, CmsConfig) {

    var answerUrl = CmsConfig.buildBackendApiUrl('poll-answer/');

    var error = function(message) {
      return new Error('Poll Error: ' + message);
    };

    var deleteAnswers = function (deletedAnswers) {
      var deletePromise = _.map(deletedAnswers, function(deletedAnswer) {
        return $http.delete(answerUrl + deletedAnswer.id + '/');
      });
      $q.all(deletePromise).then(function(response) {
        return response;
      });
    };

    var putAnswer = function (oldAnswers, newAnswer) {
      var oldAnswer = _.filter(oldAnswers, {id: newAnswer.id})[0];
      var oldImgId = oldAnswer.answer_image ? oldAnswer.answer_image.id : undefined;
      var newImgId= newAnswer.answer_image ? newAnswer.answer_image.id : undefined;

      if(newAnswer.answer_text !== oldAnswer.answer_text ||
        newImgId !== oldImgId) {
        return $http.put(answerUrl + newAnswer.id + '/', {
          answer_text: newAnswer.answer_text,
          answer_image: newAnswer.answer_image
        }).then(function(response) {
          return response.data;
        });
      }
    };

    var postAnswer = function (answer, pollId) {
      if(!_.isNumber(pollId) || _.isUndefined(answer.answer_text)) {
        throw error('poll id and answer_text fields required');
      }
      return $http.post(answerUrl, {
        poll: pollId,
        answer_text: answer.answer_text,
        answer_image: answer.answer_image
      }).then(function(response) {
        return response.data;
      });
    };

    var updatePollAnswers = function (scope) {
      deleteAnswers(scope.deletedAnswers);
      _.forEach(scope.answers, function(answer) {
        if(answer.notOnSodahead) {
          postAnswer(answer, scope.model.id);
        } else {
          putAnswer(scope.model.answers, answer);
        }
      });
    };

    return {
      postAnswer: postAnswer,
      updatePollAnswers: updatePollAnswers
    };
  }]);
