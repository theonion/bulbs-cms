  bulbsCmsAppDev = angular.module('bulbsCmsAppDev', ['bulbsCmsApp', 'ngMockE2E']);
  bulbsCmsAppDev.run(function($httpBackend) {

    // returns the current list of phones
    $httpBackend.whenGET(/^\/cms\/api\/v1\/content\/1\//).respond(MOCK_content.results[0]);
    $httpBackend.whenGET(/^\/cms\/api\/v1\/content.*/).respond(MOCK_content);

    // adds a new phone to the phones array
    $httpBackend.whenPOST('/phones').respond(function(method, url, data) {
      phones.push(angular.fromJson(data));
    });
    $httpBackend.whenGET(/^\/views\//).passThrough();
  });


var MOCK_content = {
  count: 100,
  next: "/cms/api/v1/content/?page=2",
  previous: null,
  results: [
    {
      polymorphic_ctype: "core_shortarticle",
      tags: [
        {
        slug: "film",
        type: "core_section",
        id: 22,
        name: "Film"
        }
      ],
      authors: [
        {
        username: "milquetoast",
        first_name: "Milque",
        last_name: "Toast",
        id: 1
        }
      ],
      image: {
        caption: null,
        alt: null,
        id: "1"
      },
      absolute_url: "/article/article-1",
      detail_image: {
        caption: null,
        alt: null,
        id: "1"
      },
      sponsor_image: null,
      status: "Published",
      id: 1,
      published: "2014-03-28T17:00:00Z",
      last_modified: "2014-03-27T19:13:04.074Z",
      title: "This is an article",
      slug: "this-is-an-article",
      description: "",
      feature_type: "Feature Type 1",
      subhead: "",
      indexed: true,
      body: "This is a body",
      client_pixel: null,
      sponsor_name: null
    },
    {
      id: 2,
      feature_type: "What A Gal",
      title: "This is another article",
      authors: [
        {
          username: "BobbyNutson",
          first_name: "Bobby",
          last_name: "Nutson"
        }
      ],
      image: {
        id: "1"
      }
    }
  ]
}