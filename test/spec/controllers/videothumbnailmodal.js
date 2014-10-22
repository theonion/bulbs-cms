'use strict';

describe('Controller: VideothumbnailmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('jsTemplates'));

  var VideothumbnailmodalCtrl,
    scope,
    modalService,
    modal,
    zencoderService;

  var thumbnailUrlString = 'thumbnails4you.com/{{video}}/thumbnail_{{thumbnail}}';
  var customVideoPosterUrlString = '{{ratio}}_{{image}}';

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $modal, routes, Zencoder) {
    scope = $rootScope.$new();
    zencoderService = Zencoder;
    
    zencoderService.getVideo = function () {
      return {then: function () {}}
    }
    
    var modalUrl = routes.PARTIALS_URL + 'modals/last-modified-guard-modal.html';
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
      VIDEO_THUMBNAIL_URL: thumbnailUrlString,
      CUSTOM_VIDEO_POSTER_URL: customVideoPosterUrlString,
      videoId: 1
    });
  }));
  
  describe('default thumbnail', function () {
    it('should have a function defaultThumb that sets thumbnail to current default of 4', function () {
      //note: 4 is just a number that we guessed would be high enough to give a good 'preview' thumbnail
      scope.video = {};
      scope.defaultThumb();
      expect(scope.video.poster).toBe('thumbnails4you.com/1/thumbnail_0004')
    });
  });
  
  describe('thumbnail scrolling', function () {
    it('should have a function nextThumb that increments thumbnail', function () {
      scope.currentThumbnail = 5;
      scope.video = {};
      scope.nextThumb();
      scope.$digest();
      expect(scope.currentThumbnail).toBe(6);
      expect(scope.video.poster).toBe('thumbnails4you.com/1/thumbnail_0006')
    });
    it('should have a function nextThumb that goes to zero instead of going above max thumbnail (19)', function () {
      scope.currentThumbnail = 19;
      scope.video = {};
      scope.nextThumb();
      scope.$digest();
      expect(scope.currentThumbnail).toBe(0);
      expect(scope.video.poster).toBe('thumbnails4you.com/1/thumbnail_0000')
    });

    it('should have a function prevThumb that decrements thumbnail', function () {
      scope.currentThumbnail = 8;
      scope.video = {};
      scope.prevThumb();
      scope.$digest();
      expect(scope.currentThumbnail).toBe(7);
      expect(scope.video.poster).toBe('thumbnails4you.com/1/thumbnail_0007')
    });
    
    it('should have a function prevThumb that goes to max thumbnail (19) instead of below zero', function () {
      scope.currentThumbnail = 0;
      scope.video = {};
      scope.prevThumb();
      scope.$digest();
      expect(scope.currentThumbnail).toBe(19);
      expect(scope.video.poster).toBe('thumbnails4you.com/1/thumbnail_0019')
    });
    
  });
  
  it('if poster is not a Zencoded thumbnail, should not set a currentThumbnail', function (){
    scope.video = {poster: 'some url that surely is not a zencoder thumbnail!'};
    scope.$digest();
    expect(scope.currentThumbnail).toBe(false);
  });
  
  describe('functions that call Zencoder service', function () {
    it('setPoster should call Zencoder.setVideo', function () {
      scope.video = {poster: 'dummy value'};
      spyOn(zencoderService, 'setVideo');
      scope.setPoster();
      expect(zencoderService.setVideo).toHaveBeenCalledWith({poster: 'dummy value'});
    });
    it('reencode should call Zencoder.encode', function () {
      spyOn(zencoderService, 'encode');
      scope.reencode();
      expect(zencoderService.encode).toHaveBeenCalledWith(1);
    })
  });

});
