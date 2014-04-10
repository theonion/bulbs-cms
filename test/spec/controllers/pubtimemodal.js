'use strict';

describe('Controller: PubtimemodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var PubtimemodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PubtimemodalCtrl = $controller('PubtimemodalCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
