'use strict';

describe('Controller: ContentworkflowCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var ContentworkflowCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ContentworkflowCtrl = $controller('ContentworkflowCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
