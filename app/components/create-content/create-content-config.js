'use strict';

angular.module('bulbs.cms.components.createContent.config', [
  'lodash'
])
  .provider('CreateContentConfig', [
    '_',
    function CreateContentConfigProvider (_) {

      var configError = BulbsCmsConfigError.build('CreateContentConfig');
      var contentTypes = [];

      var createContentType = function (title, contentData) {
        if (_.isEmpty(title)) {
          throw configError('all content types must have titles!');
        }

        if (_.isUndefined(contentData) || _.isUndefined(contentData.feature_type)) {
          throw configError('provide a feature type for "' + title + '"!');
        }

        if (_.some(contentTypes, 'title', title)) {
          throw configError('"' + title + '" is not unique!');
        }

        var contentType = {
          title: title,
          contentData: contentData
        };

        contentTypes.push(contentType);

        return contentType;
      };

      this.addContentType = function (title, contentData) {
        createContentType(title, contentData);

        return this;
      };

      this.addContentSubType = function (parentTitle, title, contentData) {
        if (!_.some(contentTypes, 'title', parentTitle)) {
          throw configError('parent "' + parentTitle + '" for content sub type "' + title + '" doesn\'t exist!');
        }

        var parent = _.find(contentTypes, { title: parentTitle });
        if (parent.parentTitle) {
          throw configError('cannot nest sub type "' + title + '" under parent "' + parentTitle + '" which is already a child!');
        }

        var contentType = createContentType(title, contentData);
        contentType.parentTitle = parentTitle;

        return this;
      };

      this.$get = function () {

        return {
          getContentTypes: function () {
            return contentTypes.filter(function (contentType) {
              return _.isUndefined(contentType.parentTitle);
            });
          },
          getContentSubTypes: function (contentTypeTitle) {
            if (_.isUndefined(contentTypeTitle)) {
              throw configError('parent title not given to subtype search!');
            }

            if (!_.some(contentTypes, 'title', contentTypeTitle)) {
              throw configError('parent given to subtype search does not exist!');
            }

            return contentTypes.filter(function (contentType) {
              return contentType.parentTitle === contentTypeTitle;
            });
          }
        };
      };
    }
  ]);
