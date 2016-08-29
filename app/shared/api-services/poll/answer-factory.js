'use strict';

angular.module('apiServices.answer.factory', [
  'apiServices',
  'bulbs.cms.config',
  'lodash'
])
.factory('Answer', ['$http', '$q', '_', 'CmsConfig', function ($http, $q, _, CmsConfig) {

  var answerUrl = CmsConfig.buildBackendApiUrl('poll-answer/');
  var error = function(message) {
    return new Error('Poll Error: ' + message);
  };

  function deleteAnswers(deletedAnswers) {
    var deletePromise = _.map(deletedAnswers, function(deletedAnswer) {
      return $http.delete(answerUrl + deletedAnswer.id);
    });
    $q.all(deletePromise).then(function(response) {
      return response;
    });
  }

  function putAnswer(oldAnswers, newAnswer) {
    var oldAnswer = _.filter(oldAnswers, {id: newAnswer.id})[0];
    if(newAnswer.answer_text !== oldAnswer.answer_text) {
      return $http.put(answerUrl + newAnswer.id, {
        answer_text: newAnswer.answer_text
      }).then(function(response) {
        return response.data;
      });
    }
  }

  function postAnswer(answer, pollId) {
    if(!_.isNumber(pollId) || _.isUndefined(answer.answer_text)) {
      throw error('poll id and answer_text fields required');
    }
    return $http.post(answerUrl, {
      poll: pollId,
      answer_text: answer.answer_text
    }).then(function(response) {
      return response.data;
    });
  }

  function updatePollAnswers(scope) {
    deleteAnswers(scope.deletedAnswers);
    _.forEach(scope.answers, function(answer) {
      if(answer.notOnSodahead) {
        postAnswer(answer, scope.model.id);
      } else {
        putAnswer(scope.model.answers, answer);
      }
    });
  }

  return {
    postAnswer: postAnswer,
    updatePollAnswers: updatePollAnswers
  };
}]);
