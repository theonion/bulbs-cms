'use strict';

describe('Directive: polls', function () {
  var $browser,
      $compile,
      $httpBackend,
      $location,
      $rootScope,
      element,
      html,
      path,
      scope;

  path = '/cms/app/polls';
  html = '<active-nav href="' + path + '"label="Polls"></active-nav>';

  beforeEach(module('bulbsCmsApp'));


  beforeEach(inject(function (_$browser_, _$compile_, _$httpBackend_, _$location_, _$rootScope_, _$window_) {
      $browser   = _$browser_;
      $compile   = _$compile_;
      $httpBackend   = _$httpBackend_;
      $location   = _$location_;
      $rootScope = _$rootScope_;

      $location.path(path);
      $browser.poll();

      element = $compile(html)($rootScope);

      $rootScope.$digest();
      scope = element.isolateScope();
  }));

  it('should add the active class to current path', function () {
    expect(element.hasClass('active')).toBe(true);
  });

  it('html should contain string "polls"', function () {
    expect(element.html()).toContain('Polls');
  });
});

