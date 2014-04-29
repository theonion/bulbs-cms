'use strict';

describe('Directive: createContent', function () {

  // load the directive's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));
  beforeEach(module('jsTemplates'));

  var element,
    scope,
    template,
    controller,
    httpBackend,
    ifExistsElse;

  beforeEach(inject(function ($controller, $rootScope, $compile, $httpBackend, _IfExistsElse_) {
    httpBackend = $httpBackend;
    ifExistsElse = _IfExistsElse_;
    ifExistsElse.ifExistsElse = function(q, map, existsCbk, elseCbk, errorCbk) {
      return true;
    };
    element = angular.element("<create-content></create-content>");
    scope = $rootScope.$new();
    template = $compile(element)(scope);
    controller = element.controller;
  }));

  it('should call the create url', function () {
    scope.contentType = "whatever";
    httpBackend.expectPOST('/cms/api/v1/content/?doctype=whatever');
    scope.gotTags = true;
    scope.gotUser = true;
    scope.gotSave = true;
    scope.$apply();
  });

});
