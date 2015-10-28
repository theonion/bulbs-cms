'use strict';

angular.module('BettyCropper.mockApi', [
  'cms.config'
])
.config(function (CmsConfigProvider) {
  CmsConfigProvider.setImageServerRoot('//localimages.avclub.com');
})
.run(function ($httpBackend) {
  $httpBackend.when('OPTIONS', /^\/\/localimages\.avclub\.com.*/).respond('');
  $httpBackend.when('GET', /^\/\/localimages\.avclub\.com\/api\/\d+/).respond(function (method, url, data, headers) {
    var id = url.substring(url.lastIndexOf('/') + 1, url.length);
    return [200, {
      'id': parseInt(id, 10),
      'name': 'Lenna.png',
      'width': 512,
      'height': 512,
      'selections': {
        '1x1': {'y1': 512, 'y0': 0, 'x0': 0, 'x1': 512, 'source': 'auto'},
        '16x9': {'y1': 400, 'y0': 112, 'x0': 0, 'x1': 512, 'source': 'auto'}
      }
    }, {}];
  });
  $httpBackend.when('POST', /^\/\/localimages\.avclub\.com\/api\/new/).respond(function (method, url, data, headers) {
    var imageData = {
      'id': 12345,
      'name': 'Lenna.png',
      'width': 512,
      'height': 512,
      'selections': {
        '1x1': {'y1': 512, 'y0': 0, 'x0': 0, 'x1': 512, 'source': 'auto'},
        '16x9': {'y1': 400, 'y0': 112, 'x0': 0, 'x1': 512, 'source': 'auto'}
      }
    };
    return [200, imageData, {}];
  });
  $httpBackend.when('POST', /^\/\/localimages\.avclub\.com\/api\/\d+\/.*$/).respond(function (method, url, data, headers) {
    var splitUrl = url.split('/');
    var ratio = splitUrl[splitUrl.length];
    var id = splitUrl[splitUrl.length - 1];
    var imageData = {
      'id': parseInt(id, 10),
      'name': 'Lenna.png',
      'width': 512,
      'height': 512,
      'selections': {
        '1x1': {'y1': 512, 'y0': 0, 'x0': 0, 'x1': 512, 'source': 'auto'},
        '16x9': {'y1': 400, 'y0': 112, 'x0': 0, 'x1': 512, 'source': 'auto'}
      }
    };
    imageData.selections[ratio] = data;
    return [200, imageData, {}];
  });
});
