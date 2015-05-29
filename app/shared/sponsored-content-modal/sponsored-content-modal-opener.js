'use strict';

angular.module('sponsoredContentModal', [
  'sponsoredContentModal.factory'
])
  .directive('sponsoredContentModalOpener', function (SponsoredContentModal) {
    return {
      restrict: 'A',
      scope: {
        article: '='
      },
      link: function (scope, element) {
        var modalInstance = null;
        element.addClass('sponsored-content-modal-opener');
        element.on('click', function () {
          modalInstance = new SponsoredContentModal(scope);
        });
      }
    };
  });
