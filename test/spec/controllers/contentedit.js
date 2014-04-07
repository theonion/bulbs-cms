'use strict';

describe('Controller: ContenteditCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var ContenteditCtrl,
    scope;

  var initArticle = {
    polymorphic_ctype: "content_content",
    tags: [
      {
      slug: "section",
      type: "core_section",
      id: 1,
      name: "Section"
      }
    ],
    authors: [
      {
      username: "username",
      first_name: "First",
      last_name: "Last",
      id: 1
      }
    ],
    image: {
      caption: null,
      alt: null,
      id: "1"
    },
    absolute_url: "/article/slug-10",
    detail_image: {
      caption: null,
      alt: null,
      id: "1"
    },
    sponsor_image: null,
    status: "Draft",
    id: 10,
    published: null,
    title: "This is a draft article",
    slug: "this-is-a-draft-article",
    feature_type: "Feature Type",
    body: "This is a draft article. It was written by First Last. It is a Feature Type article."
  }

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ContenteditCtrl = $controller('ContenteditCtrl', {
      $scope: scope,
      content: initArticle
    });
  }));

  /*it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });*/
  it('should have string CONTENT_PARTIALS_URL in scope', function () {
    expect(typeof scope.CONTENT_PARTIALS_URL).toBe('string');
  });

  it('should have string MEDIA_ITEM_PARTIALS_URL in scope', function () {
    expect(typeof scope.MEDIA_ITEM_PARTIALS_URL).toBe('string');
  });

  it('should have string CACHEBUSTER in scope', function () {
    expect(typeof scope.CACHEBUSTER).toBe('string');
  });

  it('should have a saveArticle function in scope', function () {
    expect(scope.saveArticle).toBeDefined();
  });

});
