'use strict';

describe('Controller: ContentworkflowCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var ContentworkflowCtrl,
      scope,
      modalService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $modal) {
    modalService = $modal;
    scope = $rootScope.$new();
    ContentworkflowCtrl = $controller('ContentworkflowCtrl', {
      $scope: scope,
      $modal: modalService
    });
    sinon.stub(modalService, 'open').returns({
      result: {
        then: function () {}
      }
    });
  }));

  describe('should contain modal opening functions for various modals:', function () {
    it('trashContentModal', function () {
      scope.trashContentModal();
      expect(modalService.open).to.have.been.called;
    });
    it('pubTimeModal', function () {
      scope.pubTimeModal();
      expect(modalService.open).to.have.been.called;
    });
    it('sendToEditorModal', function () {
      scope.sendToEditorModal();
      expect(modalService.open).to.have.been.called;
    });
    it('changelogModal', function () {
      scope.changelogModal();
      expect(modalService.open).to.have.been.called;
    });
    it('thumbnailModal', function () {
      scope.thumbnailModal();
      expect(modalService.open).to.have.been.called;
    });
    it('versionBrowserModal', function () {
      scope.versionBrowserModal();
      expect(modalService.open).to.have.been.called;
    });
    it('descriptionModal', function () {
      scope.descriptionModal();
      expect(modalService.open).to.have.been.called;
    });
  });

  describe('function getStatus is a utility function for determining if an article is unpublished/scheduled/published', function () {
    it('should return "unpublished" if article has no publish time set', function () {
      expect(scope.getStatus({})).to.equal('unpublished');
      expect(scope.getStatus({published: null})).to.equal('unpublished');
    });
    it('should return "scheduled" if article has publish time in future', function () {
      expect(scope.getStatus({published: '2999-04-08T15:35:15.118Z'})).to.equal('scheduled');
    });
    it('should return "published" if article has publish time in past', function () {
      expect(scope.getStatus({published: '1999-04-08T15:35:15.118Z'})).to.equal('published');
    });
  });

});
