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
        link: function (scope) {

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
            scope.onSelect(contentId);

            var newRecircIdsLength = scope.ngModel.push(contentId);
            retrieveContent(contentId).then(function (content) {
              scope.fullRecircContents[newRecircIdsLength - 1] = content;
            });

          };

          scope.removeRecirc = function (index) {
            scope.onRemove(index);

            Utils.removeFrom(scope.ngModel, index);
            Utils.removeFrom(scope.fullRecircContents, index);
          };

          if (angular.isArray(scope.ngModel)) {
            scope.ngModel.forEach(function (contentId, i) {
              retrieveContent(contentId).then(function (content) {
                scope.fullRecircContents[i] = content;
              });
            });
          }
        },
        require: 'ngModel',
        restrict: 'E',
        scope: {
          inputId: '@',
          inputLabel: '@',
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

