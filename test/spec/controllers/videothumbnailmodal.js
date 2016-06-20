'use strict';

describe('Controller: VideothumbnailmodalCtrl', function () {

  var VideothumbnailmodalCtrl,
    scope,
    modalService,
    modal,
    zencoderService;

  beforeEach(function () {
    module('bulbsCmsApp');
    module('jsTemplates');
    module(
      'bulbs.cms.site.config',
      function (CmsConfigProvider) {
        CmsConfigProvider.setVideoThumbnailUrl('thumbnails4you.com/');
      }
    );

    inject(function ($controller, $rootScope, $modal, Zencoder) {
      scope = $rootScope.$new();
      zencoderService = Zencoder;

      zencoderService.getVideo = function () {
        return {then: function () {}}
      }

      var modalUrl = '/views/modals/last-modified-guard-modal.html';
      modal = $modal.open({
        templateUrl: modalUrl
      });

      modal.dismiss = function () { return true; }
      modal.close = function () { return true; }
      modalService = $modal
      modalService.open = function () { return true; }

      VideothumbnailmodalCtrl = $controller('VideothumbnailmodalCtrl', {
        $scope: scope,
        $modal: modalService,
        $modalInstance: modal,
        Zencoder: zencoderService,
        videoId: 1
      });
    })
  });

  describe('default thumbnail', function () {
    it('should have a function defaultThumb that sets thumbnail to current default of 4', function () {
      //note: 4 is just a number that we guessed would be high enough to give a good 'preview' thumbnail
      scope.video = {};
      scope.defaultThumb();
      expect(scope.video.poster).to.equal('thumbnails4you.com/1/thumbnail_0004.png')
    });
  });

  describe('thumbnail scrolling', function () {
    it('should have a function nextThumb that increments thumbnail', function () {
      scope.currentThumbnail = 5;
      scope.video = {};
      scope.nextThumb();
      scope.$digest();
      expect(scope.currentThumbnail).to.equal(6);
      expect(scope.video.poster).to.equal('thumbnails4you.com/1/thumbnail_0006.png')
    });
    it('should have a function nextThumb that goes to zero instead of going above max thumbnail (19)', function () {
      scope.currentThumbnail = 19;
      scope.video = {};
      scope.nextThumb();
      scope.$digest();
      expect(scope.currentThumbnail).to.equal(0);
      expect(scope.video.poster).to.equal('thumbnails4you.com/1/thumbnail_0000.png')
    });

    it('should have a function prevThumb that decrements thumbnail', function () {
      scope.currentThumbnail = 8;
      scope.video = {};
      scope.prevThumb();
      scope.$digest();
      expect(scope.currentThumbnail).to.equal(7);
      expect(scope.video.poster).to.equal('thumbnails4you.com/1/thumbnail_0007.png')
    });

    it('should have a function prevThumb that goes to max thumbnail (19) instead of below zero', function () {
      scope.currentThumbnail = 0;
      scope.video = {};
      scope.prevThumb();
      scope.$digest();
      expect(scope.currentThumbnail).to.equal(19);
      expect(scope.video.poster).to.equal('thumbnails4you.com/1/thumbnail_0019.png')
    });

  });

  it('if poster is not a Zencoded thumbnail, should not set a currentThumbnail', function (){
    scope.video = {poster: 'some url that surely is not a zencoder thumbnail!'};
    scope.$digest();
    expect(scope.currentThumbnail).to.equal(false);
  });

  describe('functions that call Zencoder service', function () {
    it('setPoster should call Zencoder.setVideo', function () {
      scope.video = {poster: 'dummy value'};
      sinon.stub(zencoderService, 'setVideo');
      scope.setPoster();
      expect(zencoderService.setVideo).to.have.been.calledWith({poster: 'dummy value'});
    });
    it('reencode should call Zencoder.encode', function () {
      sinon.stub(zencoderService, 'encode');
      scope.reencode();
      expect(zencoderService.encode).to.have.been.calledWith(1);
    })
  });

});
