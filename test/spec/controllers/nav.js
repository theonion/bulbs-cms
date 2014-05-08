'use strict';

describe('Controller: NavCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var NavCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NavCtrl = $controller('NavCtrl', {
      $scope: scope,
      routes: {PARTIALS_URL: 'cool', NAV_LOGO: 'cool'}
    });
  }));

  it('should attach two values to scope', function () {
    expect(scope.PARTIALS_URL).toBe('cool');
    expect(scope.NAV_LOGO).toBe('cool');
  });

});
