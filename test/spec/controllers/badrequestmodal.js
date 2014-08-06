'use strict';

describe('Controller: BadrequestmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var BadrequestmodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BadrequestmodalCtrl = $controller('BadrequestmodalCtrl', {
      $scope: scope
    });
  }));

});
