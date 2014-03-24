'use strict';

describe('Controller: TargetingCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var TargetingCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TargetingCtrl = $controller('TargetingCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
