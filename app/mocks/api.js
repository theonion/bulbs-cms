'use strict';

angular.module('bulbsCmsApp.mockApi', [
  'ngMockE2E',

  'bulbsCmsApp.mockApi.data',

  'bulbsCmsApp.mockApi.campaign',
  'bulbsCmsApp.mockApi.customSearch',
  'bulbsCmsApp.mockApi.lineItem',
  'bulbsCmsApp.mockApi.override',
  'bulbsCmsApp.mockApi.poll',
  'bulbsCmsApp.mockApi.role',
  'bulbsCmsApp.mockApi.specialCoverage',
  'bulbsCmsApp.mockApi.sections',

  'VideohubClient.api.mocks'
])
.run([
  '$httpBackend', 'mockApiData', 'moment', '_',
  function($httpBackend, mockApiData, moment, _) {

    var today = moment();

    $httpBackend.when('OPTIONS', '/returns-a-403/').respond(function(){ //just for testing
      return [403, {'detail': 'No permission'}];
    });

    var detailRegex = /^\/cms\/api\/v1\/content\/(\d+)\/$/;
    function getContentId(url) {
      var index = detailRegex.exec(url)[1];
      return index;
    }

    function detailView(method, url, data) {
      var index = getContentId(url);

      var content = mockApiData['content.list'];

      if(index <= content.results.length) {
        return [200, content.results[index - 1]];
      } else {
        return [404, {'detail': 'Not found'}];
      }
    }
    $httpBackend.when('GET', detailRegex).respond(detailView);

    function detailPut(method, url, data) {
      var index = getContentId(url);
      if(index === 7){
        return [403, {detail: 'You do not have permission to perform this action.'}];
      }
      if(method === 'PUT' && index === 8){
        return [400, {'season': ['This field is required.'], 'episode': ['This field is required.'], 'show': ['This field is required.']}];
      }
      return [200, data];
    }
    $httpBackend.when('OPTIONS', detailRegex).respond(detailPut);
    $httpBackend.when('PUT', detailRegex).respond(detailPut);

    $httpBackend.whenPOST('/cms/api/v1/content/', mockApiData['content.create'])
      .respond(function(method, url, data) {
        return [201, mockApiData['content.create.response']];
      });

    var trashRegex = /\/cms\/api\/v1\/content\/\d+\/trash\//;
    $httpBackend.when('POST', trashRegex).respond(mockApiData['content.trash.response']);
    $httpBackend.when('OPTIONS', trashRegex).respond(mockApiData['content.trash.response']);

    var publishRegex = /\/cms\/api\/v1\/content\/\d+\/publish\//;
    $httpBackend.when('POST', publishRegex).respond(mockApiData['content.publish.response']);
    $httpBackend.when('OPTIONS', publishRegex).respond(mockApiData['content.publish.response']);

    // content tokens
    var uuid = function () {
      return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
      });
    };
    $httpBackend.when('POST', /\/cms\/api\/v1\/content\/\d+\/create_token\//).respond({
      'id': 5,
      'url_uuid': uuid(),
      'create_date': today,
      'expire_date': today.clone().add({days: 7})
    });
    $httpBackend.when('GET', /\/cms\/api\/v1\/content\/\d+\/list_tokens\//).respond([{
      'id': 1,
      'url_uuid': uuid(),
      'create_date': today,
      'expire_date': today.clone().add({days: 7})
    }, {
      'id': 2,
      'url_uuid': uuid(),
      'create_date': today,
      'expire_date': today.clone().add({days: 7})
    }, {
      'id': 3,
      'url_uuid': uuid(),
      'create_date': today,
      'expire_date': today.clone().add({days: 7})
    }]);

    // content list
    var listRegex = /^\/cms\/api\/v1\/content\/(\?.*)?$/;
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
        return [404, {'detail': 'Not found'}];
      }
    });

    $httpBackend.whenGET(/^\/cms\/api\/v1\/author\/.*/).respond(mockApiData['author.list']);

    $httpBackend.whenGET('/users/logout/').respond(function(method, url, data){
      return [200];
    });

    // videos
    mockApiData.videos = [{
      id: 1,
      site: 'ClickHole',
      sponsor: 'Cottonelle',
      name: '10 Reasons 4 ply is 4 you',
      published: moment().format()
    }, {
      id: 2,
      site: 'Onion Labs',
      name: 'Beer Beer Beer',
      published: moment().subtract(1, 'day').format()
    }, {
      id: 3,
      site: 'AV Club',
      name: 'Some really long title Some really long title Some really long title Some really long title Some really long title',
      published: moment().add(1, 'day').format()
    }];
    $httpBackend.whenPOST('/cms/api/v1/videohub-video/search_hub/').respond(function (method, url, data) {
      return [200, {
        count: mockApiData.videos.length,
        results: mockApiData.videos
      }];
    });

    // feature types
    mockApiData.feature_types = [{
      slug: 'quiz',
      id: 5,
      name: 'Quiz'
    }, {
      slug: 'slideshow',
      id: 6,
      name: 'Slideshow'
    }, {
      slug: 'article',
      id: 7,
      name: 'Article'
    }, {
      slug: 'they-said-what',
      id: 8,
      name: 'They Said What?!'
    }, {
      slug: 'some-super-long-feature-type-some-super-long-feature-type-some-super-long-feature-type-some-super-long-feature-typesome-super-long-feature-type',
      id: 8,
      name: 'Some Super Long Feature Type Some Super Long Feature Type Some Super Long Feature Type Some Super Long Feature Type Some Super Long Feature Type'
    }];
    $httpBackend.whenGET(/\/cms\/api\/v1\/feature-type\/(\?search=.*)?/).respond(mockApiData.feature_types);

    // content types
    mockApiData.content_types = [{
      name: 'Video',
      doctype: 'video'
    }, {
      name: 'Clickventure',
      doctype: 'clickventure'
    }, {
      name: 'Some Super Long Content Type Some Super Long Content Type Some Super Long Content Type Some Super Long Content Type Some Super Long Content Type',
      doctype: 'some-super-long-content-type-some-super-long-content-type-some-super-long-content-type-some-super-long-content-type-some-super-long-content-type'
    }];
    $httpBackend.whenGET(/\/cms\/api\/v1\/content-type\/(\?search=.*)?/).respond(mockApiData.content_types);

    // notifications
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
      username: 'JesseWoghin',
      first_name: 'Jesse',
      last_name: 'Woghin',
      id: 35823,
      email: 'jwoghin@theonion.com'
    });

    //sponsors
    $httpBackend.whenGET(/^\/cms\/api\/v1\/sponsor\/$/).respond([
      {
        'id': 1,
        'name': 'Sponsor 1',
        'slug': 'sponsor-1',
        'image': '1',
        'url': '',
        'pixel': '',
        'top_widget': '',
        'bottom_widget': ''
      },
      {
        'id': 2,
        'name': 'Sponsor 2',
        'slug': 'sponsor-2',
        'image': '2',
        'url': '',
        'pixel': '',
        'top_widget': '',
        'bottom_widget': ''
      },
    ]);

    // add content to pzones
    var pzones = mockApiData['pzones.list'];
    pzones.results[0].content = mockApiData['content.list'].results.slice(0,6);
    pzones.results[1].content = mockApiData['content.list'].results.slice(0,2);
    pzones.results[2].content = mockApiData['content.list'].results.slice(1,2);
    pzones.results[3].content = mockApiData['content.list'].results.slice(1,3);
    pzones.results[4].content = mockApiData['content.list'].results.slice(0,3);

    var pzoneOperationsRegex = /^\/cms\/api\/v1\/pzone\/(\d+)\/operations\/((\d+)\/)?\?(.*)$/;
    $httpBackend.whenGET(pzoneOperationsRegex).respond(function (method, url) {
      // return the operation matching given id
      var matches = url.match(pzoneOperationsRegex);

      var json = null;
      if (matches[3]) {
        // operation id provided, find it and return it
        var operationId = parseInt(matches[3], 10);
        json = _.find(mockApiData['pzones.operations'], {id: operationId});
      } else {
        // no operation id provided, return all operations for given pzone
        var pzoneId = parseInt(matches[1], 10);
        json = _.filter(mockApiData['pzones.operations'], {pzone: pzoneId});
      }

      return [200, json];
    });

    $httpBackend.when('PUT', pzoneOperationsRegex).respond(function (method, url) {
      var matches = url.match(pzoneOperationsRegex);

      var json = null;
      if (matches[0]) {
        var pzoneId = parseInt(matches[0], 10);
        json = _.find(mockApiData['pzones.list'], {id: pzoneId});
      }

      return [200, json];
    });

    $httpBackend.when('POST', pzoneOperationsRegex).respond(function (method, url, data) {
      var operations = JSON.parse(data);

      _.forEach(operations, function (operation) {
        delete operation.cleanType;
        operation.id = _.max(mockApiData['pzones.operations'], 'id').id + 1;
        operation.content_title = _.find(mockApiData['content.list'].results, {id: operation.content}).title;
        mockApiData['pzones.operations'].push(operation);
      });

      return [200, mockApiData['pzones.operations']];
    });

    $httpBackend.when('DELETE', pzoneOperationsRegex).respond(function (method, url) {
      var status = 404;
      var matches = url.match(pzoneOperationsRegex);
      if (matches[3]) {
        // operation id provided, find it and return it
        var operationId = parseInt(matches[3], 10);
        var index = _.findIndex(mockApiData['pzones.operations'], {id: operationId});
        if (index >= 0) {
          mockApiData['pzones.operations'].splice(index, 1);
          status = 203;
        }
      }
      return [status];
    });

    var pzoneRegex = /^\/cms\/api\/v1\/pzone\/(\d+)\/(\?preview=([\w\d-.:]+))?$/;
    function pzoneView (method, url, data){
      var matches = url.match(pzoneRegex);
      var id = parseInt(matches[1], 10);

      var obj = null;
      if (matches[3]) {
        // has a preview time, get preview
        obj = _.clone(_.find(pzones.results, {id: id}), true);
        // delete two entries to simulate some operations
        obj.content.splice(0,2);
      } else {
        // there is no preview time, just get without preview time
        obj = _.clone(_.find(pzones.results, {id: id}), true);
      }
      return [200, obj];
    }
    $httpBackend.when('GET', '/cms/api/v1/pzone/').respond(pzones);
    $httpBackend.when('OPTIONS', '/cms/api/v1/pzone/').respond(pzones);

    $httpBackend.when('GET', pzoneRegex).respond(pzoneView);
    $httpBackend.when('OPTIONS', pzoneRegex).respond(pzoneView);
    $httpBackend.when('PUT', pzoneRegex).respond(pzoneView);

    // TODO : adding these into mockApiData for now. they'll be generated later.
    mockApiData['pzones.list.1'] = pzones.results[0];

    // templates
    $httpBackend.whenGET(/^\/components\/(.*)\.html/).passThrough();
    $httpBackend.whenGET(/^\/shared\/(.*)\.html/).passThrough();
    $httpBackend.whenGET(/^\/views\//).passThrough();
    $httpBackend.whenGET(/^\/content_type_views\//).passThrough();
    $httpBackend.whenGET(/^src\/videohub-client\/videohub-suggest\/.*\.html$/).passThrough();

    // betty cropper
    $httpBackend.when('OPTIONS', /^http:\/\/localimages\.avclub\.com.*/).respond('');
    $httpBackend.when('GET', /^http:\/\/localimages\.avclub\.com\/api\/\d+$/)
      .respond(mockApiData['bettycropper.detail']);
    $httpBackend.when('POST', /^http:\/\/localimages\.avclub\.com\/api\/\d+\/.*$/)
      .respond(mockApiData['bettycropper.updateSelection']);
    $httpBackend.when('POST', /^http:\/\/localimages\.avclub\.com\/api\/new$/)
      .respond(mockApiData['bettycropper.new']);

    $httpBackend.when('OPTIONS', /^http:\/\/clickholeimg.local.*/).respond(404);
    $httpBackend.when('GET', /^http:\/\/clickholeimg.local.*/).respond(404);
    $httpBackend.when('POST', /^http:\/\/clickholeimg.local.*/).respond(404);

    // send to webtech (fickle)
    $httpBackend.whenPOST('/cms/api/v1/report-bug/').respond('');

    //var tokenGenerator = new FirebaseTokenGenerator('');

    // user, log in as a random user
    mockApiData.users = [
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
        is_manager: true
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
        is_manager: false
//        firebase_token: tokenGenerator.createToken({
//          id: 2,
//          username: 'bdoledoledoledoledoledole',
//          email: 'bdole@theonion.com',
//          is_staff: true
//        })
      }
    ];
    var userIndex = Math.floor(Math.random() * mockApiData.users.length);

    $httpBackend.whenGET(/\/cms\/api\/v1\/me\//).respond(mockApiData.users[userIndex]);

    $httpBackend.when('OPTIONS', '/ads/targeting/').respond('');

    // for anything that uses BC_ADMIN_URL
    $httpBackend.when('GET', /^http:\/\/local.images.com\/.*/).respond(
      'data:image/png;base64,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'
    );
  }
]);
