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

  var BettyImage, $httpBackend, BettyCropper;
  beforeEach(function() {

    module('BettyCropper');
    module('BettyCropper.mockApi');
    module('ng');

    inject(function ($controller, $injector) {
      BettyImage = $injector.get('BettyImage');
      BettyCropper = $injector.get('BettyCropper');
      $httpBackend = $injector.get('$httpBackend');
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

  it('should generate proper styles', function () {
    var image = new BettyImage({
      'id': 518776,
      'name': 'Franco.jpg',
      'width': 1000,
      'height': 667,
      'selections': {
        '16x9': {'y1': 566, 'y0': 54, 'x0': 89, 'x1': 1000, 'source': 'user'},
        '3x1': {'y1': 398, 'y0': 63, 'x0': 87, 'x1': 1000, 'source': 'user'},
        '1x1': {'y1': 667, 'y0': 20, 'x0': 267, 'x1': 934, 'source': 'user'}
      },
      'credit': null
    });
    var styles = image.getStyles(400, 900, '16x9');

    expect(styles['background-size']).toBe('439px');
    expect(styles['background-position']).toBe('-39px -24px');
    expect(styles['height']).toBe('225px');
    expect(styles['width']).toBe('400px');
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

});

describe('BettyCropper service', function () {
  
  var BettyImage, $httpBackend, BettyCropper;
  beforeEach(function() {

    module('BettyCropper');
    module('BettyCropper.mockApi');

    inject(function ($controller, $injector) {
      BettyImage = $injector.get('BettyImage');
      BettyCropper = $injector.get('BettyCropper');
      $httpBackend = $injector.get('$httpBackend');
    });
  });

  it('should be able to get an existing image', function () {
    BettyCropper.get(9).then(function(response){
      var image = response.data;
      expect(image.id).toBe(9);
    });
    $httpBackend.flush();
  });

  it('should be able to get an upload a new image', function () {
    BettyCropper.upload().then(function(image){
      expect(image.id).toBe(12345);
      expect(image.name).toBe('Lenna.png');
    });

    var file = {
      name: 'Seanna.png',
      size: 500001,
      type: 'image/png'
    };

    var fileList = {
      0: file,
      length: 1,
      item: function (index) { return file; }
    };

    var input = $('#bulbs-cms-hidden-image-file-input').first();
    input.triggerHandler({
      type: 'change',
      target: {
        files: fileList
      }
    });
    $httpBackend.flush();
  });

});