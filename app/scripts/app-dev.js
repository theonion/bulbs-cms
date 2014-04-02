  bulbsCmsAppDev = angular.module('bulbsCmsAppDev', ['bulbsCmsApp', 'ngMockE2E']);
  bulbsCmsAppDev.run(function($httpBackend) {
    //GETS
    $httpBackend.whenGET(/^\/cms\/api\/v1\/content\/\d+\//).respond(function(method, url, data){
      var re = /^\/cms\/api\/v1\/content\/(\d+)\//
      var index = re.exec(url)[1];
      if(index <= MOCK_content.results.length){

        return [200, MOCK_content.results[index - 1], {}, "You did it"];
      }else{
        return [404, "Error body", {}, "You blew it"]; //todo: mock this correctly
      }
    });

    $httpBackend.whenGET(/^\/cms\/api\/v1\/content.*/).respond(MOCK_content);
    $httpBackend.whenGET(/^\/cms\/api\/v1\/things.*/).respond(MOCK_things);

    //POSTS
    //TODO: make this work
    $httpBackend.whenPOST(/^\/cms\/api\/v1\/content/).respond(function(method, url, data) {
      MOCK_content.results.push(angular.fromJson(data));
    });

    //pass through for templates
    $httpBackend.whenGET(/^\/views\//).passThrough();
    $httpBackend.whenGET(/^\/content_type_views\//).passThrough();
  });


var MOCK_content = {
  count: 100,
  next: "/cms/api/v1/content/?page=2",
  previous: null,
  results: [
    {
      polymorphic_ctype: "content_content",
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
      polymorphic_ctype: "content_content",
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

var MOCK_things = [{"url": "/search?tags=so-you-think-you-can-dance", "param": "tags", "type": "tag", "name": "So You Think You Can Dance", "value": "so-you-think-you-can-dance"}, {"url": "/search?feature_types=oscar-this", "param": "feature_types", "type": "feature_type", "name": "Oscar This", "value": "oscar-this"}, {"url": "/search?feature_types=hear-this", "param": "feature_types", "type": "feature_type", "name": "Hear This", "value": "hear-this"}, {"url": "/search?feature_types=why-do-i-own-this", "param": "feature_types", "type": "feature_type", "name": "Why Do I Own This?", "value": "why-do-i-own-this"}, {"url": "/search?feature_types=out-this-month", "param": "feature_types", "type": "feature_type", "name": "Out This Month", "value": "out-this-month"}, {"url": "/search?feature_types=emmy-this", "param": "feature_types", "type": "feature_type", "name": "Emmy This!", "value": "emmy-this"}, {"url": "/search?feature_types=this-was-pop", "param": "feature_types", "type": "feature_type", "name": "This Was Pop", "value": "this-was-pop"}, {"url": "/search?feature_types=watch-this", "param": "feature_types", "type": "feature_type", "name": "Watch This", "value": "watch-this"}, {"url": "/search?feature_types=what-are-you-playing-this-weekend", "param": "feature_types", "type": "feature_type", "name": "What Are You Playing This Weekend?", "value": "what-are-you-playing-this-weekend"}, {"url": "/search?feature_types=i-watched-this-on-purpose", "param": "feature_types", "type": "feature_type", "name": "I Watched This On Purpose", "value": "i-watched-this-on-purpose"}]