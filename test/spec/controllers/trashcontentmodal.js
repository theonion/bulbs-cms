'use strict';

describe('Controller: TrashcontentmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var TrashcontentmodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TrashcontentmodalCtrl = $controller('TrashcontentmodalCtrl', {
      $scope: scope
    });
  }));

});
