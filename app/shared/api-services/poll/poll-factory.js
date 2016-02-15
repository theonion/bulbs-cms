'use strict';

angular.module('apiServices.poll.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay',
  'filters.moment'
])
.factory('Poll', ['$filter', '$http', '$q', function ($filter, $http, $q) {

  var pollInfo,
      filter,
      pollUrl = '/cms/api/v1/poll/';

  function getPoll(pollId) {
    filter = $filter('date_string_to_moment');

    return $http.get(pollUrl + pollId)
    .then(function (response) {
      response.data.end_date = filter(response.data.end_date);
      return response.data;
    });
  }

  function postPoll(data) {
    filter = $filter('moment_to_date_string');

    pollInfo = {
      title: data.title,
      question_text: data.question_text
    };

    if(data.end_date) {
      pollInfo.end_date = filter(data.end_date);
    }

    return $http.post(pollUrl, pollInfo).then(function(response) {
        return response.data;
    });
  }

  function updatePoll(data) {
    filter = $filter('moment_to_date_string');

    pollInfo = {
      title: data.title,
      question_text: data.question_text
    };

    if(data.end_date) {
      pollInfo.end_date = filter(data.end_date);
    }

    return $http.put(pollUrl + data.id, pollInfo)
    .then(function(response) {
      return response.data;
    });
  }

  function deletePoll(pollId) {
    return $http.delete(pollUrl + pollId)
    .then(function(response) {
      return response;
    });
  }

  return {
    getPoll: getPoll,
    postPoll: postPoll,
    updatePoll: updatePoll,
    deletePoll: deletePoll
  };
}]);
