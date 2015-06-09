'use strict';

describe('Directive: hideIfForbidden', function () {

  // load the directive's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('cms.templates'));

  var
    CmsConfig,
    element,
    scope,
    httpBackend,
    html,
    optionsUrl403,
    optionsUrl200;

  html = '<div hide-if-forbidden options-url="{{OPTIONSURL}}">This might be hidden!</div>';

  beforeEach(inject(function ($rootScope, $httpBackend, _CmsConfig_) {
    CmsConfig = _CmsConfig_;

    scope = $rootScope.$new();
    httpBackend = $httpBackend;

    optionsUrl403 = 'return-a-403/';
    optionsUrl200 = 'return-a-200/';
  }));

  it('should make a not-forbidden element visible', inject(function ($compile) {
    httpBackend.expect('OPTIONS', CmsConfig.buildBackendApiUrl(optionsUrl200)).respond(function(){
      return [200, {detail: "Great Job"}];
    });

    var thisHtml = html.replace("{{OPTIONSURL}}", optionsUrl200)
    element = angular.element($compile(thisHtml)(scope));

    httpBackend.flush();

    expect(element.hasClass('hidden')).toBe(false);
  }));

  it('should make a forbidden element invisible', inject(function ($compile) {
    httpBackend.expect('OPTIONS', CmsConfig.buildBackendApiUrl(optionsUrl403)).respond(function(){
      return [403, {detail: "Denied"}];
    });

    var thisHtml = html.replace("{{OPTIONSURL}}", optionsUrl403);
    element = angular.element($compile(thisHtml)(scope));

    httpBackend.flush();

    expect(element.hasClass('hidden')).toBe(true);
  }));
});
