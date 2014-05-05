'use strict';

describe('Controller: ChangelogmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));
  beforeEach(module('jsTemplates'));

  var ChangelogmodalCtrl,
    scope,
    httpBackend,
    modal,
    modalService,
    mockChangelog;

  var article = {id: 1};

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, $modal, routes, mockApiData) {
    httpBackend = $httpBackend;

    mockChangelog = mockApiData['changelog'];

    var modalUrl = routes.PARTIALS_URL + 'modals/changelog-modal.html';
    modal = $modal.open({
      templateUrl: modalUrl
    })

    modal.dismiss = function () { return true; }
    modalService = $modal
    modalService.open = function () { return true; }
    httpBackend = $httpBackend;

    scope = $rootScope.$new();
    ChangelogmodalCtrl = $controller('ChangelogmodalCtrl', {
      $scope: scope,
      $modal: modalService,
      $modalInstance: modal,
      article: article
    });
  }));

  it('should attach a list of changelog entries to scope', function () {
    httpBackend.expectGET('/cms/api/v1/log/?content=1').respond(mockChangelog);
    httpBackend.flush();
    expect(scope.changelog.length).toBeGreaterThan(0);
  });
});
