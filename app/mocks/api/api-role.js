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
      paymentType: 'Flat Rate'
    }, {
      id: 2,
      name: 'Editor',
      paymentType: 'FeatureType'
    }, {
      id: 3,
      name: 'Programmer',
      paymentType: 'Hourly'
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