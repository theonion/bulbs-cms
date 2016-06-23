'use strict';

describe('Directive: pageForm', function () {

  var $parentScope;
  var digestedScope;
  var html;

  beforeEach(function () {
    module('bulbs.cms.page.form');
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();
      html = angular.element('<page-form></page-form>');
      digestedScope = window.testHelper.directiveBuilder($compile, $parentScope, html);
    });
  });

  it('should include a named form', function () {

    digestedScope();

    var form = html.find('form');
    expect(form.length).to.equal(1);
    expect(form.attr('name')).to.equal('pageForm');
  });

  it('should list out <page-form-field> elements', function () {
    $parentScope.page = {
      info_data: {
        fields: {
          title: {},
          body: {}
        },
        values: {}
      }
    };

    html.attr('page-data', 'page.info_data');
    digestedScope();

    expect(html.find('page-form-field').length).to.equal(2);
  });

  it('should respond to modifying page data', function () {
    $parentScope.page = {
      info_data: {
        fields: {
          title: {},
          body: {}
        },
        values: {
          title: 'hello',
          body: '<p>Something is amiss</p>'
        }
      }
    };
    html.attr('page-data', 'page.info_data');
    digestedScope();

    $parentScope.page.info_data.fields.newField = {};
    $parentScope.page.info_data.values.newField = 'some new thing';
    $parentScope.$digest();

    expect(html.find('page-form-field').length).to.equal(3);
  });
});
