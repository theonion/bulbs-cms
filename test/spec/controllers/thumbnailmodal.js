'use strict';

describe('Controller: ThumbnailModalCtrl', function () {

  // load some modules we need
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('jsTemplates'));

  describe('test modal functionality', function () {

    var mockModalInstance,
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

      // create modal controller instance and expose its scope
      scope = $rootScope.$new();
      ThumbnailModalCtrl = $controller('ThumbnailModalCtrl', {

        $scope: scope,
        BettyCropper: mockBettyCropper,
        $modalInstance: mockModalInstance,
        article: {}

       });
    }));

    it('should select a custom thumbnail', function () {
      scope.selectCustomThumbnail();
      expect(scope.article.thumbnail_override.id).toBe(1);
    });

  });

});