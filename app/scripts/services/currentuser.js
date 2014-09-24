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

    /**
     * Create a simplified version of this user for storage.
     */
    this.$simplified = function () {

      return this.$retrieveData.then(function () {

        var displayName = user.first_name && user.last_name
                            ? user.first_name + ' ' + user.last_name
                              : (user.email || user.username);

        return {
          id: user.id,
          displayName: displayName
        }

      });

    }

  });
