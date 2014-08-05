'use strict';
describe('Testing bettyeditable directive', function() {

  var scope,
      elem,
      compiled,
      html,
      $httpBackend,
      BettyImage;

  beforeEach(function () {
    module('bulbsCmsApp');
    module('jsTemplates');
    module('BettyCropper.mockApi');

    html = '<div style="width: 400px; height: 900px;""><bettyeditable image="image" ratio="16x9" /></div>';

    inject(function($injector, $compile, $rootScope){
      $httpBackend = $injector.get('$httpBackend');
      BettyImage = $injector.get('BettyImage');

      scope = $rootScope.$new();
      scope.image = {
        id: 60,
        caption: null,
        alt: null
      };

      elem = angular.element(html);
      compiled = $compile(elem)(scope);
      scope.$digest();
      $httpBackend.flush();
    });
  });

  it('should properly load the image data', function () {
    var imageContainer = elem.find('.image-edit-container');
    expect(imageContainer[0].style['background-image']).toBe('url(http://localimages.avclub.com/60/original/1200.jpg)');
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});