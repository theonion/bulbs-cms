'use strict';

angular.module('bulbsCmsApp.mockApi.customSearch', [
  'bulbsCmsApp.mockApi.data'
])
  .run(['$httpBackend', 'mockApiData',
  function ($httpBackend, mockApiData) {
    // custom search content endpoint
    $httpBackend.whenPOST(/\/cms\/api\/v1\/custom-search-content\/(\?page=\d+)?$/).respond(function () {
      return [200, {
        count: Math.floor(Math.random() * 1000),
        results: mockApiData['content.list'].results
      }];
    });

    // total result count endpoint
    $httpBackend.whenPOST('/cms/api/v1/custom-search-content/count/').respond(function () {
      return [200, {count: Math.floor(Math.random() * 1000)}];
    });

    // custom search query count
    $httpBackend.whenPOST('/cms/api/v1/custom-search-content/group_count/').respond(function () {
      return [200, {count: Math.floor(Math.random() * 1000)}];
    });
  }]);
