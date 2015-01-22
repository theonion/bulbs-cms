'use strict';

describe('Directive: filterWidget', function () {

  // load the directive's module
  beforeEach(module('bulbsCmsApp'));

  var
    $scope,
    $location,
    $httpBackend,
    ContentListService,
    element;

  beforeEach(function () {
    module('bulbsCmsApp');
    module('bulbsCmsApp.mockApi');
    module('jsTemplates');

    inject(function (_$rootScope_, _$httpBackend_, $compile, _$location_, _$browser_,
        _ContentListService_) {

      ContentListService = _ContentListService_;
      spyOn(ContentListService, '$updateContent');

      $httpBackend = _$httpBackend_;

      $location = _$location_;

      element = $compile('<filter-widget></filter-widget>')(_$rootScope_.$new());
      _$rootScope_.$digest();
      $scope = element.isolateScope();
    });
  });

  it('should be able to add filters to $location', function () {
    $scope.addFilter('tag', 'tag-1');

    expect(ContentListService.$updateContent).toHaveBeenCalled();
    expect($location.search().tag).toContain('tag-1');
  });

  it('should not allow multiples of a filter value', function () {

    $scope.addFilter('tag', 'tag-1');
    $scope.addFilter('tag', 'tag-1');

    expect(ContentListService.$updateContent).toHaveBeenCalled();
    expect($location.search().tag.length).toBe(1);
    expect($location.search().tag).toContain('tag-1');
  });

});
