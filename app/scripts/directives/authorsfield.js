'use strict';

angular.module('bulbsCmsApp')
  .directive('authorsField', function ($, CmsConfig, userNameDisplayFilter, Utils) {
    return {
      templateUrl: '/views/taglike-autocomplete-field.html',
      restrict: 'E',
      replace: true,
      scope: {
        article: '=',
        inputLabelText: '@',
        inputLabelTextSub: '@'
      },
      link: function postLink(scope, element, attrs) {
        scope.name = 'author';
        scope.label = scope.inputLabelText || 'Authors';
        scope.labelSub = scope.inputLabelTextSub;
        scope.placeholder = 'Authors';
        scope.resourceUrl = CmsConfig.buildApiUrlRoot(
          'author',
          Utils.param({
            ordering: 'name',
            search: ''
          })
        );
        scope.display = userNameDisplayFilter;

        scope.$watch('article.authors', function () {
          scope.objects = scope.article.authors;
        }, true);

        scope.add = function (o, input) {
          for (var t in scope.article.authors) {
            if (scope.article.authors[t].id === o.id) { return; }
          }
          scope.article.authors.push(o);
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

      }
    };
  });
