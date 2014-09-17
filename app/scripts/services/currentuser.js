'use strict';

angular.module('bulbsCmsApp')
  .service('CurrentUser', function EditorItems(ContentApi, $q) {

    var userDefer = $q.defer();

    this.data = [];
    this.$retrieveData = userDefer.promise;

    var self = this;
    this.getItems = function () {
      ContentApi.one('me').get().then(function (data) {
        self.data = data;
        userDefer.resolve(data);
      });
    };

    this.getItems();
  });
