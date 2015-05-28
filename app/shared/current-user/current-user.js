'use strict';

angular.module('currentUser', [
  'contentServices.factory'
])
  .service('CurrentUser', [
    '$q', 'ContentFactory',
    function CurrentUser($q, ContentFactory) {

      var $userPromise;

      this.data = [];

      var self = this;
      this.getItems = function () {
        if (!$userPromise) {
          $userPromise = ContentFactory.one('me')
            .get()
            .then(function (data) {
              self.data = data;
              return data;
            });
        }

        return $userPromise;
      };

      /**
       * Get promise that resolves when user data is populated.
       */
      this.$retrieveData = function () {
        return this.getItems();
      };

      /**
       * Create a simplified version of this user for storage.
       */
      this.$simplified = function () {
        return this.getItems()
          .then(function (user) {
            var displayName = user.first_name && user.last_name ?
                                user.first_name + ' ' + user.last_name :
                                  (user.email || user.username);
            return {
              id: user.id,
              displayName: displayName
            };
          });
      };
    }
  ]);
