'use strict';

describe('Controller: SendtoeditormodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var SendtoeditormodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SendtoeditormodalCtrl = $controller('SendtoeditormodalCtrl', {
      $scope: scope
    });
  }));

});
