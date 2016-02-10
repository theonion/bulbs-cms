'use strict';

angular.module('apiServices.poll.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay',
  'filters.moment'
])
.factory('Poll', ['$http', '$q', function ($http, $q) {

  var pollUrl = '/cms/api/v1/poll/';

  function getPoll(pollId) {
    return $http.get(pollUrl + pollId)
    .then(function (response) {
      if(response.status === 200) {
        return response;
      } else {
        return $q.reject('Unable to retrieve poll');
      }
    });
  };

  function postPoll(data) {
    return $http.post(pollUrl, {
      title: data.title,
      question_text: data.question_text,
      end_date: data.end_date
    }).then(function(response) {
      if(response.status === 201) {
        return response.data;
      } else {
        return $q.reject(poll.title + ' creation unsuccessful');
      }
    });
  };

  function updatePoll(data) {
    return $http.put(pollUrl + data.id, {
      title: data.title,
      question_text: data.question_text,
      end_date: data.end_date
    }).then(function(response) {
      if(response.status === 200) {
        return response.data;
      } else {
        return $q.reject(data.title + ' update unsuccessful');
      }
    });
  };

  function deletePoll(pollId) {
    return $http.delete(pollUrl + pollId)
    .then(function(response) {
      if(response.status === 201) {
        return response;
      } else {
        return $q.reject('Poll deletion unsucessful');
      }
    });
  };

  return {
    getPoll: getPoll,
    postPoll: postPoll,
    updatePoll: updatePoll,
    deletePoll: deletePoll
  };
}]);
