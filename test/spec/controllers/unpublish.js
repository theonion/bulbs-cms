'use strict';

describe('Controller: UnpublishCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var UnpublishCtrl,
    scope,
    httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
    scope = $rootScope.$new();
    httpBackend = $httpBackend;
    UnpublishCtrl = $controller('UnpublishCtrl', {
      $scope: scope
    });
  }));
  
  afterEach (function () {
    httpBackend.verifyNoOutstandingExpectation ();
    httpBackend.verifyNoOutstandingRequest ();
  });

  it('should have a function unpublish that unpublishes the article', function () {
    scope.article = {id: 1};
    httpBackend.expectPOST('/cms/api/v1/content/1/publish/').respond([200, {id: 1}]);
    scope.unpublish();
    httpBackend.flush()
  });

});
