'use strict';

angular.module('bulbsCmsApp')
  .directive('authorsField', function (routes, userFilter) {
    return {
      templateUrl: routes.PARTIALS_URL + 'taglike-autocomplete-field.html',
      restrict: 'E',
      scope: {
        article: '='
      },
      link: function postLink(scope, element, attrs) {
        scope.name = 'author';
        scope.label = 'Authors';
        scope.placeholder = 'Authors';
        scope.resourceUrl = '/cms/api/v1/tag/?ordering=name&types=content_tag&search=';
        scope.display = userFilter;

        scope.$watch('article.authors', function(){
          scope.objects = scope.article.authors;
        }, true);

        scope.add = function (o, input) {
          for (var t in $scope.article.authors) {
            if ($scope.article.authors[t].id === o.id) { return; }
          }
          $scope.article.authors.push(o);
          $(input).val('');
        };

        scope.delete = function (e) {
          var author = $(e.target).parents('[data-taglikeobject]').data('taglikeobject');
          var id = author.id;
          var newauthors = [];
          for (var i in scope.article.authors) {
            if (scope.article.authors[i].id !== id) {
              newauthors.push(scope.article.authors[i]);
            }
          }
          scope.article.authors = newauthors;
        };

        scope.div1classes = 'well clearfix';
        scope.h1classes = 'h5 col-sm-10 col-sm-push-1';
        scope.div2classes = 'col-sm-3 col-sm-push-1';
        scope.div3classes = 'col-sm-7 col-sm-push-1';

      }
    };
  });
