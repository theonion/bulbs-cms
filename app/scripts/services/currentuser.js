'use strict';

angular.module('bulbsCmsApp')
  .service('CurrentUser', function EditorItems(ContentApi) {
    this.data = [];
    var self = this;

    this.getItems = function () {
      ContentApi.one('me').get().then(function(data){
        self.data = data;
      });
    };

    this.getItems();
  });
