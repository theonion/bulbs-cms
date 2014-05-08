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

    var keyPrefix = this.keyPrefix;
    var keySuffix = this.keySuffix;

    this.backupToLocalStorage = function () {
      var localStorageKeys = Object.keys($window.localStorage);
      var mostRecentTimestamp = 0;
      for(var keyIndex in localStorageKeys){
        var key = $window.localStorage.key(keyIndex);
        if(key && key.split('.')[2] == $routeParams.id && Number(key.split('.')[1]) > mostRecentTimestamp){
          mostRecentTimestamp = Number(key.split('.')[1]);
        }
      }
      var mostRecentValue = $window.localStorage.getItem(keyPrefix + '.' + mostRecentTimestamp + keySuffix);
      if(!(mostRecentValue != $("#content-body .editor").html())){
        return;
      }
      try{
        $window.localStorage &&
          $window.localStorage.setItem(keyPrefix + '.' + moment().unix() + keySuffix, $("#content-body .editor").html()); //TODO: this is gonna break
      }catch (error){
        console.log("Caught localStorage Error " + error)
        console.log("Trying to prune old entries");

        for(var keyIndex in localStorageKeys){
          var key = $window.localStorage.key(keyIndex);
          if(key && key.split('.')[0] != keyPrefix){
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
