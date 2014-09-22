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
    spyOn(modalService, 'open').andReturn({
      result: {
        then: function () {}
      }
    });
  }));
  
  describe('should contain modal opening functions for various modals:', function () {
    it('trashContentModal', function () {
      scope.trashContentModal();
      expect(modalService.open).toHaveBeenCalled();
    });
    it('pubTimeModal', function () {
      scope.pubTimeModal();
      expect(modalService.open).toHaveBeenCalled();
    });
    it('sendToEditorModal', function () {
      scope.sendToEditorModal();
      expect(modalService.open).toHaveBeenCalled();
    });
    it('changelogModal', function () {
      scope.changelogModal();
      expect(modalService.open).toHaveBeenCalled();
    });
    it('thumbnailModal', function () {
      scope.thumbnailModal();
      expect(modalService.open).toHaveBeenCalled();
    });
    it('sponsoredContentModal', function () {
      scope.sponsoredContentModal();
      expect(modalService.open).toHaveBeenCalled();
    });
    it('sponsorModal', function () {
      scope.sponsorModal();
      expect(modalService.open).toHaveBeenCalled();
    });
    it('versionBrowserModal', function () {
      scope.versionBrowserModal();
      expect(modalService.open).toHaveBeenCalled();
    });
    it('descriptionModal', function () {
      scope.descriptionModal();
      expect(modalService.open).toHaveBeenCalled();
    });
  });

  describe('function getStatus is a utility function for determining if an article is unpublished/scheduled/published', function () {
    it('should return "unpublished" if article has no publish time set', function () {
      expect(scope.getStatus({})).toBe('unpublished');
      expect(scope.getStatus({published: null})).toBe('unpublished');
    });
    it('should return "scheduled" if article has publish time in future', function () {
      expect(scope.getStatus({published: '2999-04-08T15:35:15.118Z'})).toBe('scheduled');
    });
    it('should return "published" if article has publish time in past', function () {
      expect(scope.getStatus({published: '1999-04-08T15:35:15.118Z'})).toBe('published');
    });
  });

});
