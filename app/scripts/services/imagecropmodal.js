'use strict';

angular.module('bulbsCmsApp')
  .factory('openImageCropModal', function ($document, $compile, $rootScope) {
    return function () {
      var el = $compile("<ng-image-crop-modal></ng-image-crop-modal>")($rootScope);
      $document.find('body').append(el);
    };
  })
  .directive('ngImageCropModal', function ($modal, $bettycropper, routes) {
    return {
      restrict: 'E',
      scope: {},
      link: function (scope, element, attrs) {
        var ModalInstanceCtrl = function ($scope, $modalInstance) {

        };
        $modal.open({
          templateUrl: routes.PARTIALS_URL + "image-crop-modal.html",
          controller: ModalInstanceCtrl
        });
      }
    };
  });

