'use strict';

angular.module('bulbsCmsApp.mockApi.override', [
  'bulbsCmsApp.mockApi.data'
])
  .run(['_', '$httpBackend', 'mockApiData',
  function (_, $httpBackend, mockApiData) {

    var reOverride = {
      edit: /^\/cms\/api\/v1\/contributions\/rate-overrides\/(\d+)\/$/
    };

    mockApiData.rateOverrides = [{
      id: 1,
      contributor: {
        id: 1,
        first_name: 'Big',
        last_name: 'Papa',
        full_name: 'Big Papa'
      },
      role: {
        id: 1,
        name: 'Author',
        payment_type: 'FeatureType'
      },
      feature_types: [
        {
          id: 1,
          rate: 15,
          override_rate: 20,
          feature_type: 'AV QA'
        }, {
          id: 2,
          rate: 25,
          override_rate: 50,
          feature_type: 'TV Club'
        }
      ]
    }];

    $httpBackend.whenGET(reOverride.edit).respond(function (method, url) {
      var matches = url.match(reOverride.edit);
      var override = _.find(mockApiData.rateOverrides, {id: Number(matches[1])});

      if (_.isUndefined(override)) {
        return [404, null];
      }

      return [200, override];
    });
  }]);
