'use strict';

angular.module('apiServices.poll.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay',
  'bulbsCmsApp.nonRestmodListPage',
  'filters.moment',
  'lodash'
])
.factory('Poll', ['$filter', '$http', '$q', '_', 'moment', function ($filter, $http, $q, _, moment) {

  var error = function(message) {
    return new Error('Poll Error: ' + message);
  };

  var fields = [{
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
  var filter;
  var name = 'Poll';
  var namePlural = 'Polls';
  var pollInfo;
  var pollUrl = '/cms/api/v1/poll/';

  function getPoll(pollId) {
    filter = $filter('date_string_to_moment');

    return $http.get(pollUrl + pollId + '/')
    .then(function (response) {
      response.data.end_date = filter(response.data.end_date);
      return response.data;
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
    if(_.isUndefined(data.title) && _.isUndefined(data.question_text)) {
      throw error('title and question text required');
    }

    if(data.end_date) {
      if(!moment.isMoment(data.end_date)) {
        throw error('end_date must be a moment object');
      }
      filter = $filter('moment_to_date_string');
      pollInfo.end_date = filter(data.end_date);
    }
    pollInfo = { title: data.title, question_text: data.question_text};
    return $http.post(pollUrl, pollInfo).then(function(response) {
        return response.data;
    });
  }

  function updatePoll(data) {
    if(_.isUndefined(data.title) && _.isUndefined(data.question_text)) {
      throw error('title and question text required');
    }

    pollInfo = { title: data.title, question_text: data.question_text};

    if(data.end_date) {
      if(!moment.isMoment(data.end_date)) {
        throw error('end_date must be a moment object');
      }
      filter = $filter('moment_to_date_string');
      pollInfo.end_date = filter(data.end_date);
    }

    return $http.put(pollUrl + data.id + '/', pollInfo)
    .then(function(response) {
      return response.data;
    });
  }

  function deletePoll(pollId) {
    return $http.delete(pollUrl + pollId + '/')
    .then(function(response) {
      return response;
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
