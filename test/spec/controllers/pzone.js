'use strict';

describe('Controller: PzoneCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var PzoneCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PzoneCtrl = $controller('PzoneCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
