'use strict';

angular.module('apiServices.poll.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay',
  'bulbsCmsApp.nonRestmodListPage',
  'filters.moment',
  'lodash'
])
.factory('Poll',
  ['$filter', '$http', '$q', '_', 'moment', 'Utils',
  function ($filter, $http, $q, _, moment, Utils) {

  var error = function(message) {
    return new Error('Poll Error: ' + message);
  };

  var fields = [{
      title: 'Poll Name',
      sorts: 'title',
    }, {
      title: 'Publish Date',
      sorts: 'publish_date',
      content: function (poll) {
        return poll.published ? poll.published.format('MM/DD/YY h:mma') : '—';
      },
    }, {
      title: 'Close Date',
      sorts: 'end_date',
      content: function (poll) {
        return poll.end_date ? poll.end_date.format('MM/DD/YY h:mma') : '—';
      },
  }];
  var name = 'Poll';
  var namePlural = 'Polls';
  var pollUrl = '/cms/api/v1/poll/';

  function parsePayload (payload) {
    var data = _.clone(payload);
    var filter = $filter('date_string_to_moment');
    data.end_date = filter(data.end_date);
    data.published = filter(data.published);
    return data;
  }

  function cleanPayload (payload) {
    var momentToDateString = $filter('moment_to_date_string');
    payload = _.clone(payload);

    if(_.isUndefined(payload.title) && _.isUndefined(payload.question_text)) {
      throw error('title and question text required');
    }

    if(payload.end_date) {
      if(!moment.isMoment(payload.end_date)) {
        throw error('end_date must be a moment object');
      }
      payload.end_date = momentToDateString(payload.end_date);
    }

    if (payload.published) {
      if(!moment.isMoment(payload.published)) {
        throw error('published must be a moment object');
      }
      payload.published = momentToDateString(payload.published);
    }

    return _.pick(payload, [
      'title',
      'question_text',
      'published',
      'end_date'
    ]);
  }

  function getPoll(pollId) {
    return $http.get(pollUrl + pollId + '/')
      .then(function (response) {
        return parsePayload(response.data);
      });
  }

  function getPolls(params) {
    var url = pollUrl + Utils.param(params);
    return $http.get(url)
      .then(function (response) {
        response.data.results = _.map(response.data.results, function (poll) {
          return parsePayload(poll);
        });
        return response.data;
      });
  }

  function postPoll(data) {
    var payload = cleanPayload(data);

    return $http.post(pollUrl, payload)
      .then(function(response) {
        return response.data;
      });
  }

  function updatePoll(data) {
    var payload = cleanPayload(data);

    return $http.put(pollUrl + data.id + '/', payload)
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
