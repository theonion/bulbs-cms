'use strict';

describe('Directive: staticImage', function () {

  // load the directive's module
  beforeEach(module('bulbsCmsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<static-image></static-image>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the staticImage directive');
  }));
});
