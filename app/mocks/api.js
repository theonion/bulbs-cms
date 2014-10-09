angular.module('bulbsCmsApp.mockApi').run([
  '$httpBackend', 'mockApiData', 'moment',
  function($httpBackend, mockApiData, moment) {

    $httpBackend.when('OPTIONS', '/returns-a-403/').respond(function(){ //just for testing
      return [403, {"detail": "No permission"}];
    });

    detailRegex = /^\/cms\/api\/v1\/content\/(\d+)\/$/;
    function getContentId(url) {
      var index = detailRegex.exec(url)[1];
      return index;
    }

    function detailView(method, url, data) {
      var index = getContentId(url);

      var contentList = mockApiData['content.list'];

      if(index <= contentList.results.length) {
        return [200, contentList.results[index - 1]];
      } else {
        return [404, {"detail": "Not found"}];
      }
    }
    $httpBackend.when('GET', detailRegex).respond(detailView);

    function detailPut(method, url, data) {
      var index = getContentId(url);
      if(index == 7){ //todo: fix this
        return [403, {detail: "You do not have permission to perform this action."}];
      }
      if(method == 'PUT' && index == 8){
        return [400, {"season": ["This field is required."], "episode": ["This field is required."], "show": ["This field is required."]}];
      }
      return [200, data];
    };
    $httpBackend.when('OPTIONS', detailRegex).respond(detailPut);
    $httpBackend.when('PUT', detailRegex).respond(detailPut);

    $httpBackend.whenPOST('/cms/api/v1/content/', mockApiData['content.create'])
      .respond(function(method, url, data) {
        return [201, mockApiData['content.create.response']];
      });

    var trashRegex = /\/cms\/api\/v1\/content\/\d+\/trash\//;
    $httpBackend.when('POST', trashRegex).respond(mockApiData['content.trash.response']);
    $httpBackend.when('OPTIONS', trashRegex).respond(mockApiData['content.trash.response']);

    var publishRegex = /\/cms\/api\/v1\/content\/\d+\/publish\//
    $httpBackend.when('POST', publishRegex).respond(mockApiData['content.publish.response']);
    $httpBackend.when('OPTIONS', publishRegex).respond(mockApiData['content.publish.response']);

    // content list
    var listRegex = /^\/cms\/api\/v1\/content\/(\?.*)?$/
    $httpBackend.when('GET', listRegex).respond(mockApiData['content.list']);
    $httpBackend.when('OPTIONS', listRegex).respond(mockApiData['content.list']);

    // things
    $httpBackend.whenGET(/^\/cms\/api\/v1\/things.*/).respond(mockApiData['things.list']);

    // tags
    $httpBackend.whenGET(/^\/cms\/api\/v1\/tag.*/).respond(mockApiData['tags.list']);

    // change log
    $httpBackend.whenGET(/^\/cms\/api\/v1\/log.*/).respond(mockApiData['changelog']);

    // users detail
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

    // notifications
    var today = moment();
    mockApiData.notifications = [{
        id: 0,
        title: 'We\'ve Made An Update!',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis aliquet risus, eget vulputate nibh. Fusce egestas porttitor libero in faucibus. Aliquam at orci eget massa tristique condimentum vel sit amet ipsum. Nulla tincidunt arcu tortor, a pulvinar mauris convallis id. Quisque imperdiet id ex ac fringilla. Aliquam fringilla dolor nec enim iaculis iaculis sed ac lacus. Nulla id condimentum magna. Aliquam dictum justo tortor, vitae blandit odio aliquet sagittis.',
        post_date: today.format(),
        notify_end_date: today.clone().add({days: 3}).format()
      },{
        id: 1,
        title: 'You Can\'t Edit Me',
        body: '<p>something something <b>bold</b></p>',
        post_date: today.format(),
        notify_end_date: today.clone().add({days: 3}).format()
      },{
        id: 2,
        title: 'I\'m Not Visible',
        post_date: today.clone().add({days: 1}).format(),
        notify_end_date: today.clone().add({days: 3}).format()
      },{
        id: 3,
        title: 'Another Update!',
        body: 'Something something.',
        post_date: today.format(),
        notify_end_date: today.clone().add({days: 3}).format()
      },{
        id: 4,
        title: 'Update Update Update!',
        body: 'All sorts of stuff added to the CMS.',
        post_date: today.format(),
        notify_end_date: today.clone().add({days: 3}).format()
    }];
    $httpBackend.whenGET('/cms/api/v1/notifications/').respond(mockApiData.notifications);
    $httpBackend.whenPOST('/cms/api/v1/notifications/').respond(200, {
      id: 5,
      title: 'New Notification',
      body: 'Ipsum ipsum ipsum. This was POSTed here.',
      post_date: today.clone().add({days: 1}).format(),
      notify_end_date: today.clone().add({days: 4}).format()
    });
    $httpBackend.whenPUT(/\/cms\/api\/v1\/notifications\/(\d+)\//).respond(200, {
      id: 5,
      title: 'Updated Notification',
      body: 'This was PUT here.',
      post_date: today.clone().add({days: 1}).format(),
      notify_end_date: today.clone().add({days: 4}).format()
    });
    $httpBackend.whenDELETE(/\/cms\/api\/v1\/notifications\/(\d+)\//).respond(200);

    //current user
    $httpBackend.whenGET(/\/users\/me\/?/).respond({
      username: "JesseWoghin",
      first_name: "Jesse",
      last_name: "Woghin",
      id: 35823,
      email: "jwoghin@theonion.com"
    });

    //sponsors
    $httpBackend.whenGET(/^\/cms\/api\/v1\/sponsor\/$/).respond([
      {
        "id": 1,
        "name": "Sponsor 1",
        "slug": "sponsor-1",
        "image": "1",
        "url": "",
        "pixel": "",
        "top_widget": "",
        "bottom_widget": ""
      },
      {
        "id": 2,
        "name": "Sponsor 2",
        "slug": "sponsor-2",
        "image": "2",
        "url": "",
        "pixel": "",
        "top_widget": "",
        "bottom_widget": ""
      },
    ]);

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


    var contentlistRegex = /^\/cms\/api\/v1\/contentlist\/(\d+)\/$/;
    function getContentlistId(url) {
      var index = contentlistRegex.exec(url)[1];
      return index - 1;
    }
    function contentlistView(method, url, data){
      var index = getContentlistId(url);
      return [200, contentlist.results[index]];
    }
    $httpBackend.when('GET', '/cms/api/v1/contentlist/').respond(contentlist);
    $httpBackend.when('OPTIONS', '/cms/api/v1/contentlist/').respond(contentlist);

    $httpBackend.when('GET', contentlistRegex).respond(contentlistView);
    $httpBackend.when('OPTIONS', contentlistRegex).respond(contentlistView);
    $httpBackend.when('PUT', contentlistRegex).respond(contentlistView);


    // adding these into mockApiData for now. they'll be generated later.
    mockApiData['contentlist.list'] = contentlist;
    mockApiData['contentlist.list.1'] = contentlist.results[0];

    // templates
    $httpBackend.whenGET(/^\/views\//).passThrough();
    $httpBackend.whenGET(/^\/content_type_views\//).passThrough();

    // betty cropper
    $httpBackend.when('OPTIONS', /^http:\/\/localimages\.avclub\.com.*/).respond('');
    $httpBackend.when('GET', /^http:\/\/localimages\.avclub\.com\/api\/\d+$/)
      .respond(mockApiData['bettycropper.detail']);
    $httpBackend.when('POST', /^http:\/\/localimages\.avclub\.com\/api\/\d+\/.*$/)
      .respond(mockApiData['bettycropper.updateSelection']);
    $httpBackend.when('POST', /^http:\/\/localimages\.avclub\.com\/api\/new$/)
      .respond(mockApiData['bettycropper.new']);

    $httpBackend.when('OPTIONS', /^http:\/\/clickholeimg.local.*/).passThrough();
    $httpBackend.when('GET', /^http:\/\/clickholeimg.local.*/).passThrough();
    $httpBackend.when('POST', /^http:\/\/clickholeimg.local.*/).passThrough();

    // send to webtech (fickle)
    $httpBackend.whenPOST('/cms/api/v1/report-bug/').respond('');

    //var tokenGenerator = new FirebaseTokenGenerator('');

    // user, log in as a random user
    var users = [
      {
        id: 0,
        username: 'admin',
        email: 'webtech@theonion.com',
        first_name: 'Herman',
        last_name: 'Zweibel',
        is_superuser: true,
//        firebase_token: tokenGenerator.createToken({
//          id: 0,
//          username: 'admin',
//          email: 'webtech@theonion.com',
//          is_staff: true
//        })
      },
      {
        id: 1,
        username: 'jadams',
        email: 'jadams@theonion.com',
        first_name: 'John',
        last_name: 'Adams',
//        firebase_token: tokenGenerator.createToken({
//          id: 1,
//          username: 'jadams',
//          email: 'jadams@theonion.com',
//          is_staff: true
//        })
      },
      {
        id: 2,
        username: 'bdoledoledoledoledoledole',
        email: 'bdole@theonion.com',
        first_name: 'Bob',
        last_name: 'Dole Dole Dole Dole Dole Dole',
//        firebase_token: tokenGenerator.createToken({
//          id: 2,
//          username: 'bdoledoledoledoledoledole',
//          email: 'bdole@theonion.com',
//          is_staff: true
//        })
      }
    ];
    var userIndex = Math.floor(Math.random() * users.length);
    $httpBackend.whenGET('/cms/api/v1/me/').respond(users[userIndex]);

    $httpBackend.when('OPTIONS', '/ads/targeting/').respond('');

    // for anything that uses BC_ADMIN_URL
    $httpBackend.when('GET', /^http:\/\/localimages\.avclub\.com\/avclub.*/).respond('');
  }
]).value('mockApiData', {
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
      thumbnail: {id: "1"},
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
      body: "<p>This is a draft article. It was written by First Last. It is a Feature Type article.</p>",
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
        id: 1111
      }],
      thumbnail: {id: "2"},
      image: {
        caption: null,
        alt: null,
        id: "2"
      },
      absolute_url: "/article/article-1",
      detail_image: {
        caption: null,
        alt: null,
        id: "2"
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
      body: "<p>This is a body</p><p>This is a body</p><p>This is a body</p><p>This is a body</p><p>This is a body</p><p>This is a body</p>",
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
      thumbnail: {id: "3"},
      image: {
        id: "3"
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
      thumbnail: {id: "4"},
      image: {
        caption: null,
        alt: null,
        id: "4"
      },
      absolute_url: "/article/article-1",
      detail_image: {
        caption: null,
        alt: null,
        id: "4"
      },
      sponsor_image: null,
      status: "Published",
      published: "2021-03-28T17:00:00Z",
      last_modified: "2014-03-27T19:13:04.074Z",
      description: "",
      subhead: "",
      indexed: true,
      body: "<p>This is a body</p><div data-type=\"image\" class=\"onion-image image inline crop-original size-medium\" data-image-id=\"1488\" data-size=\"medium\" data-crop=\"original\" data-format=\"jpg\" data-alt=\"\"><div><br></div><span class=\"caption\">Via Weadiamedia.com</span></div><p>This is a body</p><p>This is a body</p><p>This is a body</p><p>This is a body</p><p>This is a body</p>",
      client_pixel: null,
      sponsor_name: null
    }, {
      id: 5,
      title: "Behold: A Video",
      feature_type: "Video Series",
      slug: "behold-video-5",
      polymorphic_ctype: "video",
      tags: [{
        slug: "film",
        type: "core_section",
        id: 22,
        name: "Film"
      }],
      authors: [{
        username: "reggie420",
        first_name: "Reginald",
        last_name: "Cunningham",
        id: 420
      }],
      thumbnail: {id: "5"},
      image: {
        caption: null,
        alt: null,
        id: "1"
      },
      absolute_url: "/article/article-1",
      video: 10118,
      sponsor_image: null,
      status: "Published",
      published: "2001-09-03T16:20:00Z",
      last_modified: "2001-09-03T16:00:00Z",
      description: "",
      subhead: "",
      indexed: true,
      body: "See that video up there? No? Oh.",
      client_pixel: null,
      sponsor_name: null
    }, {
      id: 6,
      title: "No Thumbnail Here Folks",
      feature_type: "Thumbnails On Holiday",
      slug: "thumbnails-holiday-6",
      polymorphic_ctype: "content_content",
      tags: [],
      authors: [{
        username: "hsimpson",
        first_name: "Homer",
        last_name: "Simpson",
        id: 16832
      }],
      thumbnail: null,
      absolute_url: "/article/article-1",
      sponsor_image: null,
      status: "Published",
      published: "2011-04-03T16:20:00Z",
      last_modified: "2011-05-03T16:00:00Z",
      description: "",
      subhead: "",
      indexed: true,
      body: "There's no thumbnail here. Go away.",
      client_pixel: null,
      sponsor_name: null
    }, {
      id: 7,
      title: "You don't have permission here",
      feature_type: "Locked it down here",
      slug: "no-permission-7",
      polymorphic_ctype: "content_content",
      tags: [],
      authors: [{
        username: "special",
        first_name: "Stephanie",
        last_name: "Pecial",
        id: 16832
      }],
      thumbnail: null,
      absolute_url: "/article/article-1",
      sponsor_image: null,
      status: "Published",
      published: "2017-07-25T16:20:00Z",
      last_modified: "2012-05-03T16:00:00Z",
      description: "",
      subhead: "",
      indexed: true,
      body: "Go ahead, try saving. Not happening.",
      client_pixel: null,
      sponsor_name: null
    }, {
      id: 8,
      title: "Bad Requests Here",
      feature_type: "You can't do anything right",
      slug: "bad-request-8",
      polymorphic_ctype: "content_content",
      tags: [],
      authors: [{
        username: "bbrian",
        first_name: "Bad Luck",
        last_name: "Brian",
        id: 8410293
      }],
      thumbnail: null,
      absolute_url: "/article/article-1",
      sponsor_image: null,
      status: "Published",
      published: "2017-07-25T16:20:00Z",
      last_modified: "2012-05-03T16:00:00Z",
      description: "",
      subhead: "",
      indexed: true,
      body: "Go ahead, try saving. Not happening.",
      client_pixel: null,
      sponsor_name: null
    }, {
      id: 9,
      feature_type: "Thumbnail Override Testing",
      title: "Overridden Thumbnail",
      slug: "overridden-thumbnail-9",
      polymorphic_ctype: "content_content",
      tags: [],
      authors: [],
      thumbnail: {id: "1"},
      thumbnail_override: {id: "1"},
      image: {
        caption: null,
        alt: null,
        id: "3"
      },
      absolute_url: "/article/article-1",
      sponsor_image: null,
      status: "Published",
      published: "2017-07-25T16:20:00Z",
      last_modified: "2012-05-03T16:00:00Z",
      description: "",
      subhead: "",
      indexed: true,
      body: "This article has a thumbnail override field.",
      client_pixel: null,
      sponsor_name: null
    }]
  },
  'things.list': [
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
  'tags.list': [
    {'id': 1, 'slug': 'tag-1', 'name': 'Tag 1', 'type': 'content_tag'},
    {'id': 2, 'slug': 'tag-2', 'name': 'Tag 2', 'type': 'content_tag'},
    {'id': 3, 'slug': 'tag-3', 'name': 'Tag 3', 'type': 'content_tag'},
    {'id': 4, 'slug': 'tag-4', 'name': 'Tag 4', 'type': 'content_tag'},
    {'id': 5, 'slug': 'tag-5', 'name': 'Tag 5', 'type': 'content_tag'},
    {'id': 6, 'slug': 'tag-6', 'name': 'Tag 6', 'type': 'content_tag'}
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
  "bettycropper.detail": {
    "credit": "No-Look Wnuk",
    "name": 'prom1985_2.jpg',
    "id": '1',
    "height": 450,
    "width": 800,
    "selections": {
      "1x1": {
        "y0": 0,
        "y1": 0,
        "x0": 0,
        "x1": 0,
        "source": "auto"
      },
      "2x1": {
        "y0": 100,
        "y1": 250,
        "x0": 100,
        "x1": 400,
        "source": "auto"
      },
      "3x1": {
        "y0": 200,
        "y1": 450,
        "x0": 0,
        "x1": 750,
        "source": "auto"
      },
      "3x4": {
        "y0": 0,
        "y1": 400,
        "x0": 500,
        "x1": 800,
        "source": "auto"
      },
      "4x3": {
        "y0": 150,
        "y1": 450,
        "x0": 400,
        "x1": 800,
        "source": "user"
      },
      "16x9": {
        "y0": 0,
        "y1": 450,
        "x0": 0,
        "x1": 800,
        "source": "user"
      }
    }
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
  },
  'bettycropper.updateSelection': {
    "credit": "No-Look Wnuk",
    "name": 'prom1985_2.jpg',
    "id": '1',
    "height": 450,
    "width": 800,
    "selections": {
      "1x1": {
        "y0": 0,
        "y1": 0,
        "x0": 0,
        "x1": 0
      },
      "2x1": {
        "y0": 100,
        "y1": 250,
        "x0": 100,
        "x1": 400
      },
      "3x1": {
        "y0": 200,
        "y1": 450,
        "x0": 0,
        "x1": 750
      },
      "3x4": {
        "y0": 0,
        "y1": 400,
        "x0": 500,
        "x1": 800
      },
      "4x3": {
        "y0": 150,
        "y1": 450,
        "x0": 400,
        "x1": 800
      },
      "16x9": {
        "y0": 0,
        "y1": 450,
        "x0": 0,
        "x1": 800
      }
    }
  },
  'bettycropper.new': {
    "credit": "No-Look Wnuk",
    "name": 'prom1985_2.jpg',
    "id": '1',
    "height": 450,
    "width": 800,
    "selections": {
      "1x1": {
        "y0": 0,
        "y1": 0,
        "x0": 0,
        "x1": 0
      },
      "2x1": {
        "y0": 100,
        "y1": 250,
        "x0": 100,
        "x1": 400
      },
      "3x1": {
        "y0": 200,
        "y1": 450,
        "x0": 0,
        "x1": 750
      },
      "3x4": {
        "y0": 0,
        "y1": 400,
        "x0": 500,
        "x1": 800
      },
      "4x3": {
        "y0": 150,
        "y1": 450,
        "x0": 400,
        "x1": 800
      },
      "16x9": {
        "y0": 0,
        "y1": 450,
        "x0": 0,
        "x1": 800
      }
    }
  }
});
