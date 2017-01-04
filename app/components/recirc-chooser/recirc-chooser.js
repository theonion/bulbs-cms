'use strict';

angular.module('bulbs.cms.recircChooser', [
  'bulbs.cms.contentSearch',
  'bulbs.cms.site.config',
  'uuid4'
])
  .directive('recircChooser', [
    'CmsConfig', 'ContentFactory', 'Utils', 'uuid4',
    function (CmsConfig, ContentFactory, Utils, uuid4) {

      return {
        link: function (scope, element, attrs, controllers) {

          var parentForm = controllers[1];

          scope.maxRecircItemsInt =
            scope.maxRecircItems ? parseInt(scope.maxRecircItems, 10) : 3;

          scope.inputId =
            angular.isString(scope.inputId) ?
              scope.inputId :
              uuid4.generate();

          scope.fullRecircContents = [];

          var retrieveContent = function (contentId) {
            return ContentFactory.one('content', contentId).get();
          };

          scope.includeRecirc = function (contentId) {
            var newRecircIdsLength = scope.ngModel.push(contentId);

            scope.onSelect(contentId);

            retrieveContent(contentId).then(function (content) {
              scope.fullRecircContents[newRecircIdsLength - 1] = content;
            });

            if (angular.isObject(parentForm)) {
              parentForm.$setDirty();
            }
          };

          scope.removeRecirc = function (index) {
            scope.onRemove(index);

            Utils.removeFrom(scope.ngModel, index);
            Utils.removeFrom(scope.fullRecircContents, index);

            if (angular.isObject(parentForm)) {
              parentForm.$setDirty();
            }
          };

          if (angular.isArray(scope.ngModel)) {
            scope.ngModel.forEach(function (contentId, i) {
              retrieveContent(contentId).then(function (content) {
                scope.fullRecircContents[i] = content;
              });
            });
          }
        },
        require: ['ngModel', '?^^form'],
        restrict: 'E',
        scope: {
          inputId: '@',
          maxRecircItems: '@',
          ngModel: '=',
          onRemove: '&',
          onSelect: '&'
        },
        templateUrl: CmsConfig.buildComponentPath(
          'recirc-chooser',
          'recirc-chooser.html'
        )
      };
    }
  ]);

