'use strict';

describe('Controller: LastmodifiedguardmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var LastmodifiedguardmodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LastmodifiedguardmodalCtrl = $controller('LastmodifiedguardmodalCtrl', {
      $scope: scope
    });
  }));

});
