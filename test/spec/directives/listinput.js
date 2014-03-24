'use strict';

describe('Directive: listinput', function () {

  // load the directive's module
  beforeEach(module('bulbsCmsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<listinput></listinput>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the listinput directive');
  }));
});
