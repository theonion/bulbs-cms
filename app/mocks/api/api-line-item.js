'use strict';

angular.module('bulbsCmsApp.mockApi.lineItem', [
  'bulbsCmsApp.mockApi.data'
])
  .run(['_', '$httpBackend', 'mockApiData',
  function (_, $httpBackend, mockApiData) {

    var reLineItem = {
      list: /^\/cms\/api\/v1\/line-items\/(\?.*)?$/,
      edit: /^\/cms\/api\/v1\/line-items\/(\d+)\/$/,
    };
    mockApiData.lineItems = [{
      id:1,
      contributor: 'Alasdair Wilkins',
      amount: 25,
      note: 'A Note for the ages',
      date: '2015-05-01T16:20:00Z'
    },
    {
      id:2,
      contributor: 'Brandon Nowalk',
      amount: 100,
      note: 'Simpson Week 2015 Illustration',
      date: '2015-05-01T16:20:00Z'
    },
    {
      id:3,
      contributor: 'Cameron Esposito',
      amount: 120,
      note: 'Something Else',
      date: '2015-05-01T16:20:00Z'
    },
    {
      id:4,
      contributor: 'Carline Framke',
      amount: 25,
      note: 'Something Else',
      date: '2015-05-01T16:20:00Z'
    },
    {
      id:5,
      contributor: 'Jason Heller',
      amount: 35,
      note: 'Something Else',
      date: '2015-05-01T16:20:00Z'
    }];
    $httpBackend.whenGET(reLineItem.list).respond(function (method, url, data) {
      return [200, {
        count: mockApiData.lineItems.length,
        results: mockApiData.lineItems
      }];
    });
    $httpBackend.whenGET(reLineItem.edit).respond(function (method, url){
      var matches = url.match(reLineItem.edit);
      var lineItem = _.find(mockApiData.lineItems, {id: Number(matches[1])});

      if (_is.Undefined(lineItem)) {
        return [404, null];
      }

      return [200, lineItem];
    });
  }])