'use strict';

describe('Controller: SponsormodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var SponsormodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SponsormodalCtrl = $controller('SponsormodalCtrl', {
      $scope: scope
    });
  }));

});
