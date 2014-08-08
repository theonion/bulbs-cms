'use strict';

describe('Directive: lazyInclude', function () {

  // load the directive's module
  beforeEach(module('bulbsCmsApp'));

  var element,
    scope,
    _Gettemplate,
    _compile;

  var html = '<div style="display: none;" lazy-include template="test.html"></div>';

  beforeEach(inject(function ($rootScope, $compile, Gettemplate) {
    scope = $rootScope.$new();
    _Gettemplate = Gettemplate;
    _compile = $compile;
  }));

  it('should not call getTemplate if the element is not visible', function(){
    spyOn(_Gettemplate, 'get');
    element = angular.element(_compile('<div style="display: none;" lazy-include template="test.html"></div>')(scope));
    expect(_Gettemplate.get).not.toHaveBeenCalled();
  });



});
