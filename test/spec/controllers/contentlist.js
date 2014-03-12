'use strict';

describe('Controller: ContentlistCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var ContentlistCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ContentlistCtrl = $controller('ContentlistCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
