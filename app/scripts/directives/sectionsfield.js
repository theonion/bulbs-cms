'use strict';

angular.module('bulbsCmsApp')
  .directive('sectionsField', function (routes, _, IfExistsElse, ContentFactory, Raven, $) {
    return {
      templateUrl: routes.PARTIALS_URL + 'taglike-autocomplete-field.html',
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.name = 'section';
        scope.label = 'Sections';
        scope.placeholder = 'Enter a section';
        scope.resourceUrl = '/cms/api/v1/tag/?ordering=name&types=core_section&search=';
        scope.display = function (o) {
          return o.name;
        };

        scope.$watch('article.tags', function () {
          scope.objects = _.where(scope.article.tags, {type: 'core_section'});
        }, true);

        scope.add = function (o, input, freeForm) {
          var tagVal = freeForm ? o : o.name;
          IfExistsElse.ifExistsElse(
            ContentFactory.all('tag').getList({
              ordering: 'name',
              search: tagVal
            }),
            {name: tagVal},
            function (tag) { scope.article.tags.push(tag); },
            function () { console.log('Can\'t create sections.'); },
            function (data, status) { Raven.captureMessage('Error Adding Section', {extra: data}); }
          );
          $(input).val('');
        };

        scope.delete = function (e) {
          var tag = $(e.target).parents('[data-taglikeobject]').data('taglikeobject');
          var name = tag.name;
          var newtags = [];
          for (var i in scope.article.tags) {
            if (scope.article.tags[i].name !== name) {
              newtags.push(scope.article.tags[i]);
            }
          }
          scope.article.tags = newtags;
        };

      }
    };
  });
