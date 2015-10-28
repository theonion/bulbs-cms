angular.module('bulbsCmsApp.mockApi.data', [])
  .value('mockApiData', {
    // NOTE: double-quotes are used because JSON
    'content.create': {
      'title': 'A Test Article'
    },
    'content.create.response': {
      'polymorphic_ctype': 'core_article',
      'tags': [],
      'authors': [],
      'image': null,
      'absolute_url': '/article/a-test-article-1',
      'detail_image': null,
      'sponsor_image': null,
      'status': 'Draft',
      'id': 4,
      'published': null,
      'last_modified': '2014-04-08T15:35:15.118Z',
      'title': 'A Test Article',
      'slug': 'a-test-article',
      'description': '',
      'feature_type': null,
      'subhead': null,
      'indexed': true,
      'body': '',
      'client_pixel': null,
      'sponsor_name': null
    },
    'content.edit': {
      'polymorphic_ctype': 'core_article',
      'tags': [],
      'authors': [],
      'image': null,
      'absolute_url': '/article/a-test-article-1',
      'detail_image': null,
      'sponsor_image': null,
      'status': 'Draft',
      'id': 4,
      'published': null,
      'last_modified': '2014-04-08T15:35:15.118Z',
      'title': 'A Test Article!!!',
      'slug': 'a-test-article-4',
      'description': '',
      'feature_type': null,
      'subhead': null,
      'indexed': true,
      'body': '',
      'client_pixel': null,
      'sponsor_name': null
    },
    'content.edit.response': {
      'polymorphic_ctype': 'core_article',
      'tags': [],
      'authors': [],
      'image': null,
      'absolute_url': '/article/a-test-article-1',
      'detail_image': null,
      'sponsor_image': null,
      'status': 'Draft',
      'id': 4, 'published': null,
      'last_modified': '2014-04-08T15:35:15.118Z',
      'title': 'A Test Article!!!',
      'slug': 'a-test-article-4',
      'description': '',
      'feature_type': null,
      'subhead': null,
      'indexed': true,
      'body': '',
      'client_pixel': null,
      'sponsor_name': null
    },
    'content.trash': {
      'status': 'Trashed'
    },
    'content.trash.response': {
      'status': 'Trashed'
    },
    'content.publish': {
      'published': '1969-06-09T16:20-05:00'
    },
    'content.publish.response': {
      'published': '1969-06-09T16:20-05:00',
      'status': 'Published'
    },
    'content.list': {
      count: 100,
      next: '/cms/api/v1/content/?page=2',
      previous: null,
      results: [{
        polymorphic_ctype: 'content_content',
        tags: [{
          slug: 'section',
          type: 'core_section',
          id: 1,
          name: 'Section'
        }],
        authors: [{
          username: 'username',
          first_name: 'First',
          last_name: 'Last',
          id: 1
        }],
        thumbnail: {id: '1'},
        image: {
          caption: null,
          alt: null,
          id: '1'
        },
        absolute_url: '/article/slug-1',
        detail_image: {
          caption: null,
          alt: null,
          id: '1'
        },
        sponsor_image: null,
        status: 'Draft',
        id: 1,
        published: null,
        title: 'This is a draft article',
        slug: 'this-is-a-draft-article',
        feature_type: null,
        body: '<p>This is a draft article. It was written by First Last. It is a Feature Type article.</p>',
        last_modified: '2015-04-08T15:35:15.118Z'
      }, {
        polymorphic_ctype: 'content_content',
        tags: [{
          slug: 'film',
          type: 'core_section',
          id: 22,
          name: 'Film'
        }],
        authors: [{
          username: 'milquetoast',
          first_name: 'Milque',
          last_name: 'Toast',
          id: 1111
        }],
        thumbnail: {id: '2'},
        image: {
          caption: null,
          alt: null,
          id: '2'
        },
        absolute_url: '/article/article-1',
        detail_image: {
          caption: null,
          alt: null,
          id: '2'
        },
        sponsor_image: null,
        status: 'Published',
        id: 2,
        published: '2014-03-28T17:00:00Z',
        last_modified: '2014-03-27T19:13:04.074Z',
        title: 'This is an article',
        slug: 'this-is-an-article-2',
        description: '',
        feature_type: 'Feature Type 1',
        subhead: '',
        indexed: true,
        body: '<p>This is a body</p><p>This is a body</p><p>This is a body</p><p>This is a body</p><p>This is a body</p><p>This is a body</p>',
        client_pixel: null,
        sponsor_name: null
      }, {
        id: 3,
        polymorphic_ctype: 'content_content',
        feature_type: 'Big Feature',
        title: 'Some title',
        slug: 'some-title-3',
        authors: [{
          username: 'BobbyNutson',
          first_name: 'Bobby',
          last_name: 'Nutson'
        }],
        thumbnail: {id: '3'},
        image: {
          id: '3'
        }
      }, {
        id: 4,
        title: 'Far Future Article',
        feature_type: 'Feature From The Future',
        slug: 'far-future-article-4',
        polymorphic_ctype: 'content_content',
        tags: [{
          slug: 'film',
          type: 'core_section',
          id: 22,
          name: 'Film'
        }],
        authors: [{
          username: 'milquetoast',
          first_name: 'Milque',
          last_name: 'Toast',
          id: 1
        }],
        thumbnail: {id: '4'},
        image: {
          caption: null,
          alt: null,
          id: '4'
        },
        absolute_url: '/article/article-1',
        detail_image: {
          caption: null,
          alt: null,
          id: '4'
        },
        sponsor_image: null,
        status: 'Published',
        published: '2021-03-28T17:00:00Z',
        last_modified: '2014-03-27T19:13:04.074Z',
        description: '',
        subhead: '',
        indexed: true,
        body: '<p>This is a body</p><div data-type=\'image\' class=\'onion-image image inline crop-original size-medium\' data-image-id=\'1488\' data-size=\'medium\' data-crop=\'original\' data-format=\'jpg\' data-alt=\'\'><div><br></div><span class=\'caption\'>Via Weadiamedia.com</span></div><p>This is a body</p><p>This is a body</p><p>This is a body</p><p>This is a body</p><p>This is a body</p>',
        client_pixel: null,
        sponsor_name: null
      }, {
        id: 5,
        title: 'Behold: A Video',
        feature_type: 'Video Series',
        slug: 'behold-video-5',
        polymorphic_ctype: 'video',
        tags: [{
          slug: 'film',
          type: 'core_section',
          id: 22,
          name: 'Film'
        }],
        authors: [{
          username: 'reggie420',
          first_name: 'Reginald',
          last_name: 'Cunningham',
          id: 420
        }],
        thumbnail: {id: '5'},
        image: {
          caption: null,
          alt: null,
          id: '1'
        },
        absolute_url: '/article/article-1',
        video: 10118,
        sponsor_image: null,
        status: 'Published',
        published: '2001-09-03T16:20:00Z',
        last_modified: '2001-09-03T16:00:00Z',
        description: '',
        subhead: '',
        indexed: true,
        body: 'See that video up there? No? Oh.',
        client_pixel: null,
        sponsor_name: null
      }, {
        id: 6,
        title: 'No Thumbnail Here Folks',
        feature_type: 'Thumbnails On Holiday',
        slug: 'thumbnails-holiday-6',
        polymorphic_ctype: 'content_content',
        tags: [],
        authors: [{
          username: 'hsimpson',
          first_name: 'Homer',
          last_name: 'Simpson',
          id: 16832
        }],
        thumbnail: null,
        absolute_url: '/article/article-1',
        sponsor_image: null,
        status: 'Published',
        published: '2011-04-03T16:20:00Z',
        last_modified: '2011-05-03T16:00:00Z',
        description: '',
        subhead: '',
        indexed: true,
        body: 'There\'s no thumbnail here. Go away.',
        client_pixel: null,
        sponsor_name: null
      }, {
        id: 7,
        title: 'You don\'t have permission here',
        feature_type: 'Locked it down here',
        slug: 'no-permission-7',
        polymorphic_ctype: 'content_content',
        tags: [],
        authors: [{
          username: 'special',
          first_name: 'Stephanie',
          last_name: 'Pecial',
          id: 16832
        }],
        thumbnail: null,
        absolute_url: '/article/article-1',
        sponsor_image: null,
        status: 'Published',
        published: '2017-07-25T16:20:00Z',
        last_modified: '2012-05-03T16:00:00Z',
        description: '',
        subhead: '',
        indexed: true,
        body: 'Go ahead, try saving. Not happening.',
        client_pixel: null,
        sponsor_name: null
      }, {
        id: 8,
        title: 'Bad Requests Here',
        feature_type: 'You can\'t do anything right',
        slug: 'bad-request-8',
        polymorphic_ctype: 'content_content',
        tags: [],
        authors: [{
          username: 'bbrian',
          first_name: 'Bad Luck',
          last_name: 'Brian',
          id: 8410293
        }],
        thumbnail: null,
        absolute_url: '/article/article-1',
        sponsor_image: null,
        status: 'Published',
        published: '2017-07-25T16:20:00Z',
        last_modified: '2012-05-03T16:00:00Z',
        description: '',
        subhead: '',
        indexed: true,
        body: 'Go ahead, try saving. Not happening.',
        client_pixel: null,
        sponsor_name: null
      }, {
        id: 9,
        feature_type: 'Thumbnail Override Testing',
        title: 'Overridden Thumbnail',
        slug: 'overridden-thumbnail-9',
        polymorphic_ctype: 'content_content',
        tags: [],
        authors: [],
        thumbnail: {id: '1'},
        thumbnail_override: {id: '1'},
        image: {
          caption: null,
          alt: null,
          id: '3'
        },
        absolute_url: '/article/article-1',
        sponsor_image: null,
        status: 'Published',
        published: '2017-07-25T16:20:00Z',
        last_modified: '2012-05-03T16:00:00Z',
        description: '',
        subhead: '',
        indexed: true,
        body: 'This article has a thumbnail override field.',
        client_pixel: null,
        sponsor_name: null
      }, {
        id: 10,
        feature_type: 'Something Feature Type Something',
        title: 'THIS IS THE LONGEST ARTICLE TITLE IN THE HISTORY OF ARTICLE TITLES. THIS IS THE LONGEST ARTICLE TITLE IN THE HISTORY OF ARTICLE TITLES. THIS IS THE LONGEST ARTICLE TITLE IN THE HISTORY OF ARTICLE TITLES. THIS IS THE LONGEST ARTICLE TITLE IN THE HISTORY OF ARTICLE TITLES. THIS IS THE LONGEST ARTICLE TITLE IN THE HISTORY OF ARTICLE TITLES. THIS IS THE LONGEST ARTICLE TITLE IN THE HISTORY OF ARTICLE TITLES.',
        slug: 'longest-article-title',
        polymorphic_ctype: 'content_content',
        tags: [],
        authors: [],
        thumbnail: {id: '1'},
        thumbnail_override: {id: '1'},
        image: {
          caption: null,
          alt: null,
          id: '3'
        },
        absolute_url: '/article/article-1',
        sponsor_image: null,
        status: 'Published',
        published: '2017-07-25T16:20:00Z',
        last_modified: '2012-05-03T16:00:00Z',
        description: '',
        subhead: '',
        indexed: true,
        body: 'This article has a really long title.',
        client_pixel: null,
        sponsor_name: null
      }, {
        id: 11,
        feature_type: 'Something Feature Type Something',
        title: 'A Real, True, Article',
        slug: 'real-article',
        polymorphic_ctype: 'content_content',
        template_type: 'small-width',
        tags: [],
        authors: [],
        thumbnail: {id: '1'},
        thumbnail_override: {id: '1'},
        image: {
          caption: null,
          alt: null,
          id: '3'
        },
        absolute_url: '/article/article-1',
        sponsor_image: null,
        status: 'Published',
        published: '2017-07-25T16:20:00Z',
        last_modified: '2012-05-03T16:00:00Z',
        description: '',
        subhead: '',
        indexed: true,
        body: 'This article has a really long title.',
        client_pixel: null,
        sponsor_name: null
      }, {
        id: 12,
        polymorphic_ctype: 'broken_polymorphic_ctype',
        title: 'Broken polymorphic_ctype',
        slug: 'broken-polymorphic_ctype'
      }]
    },
    'things.list': [
      {'url': '/search?tags=so-you-think-you-can-dance', 'param': 'tags', 'type': 'tag', 'name': 'So You Think You Can Dance', 'value': 'so-you-think-you-can-dance'},
      {'url': '/search?feature_types=oscar-this', 'param': 'feature_types', 'type': 'feature_type', 'name': 'Oscar This', 'value': 'oscar-this'},
      {'url': '/search?feature_types=hear-this', 'param': 'feature_types', 'type': 'feature_type', 'name': 'Hear This', 'value': 'hear-this'},
      {'url': '/search?feature_types=why-do-i-own-this', 'param': 'feature_types', 'type': 'feature_type', 'name': 'Why Do I Own This?', 'value': 'why-do-i-own-this'},
      {'url': '/search?feature_types=out-this-month', 'param': 'feature_types', 'type': 'feature_type', 'name': 'Out This Month', 'value': 'out-this-month'},
      {'url': '/search?feature_types=emmy-this', 'param': 'feature_types', 'type': 'feature_type', 'name': 'Emmy This!', 'value': 'emmy-this'},
      {'url': '/search?feature_types=this-was-pop', 'param': 'feature_types', 'type': 'feature_type', 'name': 'This Was Pop', 'value': 'this-was-pop'},
      {'url': '/search?feature_types=watch-this', 'param': 'feature_types', 'type': 'feature_type', 'name': 'Watch This', 'value': 'watch-this'},
      {'url': '/search?feature_types=what-are-you-playing-this-weekend', 'param': 'feature_types', 'type': 'feature_type', 'name': 'What Are You Playing This Weekend?', 'value': 'what-are-you-playing-this-weekend'},
      {'url': '/search?feature_types=i-watched-this-on-purpose', 'param': 'feature_types', 'type': 'feature_type', 'name': 'I Watched This On Purpose', 'value': 'i-watched-this-on-purpose'}
    ],
    'tags.list': [
      {'id': 1, 'slug': 'tag-1', 'name': 'Tag 1', 'type': 'content_tag'},
      {'id': 2, 'slug': 'tag-2', 'name': 'Tag 2', 'type': 'content_tag'},
      {'id': 3, 'slug': 'tag-3', 'name': 'Tag 3', 'type': 'content_tag'},
      {'id': 4, 'slug': 'tag-4', 'name': 'Tag 4', 'type': 'content_tag'},
      {'id': 5, 'slug': 'tag-5', 'name': 'Tag 5', 'type': 'content_tag'},
      {'id': 6, 'slug': 'tag-6', 'name': 'Tag 6', 'type': 'content_tag'}
    ],
    'pzones.list': {
      count: 5,
      next: null,
      previous: null,
      results: [{
        id: 1,
        name: 'Homepage One',
        zone_length: 3
      }, {
        id: 2,
        name: 'Homepage Two',
        zone_length: 5
      }, {
        id: 3,
        name: 'Music',
        zone_length: 3
      }, {
        id: 4,
        name: 'Quizzes',
        zone_length: 3
      }, {
        id: 5,
        name: 'Business',
        zone_length: 10
      }]
    },
    'pzones.operations': [{
      'id': 0,
      'type_name': 'promotion_insertoperation',
      'pzone': 1,
      'when': moment().add(2, 'hours').toISOString(),
      'index': 0,
      'content': 1,
      'content_title': 'This is a draft article'
    }, {
      'id': 1,
      'type_name': 'promotion_replaceoperation',
      'pzone': 1,
      'when': moment().subtract(1, 'hours').toISOString(),
      'index': 0,
      'content': 1,
      'content_title': 'This is a draft article'
    }, {
      'id': 2,
      'type_name': 'promotion_deleteoperation',
      'pzone': 1,
      'when': moment().toISOString(),
      'content': 1,
      'content_title': 'This is a draft article'
    }, {
      'id': 3,
      'type_name': 'promotion_insertoperation',
      'pzone': 1,
      'when': moment().add(20, 'minutes').toISOString(),
      'index': 0,
      'content': 1,
      'content_title': 'This is a draft article'
    }, {
      'id': 4,
      'type_name': 'promotion_replaceoperation',
      'pzone': 1,
      'when': moment().add(20, 'minutes').toISOString(),
      'index': 0,
      'content': 1,
      'content_title': 'This is a draft article'
    }, {
      'id': 5,
      'type_name': 'promotion_deleteoperation',
      'pzone': 1,
      'when': moment().add(20, 'minutes').toISOString(),
      'content': 1,
      'content_title': 'This is a draft article'
    }, {
      'id': 6,
      'type_name': 'promotion_insertoperation',
      'pzone': 1,
      'when': moment().add(20, 'minutes').toISOString(),
      'index': 0,
      'content': 1,
      'content_title': 'This is a draft article'
    }, {
      'id': 7,
      'type_name': 'promotion_insertoperation',
      'pzone': 1,
      'when': moment().add(21, 'minutes').toISOString(),
      'index': 0,
      'content': 1,
      'content_title': 'This is a draft article'
    }, {
      'id': 8,
      'type_name': 'promotion_insertoperation',
      'pzone': 1,
      'when': moment().add(21, 'minutes').toISOString(),
      'index': 0,
      'content': 1,
      'content_title': 'This is a draft article'
    }, {
      'id': 9,
      'type_name': 'promotion_insertoperation',
      'pzone': 1,
      'when': moment().add(21, 'minutes').toISOString(),
      'index': 0,
      'content': 1,
      'content_title': 'This is a draft article'
    }, {
      'id': 10,
      'type_name': 'promotion_insertoperation',
      'pzone': 1,
      'when': moment().add(21, 'minutes').add(1, 'second').toISOString(),
      'index': 0,
      'content': 10,
      'content_title': 'THIS IS THE LONGEST ARTICLE TITLE IN THE HISTORY OF ARTICLE TITLES. THIS IS THE LONGEST ARTICLE TITLE IN THE HISTORY OF ARTICLE TITLES. THIS IS THE LONGEST ARTICLE TITLE IN THE HISTORY OF ARTICLE TITLES. THIS IS THE LONGEST ARTICLE TITLE IN THE HISTORY OF ARTICLE TITLES. THIS IS THE LONGEST ARTICLE TITLE IN THE HISTORY OF ARTICLE TITLES. THIS IS THE LONGEST ARTICLE TITLE IN THE HISTORY OF ARTICLE TITLES.'
    }],
    'bettycropper.detail': {
      'credit': 'No-Look Wnuk',
      'name': 'prom1985_2.jpg',
      'id': '1',
      'height': 450,
      'width': 800,
      'selections': {
        '1x1': {
          'y0': 0,
          'y1': 0,
          'x0': 0,
          'x1': 0,
          'source': 'auto'
        },
        '2x1': {
          'y0': 100,
          'y1': 250,
          'x0': 100,
          'x1': 400,
          'source': 'auto'
        },
        '3x1': {
          'y0': 200,
          'y1': 450,
          'x0': 0,
          'x1': 750,
          'source': 'auto'
        },
        '3x4': {
          'y0': 0,
          'y1': 400,
          'x0': 500,
          'x1': 800,
          'source': 'auto'
        },
        '4x3': {
          'y0': 150,
          'y1': 450,
          'x0': 400,
          'x1': 800,
          'source': 'user'
        },
        '16x9': {
          'y0': 0,
          'y1': 450,
          'x0': 0,
          'x1': 800,
          'source': 'user'
        }
      }
    },
    'changelog': [
      {
        id: 6,
        action_time: '2014-04-29T06:51:39.427Z',
        content_type: 15,
        object_id: '1',
        user: 6,
        change_message: 'Saved'
      },
      {
        id: 5,
        action_time: '2014-04-28T06:51:39.427Z',
        content_type: 15,
        object_id: '1',
        user: 1,
        change_message: 'Published'
      },
      {
        id: 4,
        action_time: '2014-04-28T06:51:39.427Z',
        content_type: 15,
        object_id: '1',
        user: 1,
        change_message: 'Scheduled'
      },
      {
        id: 3,
        action_time: '2014-04-28T06:51:21.550Z',
        content_type: 15,
        object_id: '1',
        user: 1,
        change_message: 'Waiting for Editor'
      },
      {
        id: 2,
        action_time: '2014-04-28T06:51:09.732Z',
        content_type: 15,
        object_id: '1',
        user: 1,
        change_message: 'Saved'
      },
      {
        id: 1,
        action_time: '2014-04-28T06:47:49.576Z',
        content_type: 15,
        object_id: '1',
        user: 1,
        change_message: 'Created'
      }
    ],
    'author.list': {
      count: 5,
      next: '/?next',
      previous: null,
      results: [
        {
          username: 'User1',
          first_name: 'First1',
          last_name: 'Last1',
          id: 1,
          email: 'flast1@theonion.com'
        },
        {
          username: 'User2',
          first_name: 'First2',
          last_name: 'Last2',
          id: 2,
          email: 'flast2@theonion.com'
        },
        {
          username: 'User3',
          first_name: 'First3',
          last_name: 'Last3',
          id: 3,
          email: 'flast3@theonion.com'
        },
        {
          username: 'User4',
          first_name: 'First4',
          last_name: 'Last4',
          id: 4,
          email: 'flast4@theonion.com'
        },
        {
          username: 'User5',
          first_name: 'First5',
          last_name: 'Last5',
          id: 5,
          email: 'flast5@theonion.com'
        },
        {
          username: 'User6',
          first_name: 'First6',
          last_name: 'Last6',
          id: 6,
          email: 'flast6@theonion.com'
        },
        {
          username: 'Username6',
          first_name: '',
          last_name: '',
          id: 6,
          email: 'flast6@theonion.com'
        }
      ]
    },
    'bettycropper.updateSelection': {
      'credit': 'No-Look Wnuk',
      'name': 'prom1985_2.jpg',
      'id': '1',
      'height': 450,
      'width': 800,
      'selections': {
        '1x1': {
          'y0': 0,
          'y1': 0,
          'x0': 0,
          'x1': 0
        },
        '2x1': {
          'y0': 100,
          'y1': 250,
          'x0': 100,
          'x1': 400
        },
        '3x1': {
          'y0': 200,
          'y1': 450,
          'x0': 0,
          'x1': 750
        },
        '3x4': {
          'y0': 0,
          'y1': 400,
          'x0': 500,
          'x1': 800
        },
        '4x3': {
          'y0': 150,
          'y1': 450,
          'x0': 400,
          'x1': 800
        },
        '16x9': {
          'y0': 0,
          'y1': 450,
          'x0': 0,
          'x1': 800
        }
      }
    },
    'bettycropper.new': {
      'credit': 'No-Look Wnuk',
      'name': 'prom1985_2.jpg',
      'id': '1',
      'height': 450,
      'width': 800,
      'selections': {
        '1x1': {
          'y0': 0,
          'y1': 0,
          'x0': 0,
          'x1': 0
        },
        '2x1': {
          'y0': 100,
          'y1': 250,
          'x0': 100,
          'x1': 400
        },
        '3x1': {
          'y0': 200,
          'y1': 450,
          'x0': 0,
          'x1': 750
        },
        '3x4': {
          'y0': 0,
          'y1': 400,
          'x0': 500,
          'x1': 800
        },
        '4x3': {
          'y0': 150,
          'y1': 450,
          'x0': 400,
          'x1': 800
        },
        '16x9': {
          'y0': 0,
          'y1': 450,
          'x0': 0,
          'x1': 800
        }
      }
    }
  });
