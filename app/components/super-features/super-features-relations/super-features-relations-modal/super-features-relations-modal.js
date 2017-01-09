'use strict';

angular.module('bulbs.cms.superFeatures.relations.modal', [
  'bulbs.cms.site.config',
  'ui.bootstrap',
  'ui.bootstrap.modal'
])
  .directive('superFeaturesRelationsModalOpener', [
    '$modal', 'CmsConfig',
    function ($modal, CmsConfig) {
      return {
        restrict: 'A',
        scope: {
          modalBodyBefore: '@',
          modalBodyAfter: '@',
          modalCancelText: '@',
          modalOkText: '@',
          modalOnCancel: '&',
          modalOnOk: '&',
          modalRelationType: '@',
          modalChoices: '=',
        },
        link: function (scope, element) {
          element.addClass('super-features-relations-modal-opener');
          element.on('click', function () {

            if (!scope.modalInstance) {

              scope.modalInstance = $modal
                .open({
                  scope: scope,
                  templateUrl: CmsConfig.buildComponentPath(
                    'super-features',
                    'super-features-relations',
                    'super-features-relations-modal',
                    'super-features-relations-modal.html'
                  )
                });

              scope.modalInstance.result
                .then(scope.modalOnOk)
                .catch(scope.modalOnCancel)
                .finally(function () {
                  scope.modalInstance = false;
                });
            }
          });

          var updateActiveChoiceElement = function(el) {
            var oldEl = $('#superFeaturesRelationsModal').find('.active')
            oldEl.removeClass('active')
            $(el).addClass('active');
          };

          scope.setRelationTypeChoice = function(e, choice) {
            scope.modalRelationType = choice;
            updateActiveChoiceElement(e.currentTarget);
          };

        }
      };
    }
  ]);
