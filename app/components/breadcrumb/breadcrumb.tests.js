'use strict';

describe('Directive: superFeatureBreadcrumb', function () {
  var $parentScope;
  var digest;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.breadcrumb');
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should display given links', function () {
    $parentScope.links = [{
      label: 'The Root Link',
      href: '/my/path/to/somewhere'
    }, {
      label: 'A Lower Level Link',
      href: '/my/other/path'
    }];

    var element = digest('<breadcrumb links-list="links"></breadcrumb>');

    var links = element.find('a');
    expect(links.eq(0).html()).to.have.string($parentScope.links[0].label);
    expect(links.eq(0).attr('href')).to.equal($parentScope.links[0].href);
    expect(links.eq(1).html()).to.have.string($parentScope.links[1].label);
    expect(links.eq(1).attr('href')).to.equal($parentScope.links[1].href);
  });

  it('should update its display if list of given links changes', function () {
    $parentScope.links = [{
      label: 'The Root Link',
      href: '/my/path/to/somewhere'
    }];
    var element = digest('<breadcrumb links-list="links"></breadcrumb>');

    $parentScope.links.push({
      label: 'Lowest Levl Link',
      href: '/another/path'
    });
    $parentScope.$digest();

    var links = element.find('a');
    expect(links.eq(0).html()).to.have.string($parentScope.links[0].label);
    expect(links.eq(0).attr('href')).to.equal($parentScope.links[0].href);
    expect(links.eq(1).html()).to.have.string($parentScope.links[1].label);
    expect(links.eq(1).attr('href')).to.equal($parentScope.links[1].href);
  });

  it('should display an error if given list of links is empty', function () {
    $parentScope.links = [];

    var element = digest('<breadcrumb links-list="links"></breadcrumb>');

    expect(element.html()).to.have.string('No links to display in breadcrumb!');
  });

  it('should render static text if a member has no href', function () {
    $parentScope.links = [{
      label: 'The Root Link',
      href: '/my/path/to/somewhere'
    }, {
      label: 'A Lower Level Link'
    }];

    var element = digest('<breadcrumb links-list="links"></breadcrumb>');

    expect(element.find('a').length).to.equal(1);
    expect(element.find('.breadcrumb-link-hrefless').html())
      .to.have.string($parentScope.links[1].label);
  });

  it('should allow dynamic titles', function () {

    // TODO : add test code here
    throw new Error('Not implemented yet.');
  });

  it('should allow dynamic hrefs', function () {

    // TODO : add test code here
    throw new Error('Not implemented yet.');
  });
});
