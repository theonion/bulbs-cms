'use strict';

angular.module('bulbsCmsApp.mockApi.lineItem', [
  'bulbsCmsApp.mockApi.data'
])
  .run(['_', '$httpBackend', 'mockApiData',
  function (_, $httpBackend, mockApiData) {

    var reLineItem = {
      list: /^\/cms\/api\/v1\/contributions\/line-items\/(\?.*)?$/,
      edit: /^\/cms\/api\/v1\/contributions\/line-items\/(\d+)\/$/,
    };
    mockApiData.lineItems = [{
      id:1,
      contributor: {
        id: 1,
        first_name: 'Alasdair',
        last_name: 'Wilkins',
        full_name: 'Alasdair Wilkins',
      },
      amount: 25,
      note: 'A Note for the ages',
      payment_date: moment('2015-7-12').format(),
    },
    {
      id:2,
      contributor: {
        id: 2,
        first_name: 'Brandon',
        last_name: 'Nowalk',
        full_name: 'Brandon Nowalk'
      },
      amount: 100,
      note: 'Simpson Week 2015 Illustration',
      payment_date: moment('2015-7-13').format(),
    },
    {
      id:3,
      contributor: {
        id: 3,
        first_name: 'Cameron',
        last_name: 'Esposito',
        full_name: 'Cameron Esposito'
      },
      amount: 120,
      note: 'Something Else',
      payment_date: moment('2015-7-15').format(),
    },
    {
      id:4,
      contributor: {
        id: 4,
        first_name: 'Carline',
        last_name: 'Framke',
        full_name: 'Carline Framke'
      },
      amount: 25,
      note: 'Something Else',
      payment_date: moment('2015-7-15').format(),
    },
    {
      id:5,
      contributor: {
        id: 5,
        first_name: 'Jason',
        last_name: 'Heller',
        full_name: 'Jason Heller'
      },
      amount: 35,
      note: 'Something Else',
      payment_date: moment('2015-7-15').format(),
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

      if (_.isUndefined(lineItem)) {
        return [404, null];
      }

      return [200, lineItem];
    });
  }])