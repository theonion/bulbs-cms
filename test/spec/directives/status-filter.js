'use strict';

describe('Directive: statusFilter', function () {

  // load the directive's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));
  beforeEach(module('jsTemplates'));

  var element,
    scope,
    compile,
    html,
    $location,
    $browser,
    httpBackend,
    search,
    url;

    html = '<status-filter></status-filter>';
    url = '/cms/app/list/';

  beforeEach(inject(function ($rootScope, $httpBackend, $compile, _$location_, _$browser_) {
    scope = $rootScope.$new();
    httpBackend = $httpBackend;

    $location = _$location_;
    $browser = _$browser_;
    $location.path = url;
    $browser.poll();

    element = angular.element($compile(html)(scope));
    scope = element.scope();
    scope.$apply();

  }));

  describe('isActive', function () {
    it('should return true for All, false for others when there is no search', function () {
      expect(scope.isActive({label: 'All', key: null, value: null})).toBe(true);
      expect(scope.isActive({label: 'Hey', key: 'key', value: 'value'})).toBe(false);
    });

    it('should return true when option is in $location.search', function () {
      $location.search({key: 'value'});
      $browser.poll();
      expect(scope.isActive({label: 'Test', key: 'key', value: 'value'})).toBe(true);
    });

    it('should return true for only one option even if they have the same keys', function () {
      $location.search({key: 'value'});
      $browser.poll();
      expect(scope.isActive({label: 'Test', key: 'key', value: function(){ return 'value'; }})).toBe(true);
      expect(scope.isActive({label: 'Test', key: 'key', value: function(){ return 'othervalue'; }})).toBe(false);
    });
  });

  describe('filterByStatus', function () {
    it('should clear search when getting a null option', function () {
      scope.filterByStatus({label: 'All', key: null, value: null});
      expect($location.search()).toEqual({});
    });

    it('should add key and value to search', function () {
      scope.filterByStatus({key: 'yeah', value: 'baby'});
      expect($location.search()).toEqual({yeah: 'baby'});

      scope.filterByStatus({key: 'function', value: function(){ return 'value' }});
      expect($location.search()).toEqual({function: 'value'});
    });
  });

});
