'use strict';

describe('Directive: featuretypeField', function () {

  // load the directive's module
  beforeEach(module('bulbsCmsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<featuretype-field></featuretype-field>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the featuretypeField directive');
  }));
});
