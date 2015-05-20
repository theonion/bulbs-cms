'use strict';

angular.module('content.edit.editorItem.service', [
  'cms.config'
])
  .service('EditorItems', [
    '$http', 'CmsConfig',
    function EditorItems($http, CmsConfig) {
      this.data = [];
      var self = this;
      this.getItems = function (article) {
        $http.get(
          CmsConfig.buildBackendUrl('/cms/api/v1/content/' + article + '/send/')
        ).success(function (data, status) {
          self.data = data.editor_items;
        });
      };
    }]);
