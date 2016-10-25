'use strict';

angular.module('bulbs.cms.superFeatures.edit', [
  'bulbs.cms.breadcrumb',
  'bulbs.cms.contentSearch',
  'bulbs.cms.dynamicContent',
  'bulbs.cms.site.config',
  'bulbs.cms.superFeatures.api',
  'bulbs.cms.superFeatures.relations'
])
  .directive('superFeaturesEdit', [
    'CmsConfig', 'ContentFactory', 'SuperFeaturesApi',
    function (CmsConfig, ContentFactory, SuperFeaturesApi) {
      return {
        link: function (scope) {

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

          scope.fullRecircContents = [];

          var retrieveContent = function (contentId) {
            return ContentFactory.one('content', contentId).get();
          };

          scope.includeRecirc = function (contentId) {
            var recirc = scope.article.recirc_query;

            if (angular.isUndefined(recirc.included_ids)) {
              recirc.included_ids = [];
            }

            var newRecircIdsLength = recirc.included_ids.push(contentId);
            retrieveContent(contentId).then(function (content) {
              scope.fullRecircContents[newRecircIdsLength - 1] = content;
            });
          };

          if (scope.article.recirc_query.included_ids) {
            scope.article.recirc_query.included_ids.forEach(function (contentId, i) {
              retrieveContent(contentId).then(function (content) {
                scope.fullRecircContents[i] = content;
              });
            });
          }
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
