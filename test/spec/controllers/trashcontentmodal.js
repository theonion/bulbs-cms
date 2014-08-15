'use strict';

describe('Controller: TrashcontentmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var TrashcontentmodalCtrl,
    scope,
    httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
    scope = $rootScope.$new();
    httpBackend = $httpBackend
    TrashcontentmodalCtrl = $controller('TrashcontentmodalCtrl', {
      $scope: scope,
      articleId: 1,
      $modalInstance: {}
    });
  }));
  
  afterEach (function () {
    httpBackend.verifyNoOutstandingExpectation ();
    httpBackend.verifyNoOutstandingRequest ();
  });
  
  it('should have a function trashContent that sends the trash request', function () {
    httpBackend.expectPOST('/cms/api/v1/content/1/trash/').respond([200, {id: 1}]);
    scope.trashContent();
    httpBackend.flush();
  });

});
