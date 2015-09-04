'use strict';

describe('Factory: FirebaseApi', function () {

  beforeEach(function () {
    module('cms.firebase');
  });

  it('should fail gracefully if firebase url is invalid', function () {
    module('cms.firebase', function (FirebaseConfigProvider) {
      FirebaseConfigProvider.setDbUrl('');
    });

    var $injector = angular.injector(['cms.firebase.api', 'ng']);
    expect($injector.get.bind(null, 'FirebaseApi')).not.toThrow();
  });
});
