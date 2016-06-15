'use strict';

angular.module('bulbs.cms.components.createContent.config', [
  'lodash'
])
  .constant('BULBS_CMS_CREATE_CONTENT_DEFAULT_DIRECTIVE', 'create-content-default')
  .provider('CreateContentConfig', [
    '_', '$injector', 'BULBS_CMS_CREATE_CONTENT_DEFAULT_DIRECTIVE',
    function CreateContentConfigProvider (_, $injector, BULBS_CMS_CREATE_CONTENT_DEFAULT_DIRECTIVE) {

      var configError = BulbsCmsConfigError.build('CreateContentConfig');
      var contentTypes = [];

      this.addContentType = function (contentTypeSpec) {
        if (!_.isObject(contentTypeSpec)) {
          throw configError('must provide parameters when adding a content type!');
        }

        if (!_.isString(contentTypeSpec.title)) {
          throw configError('all content types must have a title!');
        }

        if (!_.isObject(contentTypeSpec.payload)) {
          throw configError('payload not provided for "' + contentTypeSpec.title + '"!');
        }

        if (!_.isString(contentTypeSpec.payload.feature_type)) {
          throw configError('provide a feature type for "' + contentTypeSpec.title + '"!');
        }

        if (_.some(contentTypes, 'title', contentTypeSpec.title)) {
          throw configError('"' + contentTypeSpec.title + '" is not unique!');
        }

        var spec = _.pick(
          contentTypeSpec, [
            'title',
            'payload',
            'context',
            'directive'
          ]
        );

        if (!_.isString(spec.context)) {
          spec.context = {};
        }

        if (!_.isString(spec.directive)) {
          spec.directive = BULBS_CMS_CREATE_CONTENT_DEFAULT_DIRECTIVE;
        }

        contentTypes.push(spec);

        return this;
      };

      this.$get = [
        '$compile',
        function ($compile) {

          return {
            getContentTypes: function ($scope) {
              return contentTypes
                .map(function (contentType) {
                  $scope.context = contentType.context;

                  var f = $compile('<' + contentType.directive + '>')($scope);

                  return {
                    title: contentType.title,
                    defaultPayload: contentType.payload,
                    directive: f.html(),
                  }
                });
            }
          };
        }
      ];
    }
  ]);
