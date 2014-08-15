'use strict';

describe('Controller: SponsormodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('jsTemplates'));

  var SponsormodalCtrl,
    scope,
    httpBackend,
    modal,
    modalService,
    sponsorList;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, $modal, routes) {
    httpBackend = $httpBackend;
    scope = $rootScope.$new();
    
    var modalUrl = routes.PARTIALS_URL + 'modals/sponsor-modal.html';
    modal = $modal.open({
      templateUrl: modalUrl
    });

    modal.dismiss = function () { return true; }
    modalService = $modal
    modalService.open = function () { return true; }
    
    sponsorList = [1,2,3,4,5];
    
    httpBackend.expectGET('/cms/api/v1/sponsor/').respond(sponsorList);
    
    SponsormodalCtrl = $controller('SponsormodalCtrl', {
      $scope: scope,
      $modal: modalService,
      $modalInstance: modal,
      article: {}
    });
    
    scope.$digest();
    httpBackend.flush();
  }));
  
  afterEach (function () {
    httpBackend.verifyNoOutstandingExpectation ();
    httpBackend.verifyNoOutstandingRequest ();
  });
  
  it('should fetch sponsors', function () {
    expect(scope.sponsors.length).toBe(5);
  });
  
  it('should have a function selectSponsor that sets article.sponsor to sponsor id', function () {
    scope.selectSponsor({id: 1});
    expect(scope.article.sponsor).toBe(1);
  });
  
  it('should have a funciton clearSponsor that clears article.sponsor', function () {
    scope.clearSponsor();
    expect(scope.article.sponsor).toBe(null);
  });

});
