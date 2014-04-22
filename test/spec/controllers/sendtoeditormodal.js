'use strict';

describe('Controller: SendtoeditormodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var SendtoeditormodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SendtoeditormodalCtrl = $controller('SendtoeditormodalCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
