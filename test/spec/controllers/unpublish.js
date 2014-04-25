'use strict';

describe('Controller: UnpublishCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var UnpublishCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UnpublishCtrl = $controller('UnpublishCtrl', {
      $scope: scope
    });
  }));

});
