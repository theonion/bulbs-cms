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
      role: 1
    },
    {
      id: 1,
      content: 12345,
      contributor: {
        id: 2,
        first_name: 'Adam',
        last_name: 'Wentz',
        username: 'awentz'
      },
      role: 2
    },
  ]);
  // Contribution Service
  $httpBackend.when('POST', new RegExp('^/cms/api/v1/content/[0-9]+/contributions/?')).respond(function (method, url, data, headers) {
    return [200, data, {}];
  });

  // ContributionRole Service
  $httpBackend.when('GET', new RegExp('^/cms/api/v1/contributions/role/?$')).respond([
    {
      id: 1,
      name: 'Author'
    },
    {
      id: 2,
      name: 'Editor'
    },
    {
      id: 3,
      name: 'Programmer'
    }
  ]);

  // ContributionReporting Service
  $httpBackend.when('GET', new RegExp('^/cms/api/v1/contributions/reporting/?')).respond([
    {
      id: 1,
      role: 'Author',
      notes: '',
      content: {
        id: 1,
        title: 'Just an Article',
        url: '/articles/just-an-article-1',
        content_type: 'Article',
        feature_type: 'ICYMI',
        published: '2011-04-03T16:20:00Z'
      },
      user: {
        id: 1,
        username: 'csinchok',
        full_name: 'Chris Sinchok',
      }
    },
    {
      id: 2,
      role: 'Editor',
      notes: 'Did a real solid job editing this',
      content: {
        id: 1,
        title: 'Just an Article',
        url: '/articles/just-an-article-1',
        content_type: 'Article',
        feature_type: 'ICYMI',
        published: '2011-04-03T16:20:00Z'
      },
      user: {
        id: 2,
        username: 'awentz',
        full_name: 'Adam Wentz',
      }
    },
    {
      id: 3,
      role: 'Lookie-Loo',
      notes: 'Just kinda sat around',
      content: {
        id: 1,
        title: 'Just an Article',
        url: '/articles/just-an-article-1',
        content_type: 'Article',
        feature_type: 'ICYMI',
        published: '2011-04-03T16:20:00Z'
      },
      user: {
        id: 1,
        username: 'sbloomfield',
        full_name: 'Sean Bloomfield',
      }
    },
  ]);

  // ContentCompliance Service
  $httpBackend.when('GET', new RegExp('^/cms/api/v1/contributions/contentreporting/?')).respond([
    {
      id: 1,
      title: 'Just an Article',
      url: '/articles/just-an-article-1',
      content_type: 'Article',
      feature_type: 'ICYMI',
      published: '2011-04-03T16:20:00Z'
    },
    {
      id: 2,
      title: 'Just an Article',
      url: '/articles/just-an-article-1',
      content_type: 'Article',
      feature_type: 'ICYMI',
      published: '2011-04-03T16:20:00Z'
    },
    {
      id: 3,
      title: 'Just an Article',
      url: '/articles/just-an-article-1',
      content_type: 'Article',
      feature_type: 'ICYMI',
      published: '2011-04-03T16:20:00Z'
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
