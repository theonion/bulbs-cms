'use strict';

angular.module('apiServices.poll.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay',
  'bulbsCmsApp.nonRestmodListPage',
  'filters.moment'
])
.factory('Poll', ['$filter', '$http', '$q', function ($filter, $http, $q) {

  var pollInfo,
      filter,
      pollUrl = '/cms/api/v1/poll/',
      name = 'Poll',
      namePlural = 'Polls',
      fields = [{
          title: 'Poll Name',
          sorts: 'title'
        }, {
          title: 'Creator',
          sorts: 'authors.join(", ")'
        }, {
          title: 'Publish Date',
          sorts: 'publish_date'
        }, {
          title: 'Close Date',
          sorts: 'end_date'
      }];

  function getPoll(pollId) {
    filter = $filter('date_string_to_moment');

    return $http.get(pollUrl + pollId)
    .then(function (response) {
      if(response.status === 200) {
        response.data.end_date = filter(response.data.end_date);
        return response.data;
      } else {
        return $q.reject('Unable to retrieve poll');
      }
    });
  }

  function getPolls() {
    return $http.get(pollUrl)
    .then(function (response) {
      if(response.status === 200) {
        return response.data;
      } else {
        return $q.reject('Unable to retrieve polls');
      }
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
      if(response.status === 201) {
        return response.data;
      } else {
        return $q.reject(data.title + ' creation unsuccessful');
      }
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
      if(response.status === 200) {
        return response.data;
      } else {
        return $q.reject(data.title + ' update unsuccessful');
      }
    });
  }

  function deletePoll(pollId) {
    return $http.delete(pollUrl + pollId)
    .then(function(response) {
      if(response.status === 201) {
        return response;
      } else {
        return $q.reject('Poll deletion unsucessful');
      }
    });
  }

  return {
    getPoll: getPoll,
    getPolls: getPolls,
    fields: fields,
    name: name,
    namePlural: namePlural,
    postPoll: postPoll,
    updatePoll: updatePoll,
    deletePoll: deletePoll
  };
}]);
