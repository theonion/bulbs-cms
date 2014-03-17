'use strict';

describe('Controller: ContenteditCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var ContenteditCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ContenteditCtrl = $controller('ContenteditCtrl', {
      $scope: scope
    });
  }));

  /*it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });*/
});
