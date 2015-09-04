"use strict";

angular.module('sendToEditor.config', [
  'lodash'
])
  .provider('SendToEditorConfig', function (_) {
    // getter and setter for 'Send to Editor' article statuses
    var articleStatuses = [];

    this.addArticleStatus = function (status) {
      articleStatuses.push(status);
    };

    this.$get = function () {
      return {
          getArticleStatuses: _.constant(articleStatuses)
      };
    };
  });
