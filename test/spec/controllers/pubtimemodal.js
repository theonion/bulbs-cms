'use strict';

describe('Controller: PubtimemodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));
  beforeEach(module('jsTemplates'));

  var PubtimemodalCtrl,
    scope,
    modal,
    modalService,
    httpBackend;

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
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, $modal, routes) {
    httpBackend = $httpBackend;

    var modalUrl = routes.PARTIALS_URL + 'modals/choose-date-modal.html';
    modal = $modal.open({
      templateUrl: modalUrl
    })

    modal.dismiss = function () { return true; }
    modalService = $modal
    modalService.open = function () { return true; }

    scope = $rootScope.$new();
    PubtimemodalCtrl = $controller('PubtimemodalCtrl', {
      $scope: scope,
      $modal: modalService,
      $modalInstance: modal,
      article: articleWithFeatureType
    });

  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should have a setPubTime function', function () {
    expect(angular.isFunction(scope.setPubTime)).toBe(true);
  });

  it('should close itself and open validation modal when you try to publish with no feature type', function () {
    spyOn(modal, 'dismiss');
    spyOn(modalService, 'open');

    scope.setPubTime(articleWithNoFeatureType);

    expect(modal.dismiss).toHaveBeenCalled();
    expect(modalService.open).toHaveBeenCalled();
  });

  it('should make an http request in setPubTime', function () {
    httpBackend.expectPOST('/cms/api/v1/content/' + articleWithFeatureType.id + '/publish/').respond({status: "Published"});

    scope.dateTimePickerValue = "aha";
    scope.setPubTime(articleWithFeatureType);

    httpBackend.flush();
  });

});
