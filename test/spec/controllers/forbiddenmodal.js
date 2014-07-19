'use strict';

describe('Controller: ForbiddenmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var ForbiddenmodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ForbiddenmodalCtrl = $controller('ForbiddenmodalCtrl', {
      $scope: scope
    });
  }));

});
