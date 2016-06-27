'use strict';

describe('Directive: pageForm', function () {

  var $parentScope;
  var digestedScope;
  var html;
  var mockDirectiveNameKey = 'mock';
  var mockDirectiveName = 'page-form-field-mock';

  beforeEach(function () {
    module(
      'bulbs.cms.page.form',
      function ($compileProvider, $injector, $provide) {
        window.testHelper.directiveMock($compileProvider, 'pageFormFieldMock');
        window.testHelper.directiveMock($compileProvider, 'pageFormFieldText');

        var key = 'DIRECTIVE_NAMES_MAP';
        var mapCopy = angular.copy($injector.get(key));
        mapCopy[mockDirectiveNameKey] = mockDirectiveName;

        $provide.constant(key, mapCopy);
      }
    );
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();
      html = angular.element('<page-form></page-form>');
      digestedScope = window.testHelper.directiveBuilder($compile, $parentScope, html);
    });
  });

  it('should include a named form', function () {
    $parentScope.page = {
      info_data: {
        fields: {},
        values: {}
      }
    };
    html.attr('page-data', 'page.info_data');

    digestedScope();

    var form = html.find('form');
    expect(form.length).to.equal(1);
    expect(form.attr('name')).to.equal('pageForm');
  });

  it('should list out <page-form-field> elements', function () {
    $parentScope.page = {
      info_data: {
        fields: {
          title: {
            field_type: 'mock'
          },
          body: {
            field_type: 'mock'
          }
        },
        values: {}
      }
    };
    html.attr('page-data', 'page.info_data');

    digestedScope();

    expect(html.find('page-form-field-mock').length).to.equal(2);
  });

  it('should respond to adding a new field to page data', function () {
    $parentScope.page = {
      info_data: {
        fields: {
          title: {
            field_type: 'mock'
          },
          body: {
            field_type: 'mock'
          }
        },
        values: {
          title: 'hello',
          body: '<p>Something is amiss</p>'
        }
      }
    };
    html.attr('page-data', 'page.info_data');
    digestedScope();

    $parentScope.page.info_data.fields.new_field = {
      field_type: 'mock'
    };
    $parentScope.page.info_data.values.new_field = 'some new thing';
    $parentScope.$digest();

    expect(html.find('page-form-field-mock').length).to.equal(3);
  });

  it('should respond to removing a field from page data', function () {
    $parentScope.page = {
      info_data: {
        fields: {
          title: {
            field_type: 'mock'
          },
          body: {
            field_type: 'mock'
          }
        },
        values: {
          title: 'hello',
          body: '<p>Something is amiss</p>'
        }
      }
    };
    html.attr('page-data', 'page.info_data');
    digestedScope();

    delete $parentScope.page.info_data.fields.body;
    delete $parentScope.page.info_data.values.body;
    $parentScope.$digest();

    expect(html.find('page-form-field-mock').length).to.equal(1);
  });

  it('should error out if given field type does not have a mapping', function () {
    var fieldType = 'not a real field type';
    $parentScope.page = {
      info_data: {
        fields: {
          title: {
            field_type: fieldType
          }
        },
      }
    };
    html.attr('page-data', 'page.info_data');

    expect(function () {
      digestedScope();
    }).to.throw(
      BulbsCmsError,
      '<page-form>: "' + fieldType + '" is not a valid field type!'
    );
  });

  it('should render a text field when given a field with type text', function () {
    $parentScope.page = {
      info_data: {
        fields: {
          title: {
            field_type: 'text'
          }
        }
      }
    };
    html.attr('page-data', 'page.info_data');

    digestedScope();

    expect(html.find('page-form-field-text').length).to.equal(1);
  });
});
