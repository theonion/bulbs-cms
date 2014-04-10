'use strict';

describe('Controller: PubtimemodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));

  var PubtimemodalCtrl,
    scope,
    modal,
    modalService

  var articleWithNoFeatureType = {
    id: 1,
    feature_type: null,
    published: null,
    title: "No feature type"
  }

  var articleWithFeatureType = {
    id: 1,
    feature_type: "Feature Type",
    published: null,
    title: "Hi"
  }

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $modal, routes) {
    modal = $modal.open({
      templateUrl: routes.PARTIALS_URL + 'modals/choose-date-modal.html'
    })

    modal.dismiss = function () { return true; }
    modalService = $modal
    modalService.open = function () { return true; }

    scope = $rootScope.$new();
    PubtimemodalCtrl = $controller('PubtimemodalCtrl', {
      $scope: scope,
      $modal: modalService,
      $modalInstance: modal,
      article: articleWithNoFeatureType
    });

  }));

  it('should close itself and open validation modal when you try to publish with no feature type', function () {
    spyOn(modal, 'dismiss');
    spyOn(modalService, 'open');

    scope.setPubTime();

    expect(modal.dismiss).toHaveBeenCalled();
    expect(modalService.open).toHaveBeenCalled();
  });
});
