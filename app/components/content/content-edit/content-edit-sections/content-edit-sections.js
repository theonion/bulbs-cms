'use strict';

angular.module('content.edit.sections', [
  'apiServices.section.factory',
  'bulbsCmsApp.settings',
  'uuid4'
])
  .directive('contentEditSections', [
    'COMPONENTS_URL', 'uuid4',
    function (COMPONENTS_URL, uuid4) {
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
          article: '='
        },
        templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-sections/content-edit-sections.html'
      };
    }
  ]);
