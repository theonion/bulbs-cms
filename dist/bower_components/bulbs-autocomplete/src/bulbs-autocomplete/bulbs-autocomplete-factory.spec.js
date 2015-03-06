'use strict';

describe('BulbsAutocomplete Factory', function () {
  var BulbsAutocomplete,
    $rootScope,
    $q;

  beforeEach(function () {
    module('BulbsAutocomplete.factory');
    inject(function (_BulbsAutocomplete_, _$q_, _$rootScope_) {
      BulbsAutocomplete = _BulbsAutocomplete_;
      $q = _$q_;
      $rootScope = _$rootScope_;
    });
  });

  it('should error when not passed a valid getItemsFunction parameter', function () {
    expect(function () {
      new BulbsAutocomplete(null);
    }).toThrow();
  });

  it('should call getItems and format on $retrieve', function () {
    var funk = {};
    funk.getItemsFunction = function () {
      var deferred = $q.defer();
      deferred.resolve('bacon');
      return deferred.promise;
    };

    spyOn(funk, 'getItemsFunction').and.callThrough();

    var bulbsAutocomplete = new BulbsAutocomplete(funk.getItemsFunction);
    bulbsAutocomplete.$retrieve();

    $rootScope.$apply();
    expect(funk.getItemsFunction).toHaveBeenCalled();
  });
});
