'use strict';

angular.module('bulbs.api.mock', []).run(function ($httpBackend) {
  $httpBackend.when('OPTIONS', /^\/cms\/api\/v1\/.*/).respond('');

  // Authors Service
  $httpBackend.when('GET', /^\/cms\/api\/v1\/author\/?\?.*/).respond([
    {
      id: 1,
      first_name: 'T. Herman',
      last_name: 'Zweibel',
      username: 'tzwiebel'
    },
    {
      id: 2,
      first_name: 'Chris',
      last_name: 'Sinchok',
      username: 'csinchok'
    },
    {
      id: 3,
      first_name: 'Adam',
      last_name: 'Wentz',
      username: 'csinchok'
    },
    {
      id: 4,
      first_name: 'Andrew',
      last_name: 'Kos',
      username: 'akos'
    },
    {
      id: 5,
      first_name: 'Shawn',
      last_name: 'Cook',
      username: 'scook'
    }
  ]);
  $httpBackend.when('GET', /^\/cms\/api\/v1\/author\/\d+/).respond({
    id: 2,
    first_name: 'Chris',
    last_name: 'Sinchok',
    username: 'csinchok'
  });

  // Contribution Service
  $httpBackend.when('GET', new RegExp('^/cms/api/v1/content/[0-9]+/contributions/?$')).respond([
    {
      id: 1,
      content: 12345,
      contributor: {
        id: 2,
        first_name: 'Chris',
        last_name: 'Sinchok',
        username: 'csinchok'
      },
      force_payment: false,
      payment_date: '2015-8-14',
      rate: 60,
      override_rate: 100,
      role: {
        id: 1,
        name: 'Author',
        description: 'eh',
        payment_type: 'Flat Rate',
        rates: {
          'flat_rate': {
            updated_on: '2015-07-13T20:14:48.573940Z',
            rate: 100
          },
          'hourly': {
            updated_on: '2015-07-14T20:14:48.573940Z',
            rate: 60
          },
          feature_type: [
            {
              feature_type: '100 Episodes',
              updated_on: '2015-08-14T20:14:48.473940Z',
              rate: 100
            }, {
              feature_type: '11 Question',
              rate: 11
            }, {
              feature_type: '13 Days of Christmas',
              updated_on: '2015-08-14T20:14:48.473940Z',
              rate: 13
            }, {
              feature_type: '15 Minutes or Less',
              updated_on: '2015-08-14T20:14:48.473940Z',
              rate: 15
            }, {
              feature_type: '24 Hours Of',
              updated_on: '2015-08-14T20:14:48.473940Z',
              rate: 5
          }]
        }
      }
    },
    {
      id: 2,
      content: 12345,
      contributor: {
        id: 2,
        first_name: 'Adam',
        last_name: 'Wentz',
        username: 'awentz'
      },
      force_payment: true,
      payment_date: null,
      rate: 70,
      override_rate: null,
      role: {
        id: 2,
        name: 'Editor',
        description: 'eh',
        payment_type: 'Flat Rate',
        rates: {
          'flat_rate': {
              name: 'Flat Rate',
              rate: 200
          },
          'hourly': {name: 'Hourly', rate: 400}
        }
      }
    },
    {
      id: 3,
      content: 12345,
      contributor: {
        id: 3,
        first_name: 'Cameron',
        last_name: 'Lowe',
        username: 'Favorite Guy'
      },
      force_payment: false,
      payment_date: null,
      rate: 50,
      override_rate: null,
      role: {
        id: 3,
        name: 'Programmer',
        description: 'meh',
        payment_type: 'Manual',
        rates: {
          'flat_rate': {
            id: 3,
            name: 'Flat Rate',
            updated_on: '2015-07-15T20:14:48.573940Z',
            rate: 50
          },
          'Hourly': {
            id: 4,
            name: 'Hourly',
            updated_on: '2015-07-16T20:14:48.573940Z'
          }
        }
      }
    }
  ]);
  // Contribution Service
  $httpBackend.when('POST', new RegExp('^/cms/api/v1/content/[0-9]+/contributions/?')).respond(function (method, url, data, headers) {
    return [200, data, {}];
  });

  // Contribuor List
  $httpBackend.when('GET', new RegExp('^/cms/api/v1/contributions/contributors/?')).respond([
    {
      contributor: {
        full_name: 'Chris Sinchock'
      },
      count: 5,
      pay: 600,
      payment_date: '2015-05-01T16:20:00Z'
    },
    {
      contributor: {
        full_name: 'Cam Lowe'
      },
      count: 8,
      pay: 800,
      payment_date: '2015-05-01T16:20:00Z'
    },
    {
      contributor: {
        full_name: 'Andrew Kos'
      },
      count: 2,
      pay: 100,
      payment_date: '2015-05-01T16:20:00Z'
    }
  ]);

  $httpBackend.when('GET', new RegExp('^/cms/api/v1/contributions/role/3/feature_type_rates/?')).respond(function (method, url, data, headers) {
      if (url.indexOf('page=2') > -1) {
        return [200, {
          count: 20,
          results: [{
            id: 4,
            feature_type: 'garbage',
            rate: 20
          }, {
            id: 5,
            feature_type: 'speed',
            rate: 21
          }, {
            id: 6,
            feature_type: 'monster',
            rate: 22
          }, {
            id: 7,
            feature_type: 'argument',
            rate: 23
          }]
        }];
      } else {
        return [200, {
          count: 20,
          next: 'page=2',
          results: [{
            id: 1,
            feature_type: 'surf',
            rate: 20
          }, {
            id: 2,
            feature_type: 'hang',
            rate: 21
          }, {
            id: 3,
            feature_type: 'ball',
            rate: 22
          }, {
            id: 4,
            feature_type: 'argument',
            rate: 23
          }]
        }];
    }
  });

  $httpBackend.when('GET', new RegExp('^/cms/api/v1/contributions/role/3/hourly_rates/?')).respond(function (method, url, data, headers) {
      return [200, {
        count: 0,
        results: []
      }];
  });

  // ContributionRole Service
  $httpBackend.when('GET', new RegExp('^/cms/api/v1/contributions/role/?$')).respond([
    {
      id: 1,
      name: 'Author',
      description: 'eh',
      payment_type: 'Manual'
    },
    {
      id: 2,
      name: 'Editor',
      description: 'eh',
      payment_type: 'Flat Rate',
    },
    {
      id: 3,
      name: 'Programmer',
      description: 'meh',
      payment_type: 'Manual',
    }
  ]);


  $httpBackend.when('GET', new RegExp('^/cms/api/v1/contributions/rate-overrides/?')).respond([
    {
      id: 1,
      contributor: {
        id: 1,
        first_name: 'Big',
        last_name: 'Papa',
        full_name: 'Big Papa'
      },
      role: {
        id: 1,
        name: 'Author'
      }
    },
    {
      id: 2,
      contributor: {
        id: 2,
        full_name: 'Medium Papa',
        first_name: 'Medium',
        last_name: 'Papa'
      },
      role: {
        id: 2,
        name: 'Fun Person'
      }
    },
    {
      id: 3,
      contributor: {
            full_name: 'Small Papa',
            first_name: 'Small',
            last_name: 'Papa'
      },
      role: {
        id: 3,
        name: 'Dumb Person'
      }
    }
  ]);

  // LineItem Service
  $httpBackend.when('GET', new RegExp('^/cms/api/v1/contributions/line-items/?')).respond([
    {
      id:1,
      contributor: 'Alasdair Wilkins',
      amount: 25,
      note: 'A Note for the ages',
      date: '2015-05-01T16:20:00Z'
    },
    {
      id:2,
      contributor: 'Brandon Nowalk',
      amount: 100,
      note: 'Simpson Week 2015 Illustration',
      date: '2015-05-01T16:20:00Z'
    },
    {
      id:3,
      contributor: 'Cameron Esposito',
      amount: 120,
      note: 'Something Else',
      date: '2015-05-01T16:20:00Z'
    },
    {
      id:4,
      contributor: 'Carline Framke',
      amount: 25,
      note: 'Something Else',
      date: '2015-05-01T16:20:00Z'
    },
    {
      id:5,
      contributor: 'Jason Heller',
      amount: 35,
      note: 'Something Else',
      date: '2015-05-01T16:20:00Z'
    }
  ]);

  // ContributionReporting Service
  $httpBackend.when('GET', new RegExp('^/cms/api/v1/contributions/reporting/?')).respond(
    {
      count: 1092,
      next: 'http://avclub.local/cms/api/v1/contributions/reporting/?ordering=user&page=2&start=2015-11-02',
      previous: null,
      results: [
      {
        id:1870,
        content:{
          id: 228596,
          title:'In its first episode, <i>The Man In The High Castle</i> builds a world but not its characters',
          url: '/tvclub/its-first-episode-man-high-castle-builds-world-not-228596',
          content_type: 'TVEpisodeReview_ElasticSearchResult',
          feature_type: 'TV Club',
          published: '2015-11-20T12:00:00-06:00'
        },
        user: {
          username:'GwenIhnat',
          id: 154186,
          full_name: 'Gwen Ihnat'
        },
        pay: 80,
        role: 'FeatureType',
        rate: 80,
        notes:null
      },{
        id: 1882,
        content: {
          id: 228596,
          title:'In its first episode, <i>The Man In The High Castle</i> builds a world but not its characters',
          url:'/tvclub/its-first-episode-man-high-castle-builds-world-not-228596',
          content_type:'TVEpisodeReview_ElasticSearchResult',
          feature_type: 'TV Club',
          published: '2015-11-20T12:00:00-06:00'},
          user:{
            username: 'A.A.Dowd',
            id:148035,
            full_name:'A.A. Dowd'
          },
          pay:80,
          role: 'FeatureType',
          rate: 80,
          notes: null
      },{
        id: 1887,
        content: {
          id:228596,
          title: 'In its first episode, <i>The Man In The High Castle</i> builds a world but not its characters',
          url: '/tvclub/its-first-episode-man-high-castle-builds-world-not-228596',
          content_type: 'TVEpisodeReview_ElasticSearchResult',
          feature_type: 'TV Club',
          published: '2015-11-20T12:00:00-06:00'
        },
        user: {
          username:'rockmarooned',
          id:70523,
          full_name:'Jesse Hassenger'
        },
        pay: 80,
        role:'FeatureType',
        rate: 80,
        notes:null
      },{
        id: 1921,
        content: {
          id: 228596,
          title: 'In its first episode, <i>The Man In The High Castle</i> builds a world but not its characters',
          url: '/tvclub/its-first-episode-man-high-castle-builds-world-not-228596',
          content_type: 'TVEpisodeReview_ElasticSearchResult',
          feature_type: 'TV Club',
          published: '2015-11-20T12:00:00-06:00'
        },
        user: {
          username: 'Carrie Raisler',
          id:77153,
          full_name: 'Carrie Raisler'
        },
        pay: 100,
        role:'FeatureType',
        rate: 80,
        notes:null
      }
    ]}
  );

  // ContentCompliance Service
  $httpBackend.when('GET', new RegExp('^/cms/api/v1/contributions/contentreporting/?')).respond([
    {
      id: 1,
      title: 'Just an Article',
      url: '/articles/just-an-article-1',
      content_type: 'Article',
      feature_type: 'ICYMI',
      published: '2011-04-03T16:20:00Z',
      value: '$' + 670,
      contributor: {
        full_name: 'Chris Sinchock'
      }
    },
    {
      id: 2,
      title: 'Another stand out article',
      url: '/articles/another-stand-out-2',
      content_type: 'Article',
      feature_type: 'ICYMI',
      published: '2011-04-03T16:20:00Z',
      value: '$' + 178,
      contributor: {
        full_name: 'Big Cam'
      }
    },
    {
      id: 3,
      title: 'Perhaps this article is just fine',
      url: '/articles/perhaps-this-article-3',
      content_type: 'Article',
      feature_type: 'ICYMI',
      published: '2011-04-03T16:20:00Z',
      value: '$' + 300,
      contributor: {
        full_name: 'Top Dog'
      }
    }
  ]);

  $httpBackend.when('GET', new RegExp('^/cms/api/v1/contributions/freelancereporting/?')).respond([
    {
      id: 1,
      contributor: {
        id: 1,
        full_name: 'Chris Sinchock'
      },
      payment_date: '2011-04-03T16:20:00Z',
      pay: 500,
      contributions_count: 2
    },
    {
      id: 2,
      contributor: {
        id: 2,
        full_name: 'Big Vinnie'
      },
      payment_date: '2011-04-05T16:20:00Z',
      pay: 1200,
      contributions_count: 10
    },
    {
      id: 3,
      contributor: {
        id: 3,
        full_name: 'Doppelgang man'
      },
      payment_date: '2011-04-03T16:20:00Z',
      pay: 30,
      contributions_count: 1000
    }
  ]);

  // TODO: Do this better.
  $httpBackend.when('GET', new RegExp('^/cms/api/v1/content/[0-9]+/?$')).respond({
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
  });

});
