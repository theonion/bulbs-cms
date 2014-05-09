angular.module('bulbsCmsApp.mockApi').run([
  '$httpBackend', 'mockApiData',
  function($httpBackend, mockApiData) {
    // content instance
    function getContentId(url) {
      var re = /^\/cms\/api\/v1\/content\/(\d+)\//;
      var index = re.exec(url)[1];
      return index;
    }

    $httpBackend.whenGET(/^\/cms\/api\/v1\/content\/\d+\/$/).respond(function(method, url, data) {
      var index = getContentId(url);

      var contentList = mockApiData['content.list'];

      if(index <= contentList.results.length) {
        return [200, contentList.results[index - 1]];
      } else {
        return [404, {"detail": "Not found"}];
      }
    });

    $httpBackend.whenPUT(/^\/cms\/api\/v1\/content\/\d+\/$/).respond(function(method, url, data) {
      return [200, data];
    });

    $httpBackend.whenPOST('/cms/api/v1/content/', mockApiData['content.create'])
      .respond(function(method, url, data) {
        return [201, mockApiData['content.create.response']];
      });

    $httpBackend.whenPOST(/\/cms\/api\/v1\/content\/\d+\/trash\//)
      .respond(mockApiData['content.trash.response']);

    $httpBackend.whenPOST(/\/cms\/api\/v1\/content\/\d+\/publish\//)
      .respond(mockApiData['content.publish.response']);

    // content list
    $httpBackend.whenGET(/^\/cms\/api\/v1\/content.*/).respond(mockApiData['content.list']);

    // content list
    $httpBackend.whenGET(/^\/cms\/api\/v1\/content\/(\?.*)?$/).respond(mockApiData['content.list']);

    // things
    $httpBackend.whenGET(/^\/cms\/api\/v1\/things.*/).respond(mockApiData['things.list']);

    // change log
    $httpBackend.whenGET(/^\/cms\/api\/v1\/log.*/).respond(mockApiData['changelog']);

    // users
    $httpBackend.whenGET(/^\/cms\/api\/v1\/author\/\d+\/$/).respond(function(method, url, data) {
      var re = /^\/cms\/api\/v1\/author\/(\d+)\//;
      var index = re.exec(url)[1];

      var authorList = mockApiData['author.list'];

      if(index <= authorList.results.length) {
        return [200, authorList.results[index - 1]];
      } else {
        return [404, {"detail": "Not found"}];
      }
    });

    $httpBackend.whenGET(/^\/cms\/api\/v1\/author\/.*/).respond(mockApiData['author.list']);

    $httpBackend.whenGET('/users/logout/').respond(function(method, url, data){
      return [200]
    });

    $httpBackend.whenGET(/\/users\/me\/?/).respond({
      username: "JesseWoghin",
      first_name: "Jesse",
      last_name: "Woghin",
      id: 35823,
      email: "jwoghin@theonion.com"
    });

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

    $httpBackend.whenGET('/cms/api/v1/contentlist/').respond(contentlist);
    $httpBackend.whenGET('/cms/api/v1/contentlist/1/').respond(contentlist.results[0]);
    $httpBackend.whenGET('/cms/api/v1/contentlist/2/').respond(contentlist.results[1]);
    $httpBackend.whenGET('/cms/api/v1/contentlist/3/').respond(contentlist.results[2]);
    $httpBackend.whenGET('/cms/api/v1/contentlist/4/').respond(contentlist.results[3]);
    $httpBackend.whenGET('/cms/api/v1/contentlist/5/').respond(contentlist.results[4]);

    $httpBackend.whenPUT('/cms/api/v1/contentlist/1/').respond(contentlist.results[0]);
    $httpBackend.whenPUT('/cms/api/v1/contentlist/2/').respond(contentlist.results[1]);
    $httpBackend.whenPUT('/cms/api/v1/contentlist/3/').respond(contentlist.results[2]);
    $httpBackend.whenPUT('/cms/api/v1/contentlist/4/').respond(contentlist.results[3]);
    $httpBackend.whenPUT('/cms/api/v1/contentlist/5/').respond(contentlist.results[4]);


    // templates
    $httpBackend.whenGET(/^\/views\//).passThrough();
    $httpBackend.whenGET(/^\/content_type_views\//).passThrough();
    $httpBackend.when('OPTIONS', /^http:\/\/localimages\.avclub\.com.*/).passThrough();
    $httpBackend.when('GET', /^http:\/\/localimages\.avclub\.com.*/).passThrough();
    $httpBackend.when('POST', /^http:\/\/localimages\.avclub\.com.*/).passThrough();
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
  "content.trash": {
    "status": "Trashed"
  },
  "content.trash.response": {
    "status": "Trashed"
  },
  "content.publish": {
    "published": "1969-06-09T16:20-05:00"
  },
  "content.publish.response": {
    "published": "1969-06-09T16:20-05:00",
    "status": "Published"
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
      feature_type: null,
      body: "This is a draft article. It was written by First Last. It is a Feature Type article.",
      last_modified: "2015-04-08T15:35:15.118Z"
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
      feature_type: "Big Feature",
      title: "Some title",
      slug: "some-title-3",
      authors: [{
        username: "BobbyNutson",
        first_name: "Bobby",
        last_name: "Nutson"
      }],
      image: {
        id: "1"
      }
    }, {
      id: 4,
      title: "Far Future Article",
      feature_type: "Feature From The Future",
      slug: "far-future-article-4",
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
      published: "2021-03-28T17:00:00Z",
      last_modified: "2014-03-27T19:13:04.074Z",
      description: "",
      subhead: "",
      indexed: true,
      body: "This is a body",
      client_pixel: null,
      sponsor_name: null
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
  },
  "changelog": [
    {
      id: 6,
      action_time: "2014-04-29T06:51:39.427Z",
      content_type: 15,
      object_id: "1",
      user: 6,
      change_message: "Saved"
    },
    {
      id: 5,
      action_time: "2014-04-28T06:51:39.427Z",
      content_type: 15,
      object_id: "1",
      user: 1,
      change_message: "Published"
    },
    {
      id: 4,
      action_time: "2014-04-28T06:51:39.427Z",
      content_type: 15,
      object_id: "1",
      user: 1,
      change_message: "Scheduled"
    },
    {
      id: 3,
      action_time: "2014-04-28T06:51:21.550Z",
      content_type: 15,
      object_id: "1",
      user: 1,
      change_message: "Waiting for Editor"
    },
    {
      id: 2,
      action_time: "2014-04-28T06:51:09.732Z",
      content_type: 15,
      object_id: "1",
      user: 1,
      change_message: "Saved"
    },
    {
      id: 1,
      action_time: "2014-04-28T06:47:49.576Z",
      content_type: 15,
      object_id: "1",
      user: 1,
      change_message: "Created"
    }
  ],
  "author.list": {
    count: 5,
    next: '/?next',
    previous: null,
    results: [
      {
        username: "User1",
        first_name: "First1",
        last_name: "Last1",
        id: 1,
        email: "flast1@theonion.com"
      },
      {
        username: "User2",
        first_name: "First2",
        last_name: "Last2",
        id: 2,
        email: "flast2@theonion.com"
      },
      {
        username: "User3",
        first_name: "First3",
        last_name: "Last3",
        id: 3,
        email: "flast3@theonion.com"
      },
      {
        username: "User4",
        first_name: "First4",
        last_name: "Last4",
        id: 4,
        email: "flast4@theonion.com"
      },
      {
        username: "User5",
        first_name: "First5",
        last_name: "Last5",
        id: 5,
        email: "flast5@theonion.com"
      },
      {
        username: "Username6",
        first_name: "",
        last_name: "",
        id: 6,
        email: "flast6@theonion.com"
      }
    ]
  }
});
