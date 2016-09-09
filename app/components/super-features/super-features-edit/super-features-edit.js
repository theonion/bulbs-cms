'use strict';

angular.module('bulbs.cms.superFeatures.edit', [
  'bulbs.cms.breadcrumb',
  'bulbs.cms.dynamicContent',
  'bulbs.cms.site.config',
  'bulbs.cms.superFeatures.api',
  'bulbs.cms.superFeatures.relations'
])
  .directive('superFeaturesEdit', [
    'CmsConfig', 'SuperFeaturesApi',
    function (CmsConfig, SuperFeaturesApi) {
      return {
        link: function (scope, element, attrs) {
          scope.breadcrumbs = [{
            label: 'Super Features',
            href: '/cms/app/super-features'
          }, {
            label: function () {
              return scope.article.title;
            }
          }];

          var addParentToBreadcrumb = function (article) {
            if (angular.isNumber(article.parent)) {
              SuperFeaturesApi.getSuperFeature(article.parent)
                .then(function (superFeature) {
                  scope.breadcrumbs.splice(1, 0, {
                    label: superFeature.title,
                    href: '/cms/app/edit/' + superFeature.id + '/' + CmsConfig.getSuperFeaturesType()
                  });

                  addParentToBreadcrumb(superFeature);
                });
            }
          };

          addParentToBreadcrumb(scope.article);
        },
        // no scope here so we have access to the content edit scope without
        //  having to make changes to the brittle content edit controller,
        //  maybe we remove this wrapper someday when we refactor content edit
        scope: false,
        restrict: 'E',
        templateUrl: CmsConfig.buildComponentPath(
          'super-features',
          'super-features-edit',
          'super-features-edit.html'
        )
      };
    }
  ]);
