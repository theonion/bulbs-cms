'use strict';

angular.module('bulbs.cms.editorial.editorItems', [])
  .service('EditorItems', function EditorItems($http) {
    this.data = [];
    var self = this;
    this.getItems = function (article) {
      $http.get(
        '/cms/api/v1/content/' + article + '/send/'
      ).success(function (data, status) {
        self.data = data.editor_items;
      }).error(function (data, status) {});
    };
  });
