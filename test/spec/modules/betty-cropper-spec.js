'use strict';
describe('Selection Object', function () {

  // load the controller's module
  beforeEach(module('BettyCropper'));

  var Selection;

  beforeEach(inject(function ($controller, $injector) {
    Selection = $injector.get('Selection');
  }));

  it('should return proper dimensions', function () {
    var square = new Selection({
      x0: 0,
      x1: 512,
      y0: 0,
      y1: 512
    });
    expect(square.width()).toBe(512);
    expect(square.height()).toBe(512);

    var landscape = new Selection({
      x0: 0,
      x1: 512,
      y0: 195,
      y1: 316
    });
    expect(landscape.width()).toBe(512);
    expect(landscape.height()).toBe(121);
  });

  it('should return properly scaled versions of itself', function () {
    var square = new Selection({
      x0: 0,
      x1: 512,
      y0: 0,
      y1: 512
    });
    var scaled = square.scaleToFit(1024, 1024);
    expect(scaled.width()).toBe(1024);
    expect(scaled.height()).toBe(1024);

    var landscape = new Selection({
      x0: 0,
      x1: 512,
      y0: 195,
      y1: 316
    });
    scaled = landscape.scaleToFit(1024, 1024);
    expect(scaled.width()).toBe(1024);
    expect(scaled.height()).toBe(242);

    var portrait = new Selection({
      x0: 195,
      x1: 316,
      y0: 0,
      y1: 512
    });
    scaled = portrait.scaleToFit(1024, 1024);
    expect(scaled.width()).toBe(242);
    expect(scaled.height()).toBe(1024);
  });
});

describe('Image object', function () {
    // load the controller's module
  beforeEach(module('BettyCropper'));

  var BettyImage, $httpBackend, BettyCropper;
  beforeEach(inject(function ($controller, $injector) {
    BettyImage = $injector.get('BettyImage');
    BettyCropper = $injector.get('BettyCropper');
    $httpBackend = $injector.get('$httpBackend');
    
    $httpBackend.when('OPTIONS', /^http:\/\/localimages\.avclub\.com.*/).respond('');
    $httpBackend.when('GET', /^http:\/\/localimages\.avclub\.com\/api\/\d+/).respond(function (method, url, data, headers) {
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
  }));

  it('should load properly', function() {
    // console.log(BettyImage);

    var prom = BettyCropper.detail(9);
    $httpBackend.flush();
    prom.then(function(response){
      var image = response.data;
      expect(image.id).toBe(9);
    });

  });

  it('should generate a proper url', function () {
    var image = new BettyImage({
      'id': 9,
      'name': 'Lenna.jpg',
      'width': 512,
      'height': 512
    });

    expect(image.url('16x9', 200, 'jpg')).toBe('http://localimages.avclub.com/9/16x9/200.jpg');

    image.id = 12345;
    
    expect(image.url('16x9', 200, 'jpg')).toBe('http://localimages.avclub.com/1234/5/16x9/200.jpg');
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

});