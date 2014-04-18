'use strict';

describe('Controller: UnpublishCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var UnpublishCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UnpublishCtrl = $controller('UnpublishCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
