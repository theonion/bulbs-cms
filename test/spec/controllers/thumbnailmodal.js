'use strict';

describe('Controller: ThumbnailModalCtrl', function () {

  // load some modules we need
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('jsTemplates'));

  var mockModalInstance,
      thumbnailObj,
      scope,
      ThumbnailModalCtrl;

  // initialize controller and mock scope
  beforeEach(inject(function ($controller, $rootScope, $modal, BettyCropper) {

    // set up a mock betty cropper so we don't actually have to do requests
    var mockBettyCropper = BettyCropper;
    spyOn(mockBettyCropper, 'upload').andReturn({
      then: function (successCallback) {
        successCallback({
          id: 1
        })
      }
    });

    // mock modal instance for attaching methods to
    mockModalInstance = {
      close: function () {}
    };
    thumbnailObj = null;
    spyOn(mockModalInstance, 'close').andCallFake(function (retThumbnail) {
      thumbnailObj = retThumbnail;
    });

    // create modal controller instance and expose its scope
    scope = $rootScope.$new();
    scope.article = {};
    ThumbnailModalCtrl = $controller('ThumbnailModalCtrl', {

      $scope: scope,
      BettyCropper: mockBettyCropper,
      $modalInstance: mockModalInstance

     });
  }));

  it('should select a custom thumbnail', function () {
    scope.selectCustomThumbnail();
    expect(scope.thumbnail_temp.id).toBe(1)
  });

  it('should choose a new thumbnail when there is no article thumbnail and close', function () {
    scope.article.thumbnail = null;
    scope.thumbnail_temp = {id: 2};
    scope.chooseThumbnail();
    expect(mockModalInstance.close).toHaveBeenCalled();
    expect(thumbnailObj.id).toBe(2);
  });

  it('should choose a new thumbnail when article does have a thumbnail and close', function () {
    scope.article.thumbnail = {id: 1};
    scope.thumbnail_temp = {id: 2};
    scope.chooseThumbnail();
    expect(mockModalInstance.close).toHaveBeenCalled();
    expect(thumbnailObj.id).toBe(2);
  });

  it('should not choose a new thumbnail and close', function () {
    scope.thumbnail_temp = {id: 3};
    scope.article.thumbnail = {id: 3};
    scope.chooseThumbnail();
    expect(mockModalInstance.close).toHaveBeenCalled();
    expect(thumbnailObj).toBe(null);
  });

});