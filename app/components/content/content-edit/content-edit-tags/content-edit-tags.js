'use strict';

angular.module('content.edit.tags', [
  'apiServices.tag.factory',
  'bulbsCmsApp.settings',
  'lodash',
  'tagList',
  'uuid4'
])
  .directive('contentEditTags', [
    'COMPONENTS_URL', 'uuid4',
    function (COMPONENTS_URL, uuid4) {
      return {
        controller: [
          '_', '$scope', 'Tag',
          function (_, $scope, Tag) {

            $scope.addTag = function (tag) {
              var tagIsString = typeof tag === 'string';

              var alreadyInList =
                _.find($scope.article.tags, function (articleTag) {
                  return tagIsString ? articleTag.name === tag : articleTag.id === tag.id;
                });

              if (!alreadyInList) {
                var newTag = {
                  type: 'content_tag'
                };
                if (tagIsString) {
                  newTag.name = tag;
                  newTag.new = true;
                } else {
                  newTag.id = tag.id;
                  newTag.name = tag.name;
                }

                $scope.article.tags.push(newTag);
              }
            };

            $scope.searchTags = function (query) {
              return Tag.$search({
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
        templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-tags/content-edit-tags.html'
      };
    }
  ]);
