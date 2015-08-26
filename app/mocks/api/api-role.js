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
      paymentType: 'Flat Rate',
      rates: {
        'Flat Rate': {
          id: 1,
          name: 'Flat Rate',
          updated_on: '2015-07-13T20:14:48.573940Z',
          rate: 100
        },
        'Hourly': {
          id: 2,
          name: 'Hourly',
          updated_on: '2015-07-14T20:14:48.573940Z',
          rate: 60
        },
        'FeatureType': {
          id: 3,
          name: 'FeatureType',
          updated_on: '2015-08-14T20:14:48.473940Z',
          rates: [{
            feature_type: '100 Episodes',
            rate: '$100'
          }, {
            feature_type: '11 Question',
            slug: '11-questions',
            rate: '$11'
          }, {
            feature_type: '13 Days of Christmas',
            rate: '$13'
          }, {
            feature_type: '15 Minutes or Less',
            rate: '$15'
          }, {
            feature_type: '24 Hours Of',
            rate: '$5'
          }]
        }
      }
    }, {
      id: 2,
      name: 'Editor',
      paymentType: 'FeatureType',
      rates: {
        'Flat Rate': {name: 'Flat Rate'},
        'Hourly': {name: 'Hourly'}
      }
    }, {
      id: 3,
      name: 'Programmer',
      paymentType: 'Hourly',
      rates: {
        'Flat Rate': {
          id: 3,
          name: 'Flat Rate',
          updated_on: '2015-07-15T20:14:48.573940Z',
          rate: 50
        },
        'Hourly': {
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