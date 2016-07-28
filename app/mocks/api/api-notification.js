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
      internal_title: 'Notification 1',
      is_published: true,
      created_on: moment('2016-07-29T12:13:14').format()
    },{
      id: 2,
      internal_title: 'Notification 2',
      is_published: false,
      created_on: moment('2014-03-04T00:00:00').format()
    },{
      id: 3,
      internal_title: 'Rio Coverage A',
      is_published: true,
      created_on: moment('2016-06-23T06:00:00').format()
    },{
      id: 4,
      internal_title: 'Rio Coverage B',
      is_published: true,
      created_on: moment('2016-06-23T06:00:00').format()
    },{
      id: 5,
      internal_title: 'Rio Coverage C',
      is_published: true,
      created_on: moment('2016-06-23T06:00:00').format()
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
