'use strict';

describe('Controller: PromotionCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var PromotionCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PromotionCtrl = $controller('PromotionCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
