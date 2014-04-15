'use strict';

describe('Directive: activeNav', function () {

  beforeEach(module('bulbsCmsApp'));

  var element,
    inactiveElement,
    scope,
    compile,
    html,
    $location,
    $browser,
    path;

  path = '/cms/app/list';
  html = '<active-nav href="' + path + '" label="Content"></active-nav>';

  beforeEach(inject(function ($rootScope, $compile, _$location_, _$browser_) {
    scope = $rootScope.$new();

    $location = _$location_;
    $browser = _$browser_;
    $location.path(path);
    $browser.poll();

    element = angular.element($compile(html)(scope));
    inactiveElement = angular.element($compile('<active-nav href="whatever" label="Whatever"></active-nav>')(scope));
    scope = element.scope();
    scope.$apply();

  }));

  it('should add the active class to the current path', function () {
    expect(element.hasClass('active')).toBe(true);
  });

  it('should not add the active class to an element that is not for the current path', function () {
    expect(inactiveElement.hasClass('active')).toBe(false);
  });

});
