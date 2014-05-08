'use strict';

describe('Service: Localstoragebackup', function () {
  beforeEach(module('bulbsCmsApp'));

  var Localstoragebackup,
    mockMoment,
    mockWindow,
    mockJquery;

  var mockTodayTimestamp = 1399492663000;

  var localStorageMockKeys = [
    'articleBodyBackup.1.1.body',
    'articleBodyBackup.2.1.body',
    'articleBodyBackup.5.2.body',
    'articleBodyBackup.6.2.body',
  ]

  var localStorageMockObject = {
    'articleBodyBackup.1.1.body': 'Article 1 Body at Time 1',
    'articleBodyBackup.2.1.body': 'Article 1 Body at Time 2',
    'articleBodyBackup.5.2.body': 'Article 2 Body at Time 5',
    'articleBodyBackup.6.2.body': 'Article 2 Body at Time 6'
  }

  beforeEach(function () {

    mockMoment = function(param) {
      if(param){
        return moment(param);
      }else{
        return moment(mockTodayTimestamp);
      }
    }

    module(function ($provide) {
      $provide.value('moment', mockMoment);
    });

    mockWindow = {}
    mockWindow.localStorage = {
      key: function(index){
        return Object.keys(localStorageMockObject)[index];
      },
      getItem: function(key){
        return localStorageMockObject[key];
      },
      setItem: function(key, value){
        return true;
      },
      removeItem: function(key){
        return true;
      }
    }

    spyOn(mockWindow.localStorage, 'key');
    spyOn(mockWindow.localStorage, 'getItem');
    spyOn(mockWindow.localStorage, 'setItem');
    spyOn(mockWindow.localStorage, 'removeItem');

    module(function ($provide) {
      $provide.value('$window', mockWindow);
    });

    mockJquery = function () {
      return {
        html: function () {
          return "Great"
        }
      }
    }

    module(function ($provide) {
      $provide.value('$', mockJquery);
    });

  });

  beforeEach(inject(function (_Localstoragebackup_) {
    Localstoragebackup = _Localstoragebackup_;
  }));

  it('should set keyPrefix', function () {
    expect(Localstoragebackup.keyPrefix).toBe('articleBodyBackup');
  });

  describe('function backupToLocalStorage', function () {

    it('should insert into localStorage', function () {
      Localstoragebackup.backupToLocalStorage();
      expect(mockWindow.localStorage.setItem).toHaveBeenCalled();
    })

  });


});
