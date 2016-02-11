'use strict';

angular.module('apiServices.answer.factory', [
  'apiServices',
  'lodash'
])
.factory('Answer', ['$http', '$q', '_', function ($http, $q, _) {

  var answerUrl = '/cms/api/v1/answer/';

  function deleteAnswers(deletedAnswers) {
    var deletePromise = _.map(deletedAnswers, function(deletedAnswer) {
      return $http.delete(answerUrl + deletedAnswer.id);
    });
    $q.all(deletePromise).then(function(response) {
      if(response.status === 201) {
        return response;
      } else {
        return $q.reject('Delete unsucessful');
      }
    });
  }

  function putAnswer(oldAnswers, newAnswer) {
    var oldAnswer = _.filter(oldAnswers, {id: newAnswer.id})[0];
    if(newAnswer.answer_text !== oldAnswer.answer_text) {
      return $http.put(answerUrl + newAnswer.id, {
        answer_text: newAnswer.answer_text
      }).then(function(response) {
        if(response.status === 200) {
          return response.data;
        } else {
          return $q.reject(newAnswer.answer_text + ' update unsuccessful');
        }
      });
    }
  }

  function postAnswer(answer, pollId) {
    return $http.post(answerUrl, {
      poll: pollId,
      answer_text: answer.answer_text
    }).then(function(response) {
      if(response.status === 201) {
        return response.data;
      } else {
        debugger;
        return $q.reject(answer.answer_text + ' post unsuccessful');
      }
    });
  }

  function updatePollAnswers(scope) {
    deleteAnswers(scope.deletedAnswers);
    _.forEach(scope.model.answers, function(answer) {
      if(answer.notOnSodahead) {
        postAnswer(answer, scope.model.id);
      } else {
        putAnswer(scope.answers, answer);
      }
    });
  }

  return {
    postAnswer: postAnswer,
    updatePollAnswers: updatePollAnswers
  };
}]);
