'use strict';

angular.module('bulbsCmsApp')
  .service('CurrentUser', function EditorItems(ContentFactory, $q) {

    var userDefer = $q.defer(),
        $userPromise = userDefer.promise;

    this.data = [];

    var self = this;
    this.getItems = function () {
      ContentFactory.one('me').get().then(function (data) {
        self.data = data;
        userDefer.resolve(data);
      });
    };

    this.getItems();

    /**
     * Get promise that resolves when user data is populated.
     */
    this.$retrieveData = function () { return $userPromise; };

    /**
     * Create a simplified version of this user for storage.
     */
    this.$simplified = function () {

      return $userPromise.then(function (user) {

        var displayName = user.first_name && user.last_name ?
                            user.first_name + ' ' + user.last_name :
                              (user.email || user.username);

        return {
          id: user.id,
          displayName: displayName
        };

      });

    };

  });
