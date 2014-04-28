'use strict';

describe('Controller: ContenteditCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));

  var ContenteditCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, mockApiData) {
    scope = $rootScope.$new();
    ContenteditCtrl = $controller('ContenteditCtrl', {
      $scope: scope,
      content: mockApiData['content.list'].results[0]
    });
  }));

  /*it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });*/
  it('should have string CONTENT_PARTIALS_URL in scope', function () {
    expect(typeof scope.CONTENT_PARTIALS_URL).toBe('string');
  });

  it('should have string MEDIA_ITEM_PARTIALS_URL in scope', function () {
    expect(typeof scope.MEDIA_ITEM_PARTIALS_URL).toBe('string');
  });

  it('should have string CACHEBUSTER in scope', function () {
    expect(typeof scope.CACHEBUSTER).toBe('string');
  });

  it('should have a saveArticle function in scope', function () {
    expect(scope.saveArticle).toBeDefined();
  });

});
