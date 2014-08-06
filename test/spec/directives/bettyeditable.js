'use strict';
describe('Testing bettyeditable directive', function() {

  var scope,
      elem,
      compiled,
      html,
      $httpBackend,
      $compile,
      BettyImage;

  beforeEach(function () {
    module('bulbsCmsApp');
    module('jsTemplates');
    module('BettyCropper.mockApi');

    html = '<div style="width: 400px; height: 900px;""><bettyeditable image="image" ratio="16x9" /></div>';

    inject(function($injector, $rootScope){
      $compile = $injector.get('$compile');
      $httpBackend = $injector.get('$httpBackend');
      BettyImage = $injector.get('BettyImage');

      scope = $rootScope.$new();

    });
  });

  it('should properly load the image data', function () {

    scope.image = {
      id: 60,
      caption: null,
      alt: null
    };

    elem = angular.element(html);
    compiled = $compile(elem)(scope);
    scope.$digest();
    $httpBackend.flush();

    var imageContainer = elem.find('.image-edit-container');
    expect(imageContainer[0].style['background-image']).toBe('url(http://localimages.avclub.com/60/original/1200.jpg)');
  });

  it('should load without an image', function () {
    elem = angular.element(html);
    compiled = $compile(elem)(scope);
    scope.$digest();

    var imageContainer = elem.find('.image-edit-container');
    expect(imageContainer[0].style['background-image']).toBe('');
  });

  it('should update on upload', function () {
    elem = angular.element(html);
    compiled = $compile(elem)(scope);
    scope.$digest();

    var uploadButton = elem.find('.betty-editable-add-image');
    uploadButton.trigger('click');

    var file = {name: 'Seanna.png', size: 500001, type: 'image/png'};

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

    var imageContainer = elem.find('.image-edit-container');
    expect(imageContainer[0].style['background-image']).toBe('url(http://localimages.avclub.com/1234/5/original/1200.jpg)');
  });


  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});