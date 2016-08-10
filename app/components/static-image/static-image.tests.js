'use strict';

describe('Directive: staticImage', function () {

  var $parentScope;
  var digest;
  var imageApiUrl = 'http://i.example.com'
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'bulbs.cms.staticImage',
      function (CmsConfigProvider) {
        CmsConfigProvider.setImageApiUrl(imageApiUrl);
      }
    );
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();
      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should render an image if url is available', function () {
    $parentScope.imageData = { id: 1 };

    var element = digest('<static-image image="imageData"></static-image>');

    expect(element.find('img').length).to.equal(1);
  });

  it('should not render an image if no image passed in', function () {

    var element = digest('<static-image image="imageData"></static-image>');

    expect(element.find('img').length).to.equal(0);
    expect(element.html()).to.have.string('No image selected.');
  });

  it('should default ratio to 16x9 and 1200px width', function () {
    var id = 1;
    $parentScope.imageData = { id: id };

    var element = digest('<static-image image="imageData"></static-image>');

    var img = element.find('img');
    expect(img.attr('src')).to.equal(imageApiUrl + '/' + id + '/16x9/1200.jpg');
  });

  it('should allow ratio to be input', function () {
    var id = 1;
    var ratio = '1000x10';
    $parentScope.imageData = { id: id };
    $parentScope.ratio = ratio

    var element = digest('<static-image image="imageData" ratio="{{ ratio }}"></static-image>');

    var img = element.find('img');
    expect(img.attr('src')).to.equal(imageApiUrl + '/' + id + '/' + ratio + '/1200.jpg');
  });

  it('should watch for changes to image', function () {
    var newId = 2;
    $parentScope.imageData = null;

    var element = digest('<static-image image="imageData"></static-image>');
    $parentScope.imageData = { id: 2 };
    $parentScope.$digest();

    var img = element.find('img');
    expect(img.attr('src')).to.equal(imageApiUrl + '/' + newId + '/16x9/1200.jpg');
  });
});
