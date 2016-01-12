'use strict';

angular.module('bulbsCmsApp.mockApi.specialCoverage', [
  'bulbsCmsApp.mockApi.campaign',
  'bulbsCmsApp.mockApi.data',
  'lodash',
  'utils'
])
  .run(['_', '$httpBackend', 'mockApiData', 'Utils',
  function (_, $httpBackend, mockApiData, Utils) {

    var slugify = Utils.slugify;

    // special coverage
    var reSpecialCoverage = {
      list: /^\/cms\/api\/v1\/special-coverage\/(\?.*)?$/,
      edit: /^\/cms\/api\/v1\/special-coverage\/(\d+)\/$/
    };
    mockApiData.special_coverages = [{
      id: 1,
      campaign: mockApiData.campaigns[2].id,
      name: 'Joe Biden',
      slug: 'joe-biden',
      description: 'Joe Biden things.',
      start_date: '2016-01-13T22:51:27.814000Z',
      end_date: '2016-01-14T22:51:27.814000Z',
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
      },
      active: true,
      promoted: true,
      videos: []
    }, {
      id: 2,
      name: 'Fun',
      slug: 'fun',
      description: 'Things your favorite company thinks are fun.',
      start_date: '2016-01-13T22:51:27.814000Z',
      end_date: '2016-01-13T22:51:27.814000Z',
      query: {},
      videos: [],
      active: false,
      promoted: false
    }, {
      id: 3,
      campaign: mockApiData.campaigns[1].id,
      name: 'Luxury Stuff',
      slug: 'luxury-stuff',
      description: 'Luxury, by the rich, for the rich.',
      start_date: '2016-01-13T22:51:27.814000Z',
      end_date: '2016-01-13T22:51:27.814000Z',
      query: {},
      videos: [],
      active: false,
      promoted: false
    }, {
      id: 4,
      campaign: mockApiData.campaigns[0].id,
      name: 'Videos Videos Videos',
      slug: 'something-video-video',
      description: 'Lots of videos to watch.',
      start_date: '2016-01-13T22:51:27.814000Z',
      end_date: '2016-01-13T22:51:27.814000Z',
      query: {},
      videos: [1, 2, 3],
      active: false,
      promoted: false
    }, {
      id: 5,
      campaign: mockApiData.campaigns[0].id,
      name: 'No Slug',
      description: 'No slug on this special coverage.',
      query: {},
      start_date: '2016-01-13T22:51:27.814000Z',
      end_date: '2016-01-13T22:51:27.814000Z',
      active: false,
      promoted: false
    }];

    $httpBackend.whenGET(reSpecialCoverage.list).respond(function () {
      return [200, {
        count: mockApiData.special_coverages.length,
        next: '/cms/api/v1/content/?page=2',
        previous: null,
        results: mockApiData.special_coverages
      }];
    });
    $httpBackend.whenGET(reSpecialCoverage.edit).respond(function (method, url) {
      // return the operation matching given id
      var matches = url.match(reSpecialCoverage.edit);
      var specialCoverage = _.find(mockApiData.special_coverages, {id: Number(matches[1])});

      if (_.isUndefined(specialCoverage)) {
        return [404, null];
      }

      return [200, specialCoverage];
    });
    $httpBackend.whenPOST(reSpecialCoverage.list).respond(function (method, url, data) {
      var lastSpecialCoverage = _.last(mockApiData.special_coverages);
      var newSpecialCoverage = _.merge(lastSpecialCoverage, JSON.parse(data));
      newSpecialCoverage.id++;

      _.defaults(newSpecialCoverage, {
        slug: slugify(newSpecialCoverage.name)
      });

      mockApiData.special_coverages.push(newSpecialCoverage);
      return [201, newSpecialCoverage];
    });
    $httpBackend.whenPUT(reSpecialCoverage.edit).respond(function (method, url, data) {
      // return the operation matching given id
      var matches = url.match(reSpecialCoverage.edit);
      var specialCoverageIndex = _.findIndex(mockApiData.special_coverages, {id: Number(matches[1])});

      if (specialCoverageIndex < 0) {
        return [404, null];
      }

      var parsedData = JSON.parse(data);

      _.defaults(parsedData, {
        slug: slugify(parsedData.name)
      });

      // modify special coverage
      mockApiData.special_coverages[specialCoverageIndex] = parsedData;

      // return new data
      return [200, parsedData];
    });
    $httpBackend.whenDELETE(reSpecialCoverage.edit).respond(function (method, url) {
      // return the operation matching given id
      var matches = url.match(reSpecialCoverage.edit);
      var specialCoverage = _.find(mockApiData.special_coverages, {id: Number(matches[1])});

      // remove special coverage from list
      mockApiData.special_coverages = _.pull(mockApiData.special_coverages, specialCoverage);

      // return delete response
      return [204];
    });

  }]);
