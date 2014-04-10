angular.module('bulbsCmsApp.mockApi').run([
  '$httpBackend', 'mockApiData',
  function($httpBackend, mockApiData) {
    // content instance
    $httpBackend.whenGET(/^\/cms\/api\/v1\/content\/\d+\/$/).respond(function(method, url, data) {
      var re = /^\/cms\/api\/v1\/content\/(\d+)\//;
      var index = re.exec(url)[1];
      var contentList = mockApiData['content.list'];

      if(index <= contentList.results.length) {
        return [200, contentList.results[index - 1]];
      } else {
        return [404, {"detail": "Not found"}];
      }
    });
    $httpBackend.whenPOST('/cms/api/v1/content/', mockApiData['content.create'])
      .respond(function(method, url, data) {
        return [201, mockApiData['content.create.response']];
      });
    $httpBackend.whenPUT('/cms/api/v1/content/4/', mockApiData['content.edit'])
      .respond(mockApiData['content.edit.response']);

    // content list
    $httpBackend.whenGET(/^\/cms\/api\/v1\/content.*/).respond(mockApiData['content.list']);

    // things
    $httpBackend.whenGET(/^\/cms\/api\/v1\/things.*/).respond(mockApiData['things.list']);

    // promotions contentlist
    var contentlist = {
      count: 5,
      next: null,
      previous: null,
      results: [
        {id: 1, name: 'Homepage One', length: 1, content: mockApiData['content.list'].results.slice(0,1) },
        {id: 2, name: 'Homepage Two', length: 2, content: mockApiData['content.list'].results.slice(0,2) },
        {id: 3, name: 'Music', length: 1, content: mockApiData['content.list'].results.slice(1,2) },
        {id: 4, name: 'Quizzes', length: 2, content: mockApiData['content.list'].results.slice(1,3) },
        {id: 5, name: 'Business', length: 3, content: mockApiData['content.list'].results.slice(0,3) }
      ]
    };

    $httpBackend.whenGET('/promotions/api/contentlist/').respond(contentlist);
    $httpBackend.whenGET('/promotions/api/contentlist/1/').respond(contentlist.results[0]);
    $httpBackend.whenGET('/promotions/api/contentlist/2/').respond(contentlist.results[1]);
    $httpBackend.whenGET('/promotions/api/contentlist/3/').respond(contentlist.results[2]);
    $httpBackend.whenGET('/promotions/api/contentlist/4/').respond(contentlist.results[3]);
    $httpBackend.whenGET('/promotions/api/contentlist/5/').respond(contentlist.results[4]);

    $httpBackend.whenPUT('/promotions/api/contentlist/1/').respond(contentlist.results[0]);
    $httpBackend.whenPUT('/promotions/api/contentlist/2/').respond(contentlist.results[1]);
    $httpBackend.whenPUT('/promotions/api/contentlist/3/').respond(contentlist.results[2]);
    $httpBackend.whenPUT('/promotions/api/contentlist/4/').respond(contentlist.results[3]);
    $httpBackend.whenPUT('/promotions/api/contentlist/5/').respond(contentlist.results[4]);

    // templates
    $httpBackend.whenGET(/^\/views\//).passThrough();
    $httpBackend.whenGET(/^\/content_type_views\//).passThrough();
  }
]).constant('mockApiData', {
  // NOTE: double-quotes are used because JSON
  "content.create": {
    "title": "A Test Article"
  },
  "content.create.response": {
    "polymorphic_ctype": "core_article",
    "tags": [],
    "authors": [],
    "image": null,
    "absolute_url": "/article/a-test-article-1",
    "detail_image": null,
    "sponsor_image": null,
    "status": "Draft",
    "id": 4,
    "published": null,
    "last_modified": "2014-04-08T15:35:15.118Z",
    "title": "A Test Article",
    "slug": "a-test-article",
    "description": "",
    "feature_type": null,
    "subhead": null,
    "indexed": true,
    "body": "",
    "client_pixel": null,
    "sponsor_name": null
  },
  "content.edit": {
    "polymorphic_ctype": "core_article",
    "tags": [],
    "authors": [],
    "image": null,
    "absolute_url": "/article/a-test-article-1",
    "detail_image": null,
    "sponsor_image": null,
    "status": "Draft",
    "id": 4,
    "published": null,
    "last_modified": "2014-04-08T15:35:15.118Z",
    "title": "A Test Article!!!",
    "slug": "a-test-article-4",
    "description": "",
    "feature_type": null,
    "subhead": null,
    "indexed": true,
    "body": "",
    "client_pixel": null,
    "sponsor_name": null
  },
  "content.edit.response": {
    "polymorphic_ctype": "core_article",
    "tags": [],
    "authors": [],
    "image": null,
    "absolute_url": "/article/a-test-article-1",
    "detail_image": null,
    "sponsor_image": null,
    "status": "Draft",
    "id": 4, "published": null,
    "last_modified": "2014-04-08T15:35:15.118Z",
    "title": "A Test Article!!!",
    "slug": "a-test-article-4",
    "description": "",
    "feature_type": null,
    "subhead": null,
    "indexed": true,
    "body": "",
    "client_pixel": null,
    "sponsor_name": null
  },
  "content.list": {
    count: 100,
    next: "/cms/api/v1/content/?page=2",
    previous: null,
    results: [{
      polymorphic_ctype: "content_content",
      tags: [{
        slug: "section",
        type: "core_section",
        id: 1,
        name: "Section"
      }],
      authors: [{
        username: "username",
        first_name: "First",
        last_name: "Last",
        id: 1
      }],
      image: {
        caption: null,
        alt: null,
        id: "1"
      },
      absolute_url: "/article/slug-1",
      detail_image: {
        caption: null,
        alt: null,
        id: "1"
      },
      sponsor_image: null,
      status: "Draft",
      id: 1,
      published: null,
      title: "This is a draft article",
      slug: "this-is-a-draft-article",
      feature_type: "Feature Type",
      body: "This is a draft article. It was written by First Last. It is a Feature Type article."
    }, {
      polymorphic_ctype: "content_content",
      tags: [{
        slug: "film",
        type: "core_section",
        id: 22,
        name: "Film"
      }],
      authors: [{
        username: "milquetoast",
        first_name: "Milque",
        last_name: "Toast",
        id: 1
      }],
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
      id: 2,
      published: "2014-03-28T17:00:00Z",
      last_modified: "2014-03-27T19:13:04.074Z",
      title: "This is an article",
      slug: "this-is-an-article-2",
      description: "",
      feature_type: "Feature Type 1",
      subhead: "",
      indexed: true,
      body: "This is a body",
      client_pixel: null,
      sponsor_name: null
    }, {
      id: 3,
      polymorphic_ctype: "content_content",
      feature_type: "What A Gal",
      title: "This is another article",
      slug: "this-is-another-article-3",
      authors: [{
        username: "BobbyNutson",
        first_name: "Bobby",
        last_name: "Nutson"
      }],
      image: {
        id: "1"
      }
    }]
  },
  "things.list": [
    {"url": "/search?tags=so-you-think-you-can-dance", "param": "tags", "type": "tag", "name": "So You Think You Can Dance", "value": "so-you-think-you-can-dance"},
    {"url": "/search?feature_types=oscar-this", "param": "feature_types", "type": "feature_type", "name": "Oscar This", "value": "oscar-this"},
    {"url": "/search?feature_types=hear-this", "param": "feature_types", "type": "feature_type", "name": "Hear This", "value": "hear-this"},
    {"url": "/search?feature_types=why-do-i-own-this", "param": "feature_types", "type": "feature_type", "name": "Why Do I Own This?", "value": "why-do-i-own-this"},
    {"url": "/search?feature_types=out-this-month", "param": "feature_types", "type": "feature_type", "name": "Out This Month", "value": "out-this-month"},
    {"url": "/search?feature_types=emmy-this", "param": "feature_types", "type": "feature_type", "name": "Emmy This!", "value": "emmy-this"},
    {"url": "/search?feature_types=this-was-pop", "param": "feature_types", "type": "feature_type", "name": "This Was Pop", "value": "this-was-pop"},
    {"url": "/search?feature_types=watch-this", "param": "feature_types", "type": "feature_type", "name": "Watch This", "value": "watch-this"},
    {"url": "/search?feature_types=what-are-you-playing-this-weekend", "param": "feature_types", "type": "feature_type", "name": "What Are You Playing This Weekend?", "value": "what-are-you-playing-this-weekend"},
    {"url": "/search?feature_types=i-watched-this-on-purpose", "param": "feature_types", "type": "feature_type", "name": "I Watched This On Purpose", "value": "i-watched-this-on-purpose"}
  ],
  'contentlist.list': {
    'count': 5,
    'next': null,
    'previous': null,
    'results': [
      {'id': 1, 'name': 'Homepage One'},
      {'id': 2, 'name': 'Homepage Two'},
      {'id': 3, 'name': 'Music'},
      {'id': 4, 'name': 'Quizzes'},
      {'id': 5, 'name': 'Business'}
    ]
  }
});
