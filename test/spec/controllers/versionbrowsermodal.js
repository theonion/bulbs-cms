'use strict';

describe('Controller: VersionbrowsermodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var VersionbrowsermodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VersionbrowsermodalCtrl = $controller('VersionbrowsermodalCtrl', {
      $scope: scope
    });
  }));

});
