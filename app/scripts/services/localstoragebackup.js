'use strict';

angular.module('bulbsCmsApp')
  .service('Localstoragebackup', function Localstoragebackup($routeParams, $window, moment, $, _) {

    /*
    hacky first version of local storage backup
    this is for backing up body contents to local storage
    for now this is just keying to articleBodyBackup.<timestamp>.<article id>.body
    if LS is full, it tries deleting old backups
    TODO: add tests
    TODO: make configurable
    TODO: apply to other fields
    TODO: don't use $().html() to capture the value
    TODO: capture routeChange and cancel the interval
      (this works for now because we're doing a full teardown on route change
      if we ever go back to a real 'single page app' this will fuck up)
    TODO: lots of stuff
    */

    this.keyPrefix = 'articleBodyBackup';
    this.keySuffix = '.' + $routeParams.id + '.body';

    this.backupToLocalStorage = function () {
      try{
        $window.localStorage &&
          $window.localStorage.setItem(this.keyPrefix + '.' + moment().unix() + this.keySuffix, $("#content-body .editor").html()); //TODO: this is gonna break
      }catch (error){
        console.log("Caught localStorage Error " + error)
        console.log("Trying to prune old entries");
        var localStorageKeys = Object.keys($window.localStorage);
        for(var keyIndex in localStorageKeys){
          var key = $window.localStorage.key(keyIndex);
          if(key && key.split('.')[0] != this.keyPrefix){
            continue;
          }
          var yesterday = moment().date(moment().date()-1).unix();
          var keyStamp = Number(key.split('.')[1]);
          if(keyStamp < yesterday){
            $window.localStorage.removeItem(key);
          }
        }
      }
    };

  });
