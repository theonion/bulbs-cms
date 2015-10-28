'use strict';

angular.module('content.edit.section', [
  'apiServices.section.factory',
  'bulbsCmsApp.settings',
  'utils',
  'uuid4'
])
  .directive('contentEditSection', [
    'COMPONENTS_URL', 'Utils', 'uuid4',
    function (COMPONENTS_URL, Utils, uuid4) {
      return {
        controller: [
          '$scope', 'Section',
          function ($scope, Section) {

            $scope.searchSections = function (query) {
              return Section.$search({
                ordering: 'name',
                search: query
              })
              .$asPromise();
            };
          }
        ],
        link: function (scope) {
          scope.uuid = uuid4.generate();
        },
        restrict: 'E',
        scope: {
          article: '=',
          onSelect: '&'
        },
        templateUrl: Utils.path.join(
          COMPONENTS_URL,
          'content',
          'content-edit',
          'content-edit-section',
          'content-edit-section.html'
        )
      };
    }
  ]);
