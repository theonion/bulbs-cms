'use strict';

describe('Directive: templateTypeField', function () {
  var
    $,
    $compile,
    $httpBackend,
    $element,
    $scope,
    templateTypes;

  templateTypes = [{
    name: 'Small Width',
    slug: 'small-width',
    content_type: 'content_content'
  }, {
    name: 'Large Width',
    slug: 'large-width',
    content_type: 'content_content'
  }, {
    name: 'No Use Template',
    slug: 'no-use-template',
    content_type: 'no_content_type'
  }];

  beforeEach(function () {
    module('bulbsCmsApp');
    module('bulbsCmsApp.mockApi');

    module('jsTemplates');

    angular.module('templateTypeField')
      .constant('TEMPLATE_TYPES', templateTypes);

    inject(function (_$_, _$compile_, _$httpBackend_, _$rootScope_) {
      $ = _$_;
      $compile = _$compile_;
      $httpBackend = _$httpBackend_;
      $scope = _$rootScope_.$new();

      $scope.content = {
        polymorphic_ctype: 'content_content',
        template_type: templateTypes[1].slug
      };

      var element = $compile('<template-type-field content="content"></template-type-field>')($scope.$new());
      $scope.$digest();

      $element = $(element);
    });
  });

  it('should populate with template types for given content', function () {
    var $options = $element.find('select > option');

    expect($options.length).toBe(3);
    expect($options[1].text).toBe(templateTypes[0].name);
    expect($options[2].text).toBe(templateTypes[1].name);
    expect($options[2].selected).toBe(true);
  });
});
