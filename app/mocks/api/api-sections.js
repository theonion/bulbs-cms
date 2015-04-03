'use strict';

angular.module('bulbsCmsApp.mockApi.sections', [
  'bulbsCmsApp.mockApi.data',
  'lodash',
  'utils'
])
  .run(['_', '$httpBackend', 'mockApiData', 'Utils',
  function (_, $httpBackend, mockApiData, Utils) {

    var slugify = Utils.slugify;

    var reSections = {
      list: /^\/cms\/api\/v1\/section\/(\?.*)?$/,
      edit: /^\/cms\/api\/v1\/section\/(\d+)\/$/
    };
    mockApiData.sections = [{
      id: 1,
      name: 'Afterbirth',
      slug: 'afterbirth',
      description: 'After the birth.',
      embed_code: '<iframe></iframe>',
      section_logo: {
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
      section_logo: {
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
      section_logo: {
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

    $httpBackend.whenGET(reSections.list).respond(function () {
      return [200, {
        count: mockApiData.sections.length,
        results: mockApiData.sections
      }];
    });
    $httpBackend.whenGET(reSections.edit).respond(function (method, url) {
      var matches = url.match(reSections.edit);
      var section = _.find(mockApiData.sections, {id: Number(matches[1])});

      if (_.isUndefined(section)) {
        return [404, null];
      }

      return [200, section];
    });
    $httpBackend.whenPOST(reSections.list).respond(function (method, url, data) {
      var lastOne = _.last(mockApiData.sections);
      var newOne = _.merge(lastOne, JSON.parse(data));
      newOne.id++;

      _.defaults(newOne, {
        slug: slugify(newOne.name)
      });

      mockApiData.sections.push(newOne);
      return [201, newOne];
    });
    $httpBackend.whenPUT(reSections.edit).respond(function (method, url, data) {
      var matches = url.match(reSections.edit);
      var index = _.findIndex(mockApiData.sections, {id: Number(matches[1])});

      if (index < 0) {
        return [404, null];
      }

      var parsedData = JSON.parse(data);

      _.defaults(parsedData, {
        slug: slugify(parsedData.name)
      });

      mockApiData.sections[index] = parsedData;

      // return new data
      return [200, parsedData];
    });
    $httpBackend.whenDELETE(reSections.edit).respond(function (method, url) {
      var matches = url.match(reSections.edit);
      var section = _.find(mockApiData.sections, {id: Number(matches[1])});

      mockApiData.sections = _.pull(mockApiData.sections, section);

      // return delete response
      return [204];
    });
  }]);
