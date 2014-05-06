'use strict';

describe('Controller: SendtoeditormodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));
  beforeEach(module('jsTemplates'));

  var SendtoeditormodalCtrl,
    scope,
    modal,
    modalService,
    httpBackend;

  var article = {
    id: 1,
    feature_type: "Feature Type",
    published: null,
    title: "Hi"
  }

  var sendUrl = '/cms/api/v1/content/1/send/';

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, $modal, routes) {
    scope = $rootScope.$new();
    httpBackend = $httpBackend;

    var modalUrl = routes.PARTIALS_URL + 'modals/send-to-editor-modal.html';
    modal = $modal.open({
      templateUrl: modalUrl
    });

    modal.close = function () { return true; };
    modalService = $modal;
    modalService.open = function () { return true; };

    scope.publishSuccessCbk = function () { return true; }

    SendtoeditormodalCtrl = $controller('SendtoeditormodalCtrl', {
      $scope: scope,
      $modal: modalService,
      $modalInstance: modal,
      article: article
    });
  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should send a request to the sendUrl and close the modal after sending', function () {
    spyOn(modal, 'close');
    httpBackend.expectPOST(sendUrl).respond({status: "Waiting for Editor"});

    scope.sendToEditor(article);

    httpBackend.flush();

    expect(modal.close).toHaveBeenCalled();
  });

});
