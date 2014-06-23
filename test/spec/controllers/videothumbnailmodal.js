'use strict';

describe('Controller: VideothumbnailmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var VideothumbnailmodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VideothumbnailmodalCtrl = $controller('VideothumbnailmodalCtrl', {
      $scope: scope
    });
  }));

});
