'use strict';

angular.module('content.edit.authors', [
  'apiServices.author.factory',
  'bulbsCmsApp.settings',
  'filters.userDisplay',
  'lodash',
  'tagList',
  'uuid4'
])
  .directive('contentEditAuthors', [
    'COMPONENTS_URL', 'uuid4',
    function (COMPONENTS_URL, uuid4) {
      return {
        controller: [
          '_', '$scope', 'Author',
          function (_, $scope, Author) {

            $scope.addAuthor = function (author) {
              var alreadyInList =
                _.find($scope.article.authors, function (articleAuthor) {
                  return articleAuthor.id === author.id;
                });

              if (!alreadyInList) {
                var newAuthor = {
                  first_name: author.firstName,
                  id: author.id,
                  last_name: author.lastName,
                  username: author.username
                };

                $scope.article.authors.push(newAuthor);
              }
            };

            $scope.searchAuthors = function (query) {
              return Author.$search({
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
        templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-authors/content-edit-authors.html'
      };
    }
  ]);
