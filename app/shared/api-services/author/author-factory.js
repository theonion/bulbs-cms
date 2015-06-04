'use strict';

angular.module('apiServices.author.factory', [
  'apiServices'
])
  .factory('Author', [
    'restmod',
    function (restmod) {
      return restmod.model('author').mix({
        $config: {
          name: 'Author',
          plural: 'Authors',
          primaryKey: 'id'
        },
        $extend: {
          Record: {
            displayName: function () {
              var name = '';

              if (this.firstName && this.lastName) {
                name = this.firstName + ' ' + this.lastName;
              } else if (this.lastName) {
                name = this.lastName;
              } else {
                name = this.username;
              }

              return name;
            }
          }
        }
      });
    }
  ]);
