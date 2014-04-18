'use strict';

describe('Controller: LoginmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var LoginmodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LoginmodalCtrl = $controller('LoginmodalCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
