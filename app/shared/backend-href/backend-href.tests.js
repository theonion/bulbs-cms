'use strict';

describe('Filter: backendHref', function () {
  var $;
  var $compile;
  var $filter;
  var $scope;
  var cmsRoot = 'http://avclub.com';

  beforeEach(function () {
    module('backendHref', function (CmsConfigProvider) {
      CmsConfigProvider.setBackendRoot(cmsRoot);
    });

    inject(function (_$_, _$compile_, _$filter_, _$rootScope_) {
      $ = _$_;
      $compile = _$compile_;
      $filter = _$filter_;
      $scope = _$rootScope_.$new();
    });
  });

  it('should have a directive that adds an href property that is the full url', function () {
    var relUrl = '/something';
    var element = $compile('<a backend-href="\'' + relUrl + '\'"></a>')($scope.$new());
    expect($(element).attr('href')).toBe(cmsRoot + relUrl);
  });

  it('should have a filter that can transform relative urls into full urls', function () {
    var relUrl = '/something';
    expect($filter('backendHref')(relUrl)).toBe(cmsRoot + relUrl);
  });
});
