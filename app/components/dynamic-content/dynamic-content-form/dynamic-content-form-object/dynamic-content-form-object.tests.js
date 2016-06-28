'use strict';

describe('Directive: DynamicContentFormObject', function () {
  var $parentScope;
  var digest;
  var html;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.form.object');

   inject(function ($compile, $rootScope) {
     $parentScope = $rootScope.$new();

     digest = window.testHelper.directiveBuilderWithDynamicHtml(
       $compile,
       $parentScope
     );
   });
  });


  it('should render a form', function () {
    var html = angular.element(
      '<dynamic-content-form-object name="name" schema="schema" values="values">' +
      '</dynamic-content-form-object>'
    );

    $parentScope.schema = {
      fields: {}
    };
    $parentScope.values = {};

    digest(html);

    var form = html.find('form');
    expect(form.length).to.eql(1);
    expect(form.attr('name')).to.eql('name');
  });

  it('should insert dynamic fields that do have a mapping', function () {
    var html = angular.element(
      '<dynamic-content-form-object schema="schema" values="values">' +
      '</dynamic-content-form-object>'
    );

    $parentScope.schema = {
      fields: {
        title: {
          field_type: 'text',
        }
      }
    };
    $parentScope.values = {};

    digest(html);

    var field = html.find('dynamic-content-form-field-text');
    expect(field.length).to.eql(1);
    expect(field.attr('name')).to.eql('title');
    expect(field.attr('schema')).to.eql('schema.fields.title');
    expect(field.attr('ng-model')).to.eql('values.title');
  });

  it('should error out if given field type does not have a mapping', function () {
    var fieldType = 'not a real field type';
    var html = angular.element(
      '<dynamic-content-form-object schema="schema" values="values">' +
      '</dynamic-content-form-object>'
    );

    $parentScope.schema = {
      fields: {
        title: {
          field_type: fieldType,
        }
      }
    };
    $parentScope.values = {};

    expect(function () {
      digest(html);
    }).to.throw(
      BulbsCmsError,
      '<dynamic-content-form-object>: "' + fieldType + '" is not a valid field type!'
    );
  });
});

