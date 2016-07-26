'use strict';

angular.module('bulbsCmsApp.mockApi.notification', [
  'bulbsCmsApp.mockApi.data',
  'lodash',
  'bulbs.cms.utils'
])
  .run(['_', '$httpBackend', 'mockApiData', 'Utils',
  function (_, $httpBackend, mockApiData, Utils) {

    var slugify = Utils.slugify;

    var reNotifications = {
      list: /^\/cms\/api\/v1\/notification\/(\?.*)?$/,
      edit: /^\/cms\/api\/v1\/notification\/(\d+)\/$/
    };
    mockApiData.notification = [{
      id: 1,
      name: 'Afterbirth',
      slug: 'afterbirth',
      description: 'After the birth.',
      embed_code: '<iframe></iframe>',
      notification_logo: {
        id: 1
      },
      twitter_handle: '@TheOnion',
      promoted: false,
      query: {
        groups: [{
          conditions: [{
            field: 'content-type',
            type: 'all',
            values: [{
              name: 'for display',
              value: 'actually-use-this-value-123'
            }]
          }],
          time: 'Past day'
        }],
        included_ids: [1],
        excluded_ids: [2],
        pinned_ids: [3]
      }
    }, {
      id: 2,
      name: 'Politics',
      slug: 'politics',
      description: 'All the political stuff you need.',
      embed_code: '<iframe></iframe>',
      notification_logo: {
        id: 2
      },
      twitter_handle: '@TheOnion',
      promoted: false,
      query: {}
    }, {
      id: 3,
      name: 'Business',
      description: 'For business people.',
      embed_code: '<iframe></iframe>',
      notification_logo: {
        id: 1
      },
      twitter_handle: '@TheOnion',
      promoted: false,
      query: {}
    }, {
      id: 4,
      name: 'No Slug',
      description: 'No slugs here.',
      query: {}
    }];

    $httpBackend.whenGET(reNotifications.list).respond(function () {
      return [200, {
        count: mockApiData.notification.length,
        results: mockApiData.notification
      }];
    });
    $httpBackend.whenGET(reNotifications.edit).respond(function (method, url) {
      var matches = url.match(reNotifications.edit);
      var notification = _.find(mockApiData.notification, {id: Number(matches[1])});

      if (_.isUndefined(notification)) {
        return [404, null];
      }

      return [200, notification];
    });
    $httpBackend.whenPOST(reNotifications.list).respond(function (method, url, data) {
      var lastOne = _.last(mockApiData.notification);
      var newOne = _.merge(lastOne, JSON.parse(data));
      newOne.id++;

      _.defaults(newOne, {
        slug: slugify(newOne.name)
      });

      mockApiData.notification.push(newOne);
      return [201, newOne];
    });
    $httpBackend.whenPUT(reNotifications.edit).respond(function (method, url, data) {
      var matches = url.match(reNotifications.edit);
      var index = _.findIndex(mockApiData.notification, {id: Number(matches[1])});

      if (index < 0) {
        return [404, null];
      }

      var parsedData = JSON.parse(data);

      _.defaults(parsedData, {
        slug: slugify(parsedData.name)
      });

      mockApiData.notification[index] = parsedData;

      // return new data
      return [200, parsedData];
    });
    $httpBackend.whenDELETE(reNotifications.edit).respond(function (method, url) {
      var matches = url.match(reNotifications.edit);
      var notification = _.find(mockApiData.notification, {id: Number(matches[1])});

      mockApiData.notification = _.pull(mockApiData.notification, notification);

      // return delete response
      return [204];
    });
  }]);
