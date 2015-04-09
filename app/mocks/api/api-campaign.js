'use strict';

angular.module('bulbsCmsApp.mockApi.campaign', [
  'bulbsCmsApp.mockApi.data'
])
  .run(['_', '$httpBackend', 'mockApiData',
  function (_, $httpBackend, mockApiData) {

    // campaigns
    var reCampaign = {
      list: /^\/cms\/api\/v1\/campaign\/(\?.*)?$/,
      edit: /^\/cms\/api\/v1\/campaign\/(\d+)\/$/
    };
    mockApiData.campaigns = [{
        id: 1,
        sponsor_name: 'Honda',
        sponsor_logo: {
          id: 1
        },
        sponsor_url: 'http://example.com',
        start_date: moment('2015-7-12').format(),
        end_date: moment('2015-7-13').format(),
        campaign_label: 'O-183734',
        impression_goal: 100,
        pixels: [{id: 11,
            url: 'http://example.com/pixel',
            pixel_type: 'Logo'
        }],
      }, {
        id: 2,
        sponsor_name: 'Parents Magazine',
        sponsor_logo: {
          id: 2
        },
        sponsor_url: 'http://example.com/2',
        start_date: moment().add(7, 'days').format(),
        end_date: moment().add(14, 'days').format(),
        campaign_label: 'O-183735',
        impression_goal: 1000,
        pixels: [
          {id: 12,
            url: 'http://example.com/pixel/2',
            pixel_type: 'Logo'
          },
          {id: 13,
            url: 'http://example.com/pixel/3',
            pixel_type: 'Logo'
          }
        ],
      }, {
        id: 3,
        sponsor_name: 'Sponsor Name',
        sponsor_logo: {
          id: 3
        },
        sponsor_url: 'http://example.com/somewhere/else',
        start_date: '',
        end_date: '',
        campaign_label: 'O-999999',
        impression_goal: 2000,
        pixels: [],
    }];
    $httpBackend.whenGET(reCampaign.list).respond(function (method, url, data) {
      return [200, {
        count: mockApiData.campaigns.length,
        results: mockApiData.campaigns
      }];
    });
    $httpBackend.whenGET(reCampaign.edit).respond(function (method, url) {
      // return the operation matching given id
      var matches = url.match(reCampaign.edit);
      var campaign = _.find(mockApiData.campaigns, {id: Number(matches[1])});

      if (_.isUndefined(campaign)) {
        return [404, null];
      }

      return [200, campaign];
    });
    $httpBackend.whenPOST(reCampaign.list).respond(function (method, url, data) {
      // add campaign, using first mock model to fill in missing fields
      var m = _.merge(mockApiData.campaigns[0], JSON.parse(data));
      // simulate new ID
      m.id = _.last(mockApiData.campaigns).id + 1;
      mockApiData.campaigns.push(m);

      // return new data
      return [200, m];
    });
    $httpBackend.whenPUT(reCampaign.edit).respond(function (method, url, data) {
      // return the operation matching given id
      var matches = url.match(reCampaign.edit);
      var campaignIndex = _.findIndex(mockApiData.campaigns, {id: Number(matches[1])});

      if (campaignIndex < 0) {
        return [404, null];
      }

      // modify campaign
      mockApiData.campaigns[campaignIndex] = JSON.parse(data);

      // return new data
      return [200, data];
    });
    $httpBackend.whenDELETE(reCampaign.edit).respond(function (method, url) {
      // return the operation matching given id
      var matches = url.match(reCampaign.edit);
      var campaign = _.find(mockApiData.campaigns, {id: Number(matches[1])});

      // remove campaign from list
      mockApiData.campaigns = _.pull(mockApiData.campaigns, campaign);

      // return delete response
      return [204];
    });
  }]);
