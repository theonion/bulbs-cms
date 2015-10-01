'use strict';

angular.module('bulbsCmsApp.mockApi.role', [
  'bulbsCmsApp.mockApi.data'
])
  .run(['_', '$httpBackend', 'mockApiData',
  function (_, $httpBackend, mockApiData) {

    var reRole = {
      list: /^\/cms\/api\/v1\/contributions\/role\/(\?.*)?$/,
      edit: /^\/cms\/api\/v1\/contributions\/role\/(\d+)\/$/
    };
    mockApiData.roles = [{
      id: 1,
      name: 'Author',
      payment_type: 'Flat Rate',
      rates: {
        flat_rate: {
          updated_on: '2015-07-13T20:14:48.573940Z',
          rate: 100
        },
        hourly: {
          updated_on: '2015-07-14T20:14:48.573940Z',
          rate: 60
        },
        feature_type: [
          {
            feature_type: '100 Episodes',
            updated_on: '2015-08-14T20:14:48.473940Z',
            rate: 100
          }, {
            feature_type: '11 Question',
            rate: 11
          }, {
            feature_type: '13 Days of Christmas',
            updated_on: '2015-08-14T20:14:48.473940Z',
            rate: 13
          }, {
            feature_type: '15 Minutes or Less',
            updated_on: '2015-08-14T20:14:48.473940Z',
            rate: 15
          }, {
            feature_type: '24 Hours Of',
            updated_on: '2015-08-14T20:14:48.473940Z',
            rate: 5
        }]
      }
    }, {
      id: 2,
      name: 'Editor',
      payment_type: 'Manual',
      rates: {
        flat_rate: {name: 'Flat Rate'},
        hourly: {name: 'Hourly'}
      }
    }, {
      id: 3,
      name: 'Programmer',
      payment_type: 'FeatureType',
      rates: {
        flat_Rate: {
          id: 3,
          name: 'Flat Rate',
          updated_on: '2015-07-15T20:14:48.573940Z',
          rate: 50
        },
        hourly: {
          id: 4,
          name: 'Hourly',
          updated_on: '2015-07-16T20:14:48.573940Z'
        }
      }
    }];
    $httpBackend.whenGET(reRole.list).respond(function (method, url, data) {
      return [200, {
        count: mockApiData.roles.length,
        results: mockApiData.roles
      }];
    });
    $httpBackend.whenGET(reRole.edit).respond(function (method, url) {
      var matches = url.match(reRole.edit);
      var role = _.find(mockApiData.roles, {id: Number(matches[1])});

      if (_.isUndefined(role)) {
        return [404, null];
      }

      return [200, role]
    });

    $httpBackend.whenPOST(reRole.list).respond(function (method, url, data) {
      var m = _.merge(mockApiData.roles[0], JSON.parse(data));

      m.id = _.last(mockApiData.roles).id + 1;
      mockApiData.campaigns.push(m);
    });

    $httpBackend.whenPUT(reRole.edit).respond(function (method, url, data) {
      var matches = url.match(reRole.edit);
      var roleIndex = _.findIndex(mockApiData.campaigns, {id: Number(matches[1])});

      if (roleIndex < 0) {
        return [404, null];
      }

      mockApiData.roles[roleIndex] = JSON.parse(data);

      return [200, data];
    });

    $httpBackend.whenDELETE(reRole.edit).respond(function (method, url) {

      var matches = url.match(reRole.edit);
      var role = _.find(mockApiData.roles, {id: Number(matches[1])});

      mockApiData.roles = _.pull(mockApiData.roles, role);

      return [204];
    });
  }]);