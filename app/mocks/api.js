'use strict';

angular.module('bulbsCmsApp.mockApi', [
  'moment',
  'ngMockE2E',

  'bulbsCmsApp.mockApi.data',

  'bulbsCmsApp.mockApi.campaign',
  'bulbsCmsApp.mockApi.customSearch',
  'bulbsCmsApp.mockApi.lineItem',
  'bulbsCmsApp.mockApi.override',
  'bulbsCmsApp.mockApi.notification',
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

    var detailRegex = /^\/cms\/api\/v1\/(content|super-feature)\/(\d+)\/?$/;
    function getContentId(url) {
      var index = detailRegex.exec(url)[2];
      return index;
    }

    function detailView(method, url, data) {
      var id = parseInt(getContentId(url), 10);

      var content = mockApiData['content.list'].results.find(function (content) {
        return content.id === id;
      });

      if (content) {
        return [200, content];
      } else {
        return [404, {'detail': 'Not found'}];
      }
    }
    $httpBackend.when('GET', detailRegex).respond(detailView);

    $httpBackend.when('OPTIONS', detailRegex).respond(function (method, url, data) {
      var index = getContentId(url);
      if (method === 'OPTIONS' && index === 7){
        return [403, {detail: 'You do not have permission to perform this action.'}];
      } else {
        var schema = mockApiData['dynamicContent.schemas'][Number(index)];
        return [200, schema];
      }
    });
    $httpBackend.when('PUT', detailRegex).respond(function (method, url, data) {
      var index = getContentId(url);
      if (method === 'PUT' && index === 8){
        return [400, {'season': ['This field is required.'], 'episode': ['This field is required.'], 'show': ['This field is required.']}];
      }
      return [200, data];
    });

    $httpBackend.whenPOST(/\/cms\/api\/v1\/content\/\?doctype=(.*)$/)
      .respond(function(method, url, data) {
        var contents = mockApiData['content.list'].results;
        var newId = _.max(mockApiData['content.list'].results, 'id').id + 1;
        var newData = { id: newId };

        contents.push(_.assign(newData, JSON.parse(data)));

        return [201, newData];
      });

    $httpBackend.whenDELETE(/\/cms\/api\/v1\/content\/\d+\/?/).respond(204);

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

    // live blogs
    var liveBlogEntryListRegex = /\/cms\/api\/v1\/liveblog\/entry\/?\?liveblog=(\d+)$/;
    var liveBlogEntryDetailRegex = /\/cms\/api\/v1\/liveblog\/entry\/(\d+)\/?$/
    var liveBlogEntryRegex = /\/cms\/api\/v1\/liveblog\/entry\/?$/
    var liveBlogEntryResponseDetailRegex = /\/cms\/api\/v1\/liveblog\/entry\/(\d+)\/responses\/(\d+)\/?$/;
    var liveBlogEntryResponseRegex = /\/cms\/api\/v1\/liveblog\/entry\/(\d+)\/responses\/?$/;

    $httpBackend.whenGET(liveBlogEntryListRegex)
      .respond(function (method, url, data) {
        var liveBlogId = parseInt(liveBlogEntryListRegex.exec(url)[1], 10);

        return [200, {
          results: mockApiData['liveblog.entries'].filter(function (entry) {
            return entry.liveblog === liveBlogId;
          })
        }];
      });
    $httpBackend.whenPOST(liveBlogEntryRegex)
      .respond(function (method, url, data) {
        var entries = mockApiData['liveblog.entries']
        var newId = _.max(mockApiData['liveblog.entries'], 'id').id + 1;
        var newData = { id: newId };

        entries.push(_.assign(newData, JSON.parse(data)));

        return [201, newData];
      });
    $httpBackend.whenPUT(liveBlogEntryDetailRegex)
      .respond(function (method, url, data) {
        var liveBlogId = parseInt(liveBlogEntryDetailRegex.exec(url)[1], 10);

        var index = mockApiData['liveblog.entries'].findIndex(function (entry) {
          return entry.id === liveBlogId;
        });
        mockApiData['liveblog.entries'][index] = data;

        return [200, data];
      });
    $httpBackend.whenDELETE(liveBlogEntryDetailRegex)
      .respond(function (method, url, data) {
        var liveBlogId = parseInt(liveBlogEntryDetailRegex.exec(url)[1], 10);

        var index = mockApiData['liveblog.entries'].findIndex(function (entry) {
          return entry.id === liveBlogId;
        });

        mockApiData['liveblog.entries'].splice(index, 1);

        return [201, ''];
      });
    $httpBackend.whenGET(liveBlogEntryResponseRegex)
      .respond(function (method, url, data) {
        var entryId = parseInt(liveBlogEntryResponseRegex.exec(url)[1], 10);

        var entryResponses = mockApiData['liveblog.responses'].filter(function (entryResponse) {
          return entryResponse.entry === entryId;
        });

        return [200, { results: entryResponses }];
      });
    $httpBackend.whenPOST(liveBlogEntryResponseRegex)
      .respond(function (method, url, data) {
        var entryResponses = mockApiData['liveblog.responses'];
        var newId = _.max(mockApiData['liveblog.responses'], 'id').id + 1;
        var newData = { id: newId };

        entryResponses.push(_.assign(newData, JSON.parse(data)));

        return [201, newData];
      });
    $httpBackend.whenGET(liveBlogEntryResponseDetailRegex)
      .respond(function (method, url, data) {
        var matches = liveBlogEntryResponseDetailRegex.exec(url);
        var entryResponseId = parseInt(matches[2], 10);

        var entryResponse = mockApiData['liveblog.responses'].find(function (listedEntryResponse) {
          return listedEntryResponse.id === entryResponseId;
        });

        return [200, entryResponse];
      });
    $httpBackend.whenPUT(liveBlogEntryResponseDetailRegex)
      .respond(function (method, url, data) {
        var matches = liveBlogEntryResponseDetailRegex.exec(url);
        var entryResponseId = parseInt(matches[2], 10);

        var index = mockApiData['liveblog.responses'].findIndex(function (entryResponse) {
          return entryResponse.id === entryResponseId;
        });

        mockApiData['liveblog.responses'][index] = data;

        return [200, data];
      });
    $httpBackend.whenDELETE(liveBlogEntryResponseDetailRegex)
      .respond(function (method, url, data) {
        var matches = liveBlogEntryResponseDetailRegex.exec(url);
        var entryResponseId = parseInt(matches[2], 10);

        var index = mockApiData['liveblog.responses'].findIndex(function (entry) {
          return entry.id === entryResponseId;
        });

        mockApiData['liveblog.responses'].splice(index, 1);

        return [201, ''];
      });

    // super features
    var superFeatureRegex = /\/cms\/api\/v1\/super-feature\/$/;
    var superFeatureRelationsRegex = /\/cms\/api\/v1\/super-feature\/(\d+)\/relations(\/(ordering))?\/?$/;

    $httpBackend.whenGET(superFeatureRegex).respond({
      results: mockApiData['content.list'].results.filter(function (content) {
        return content.polymorphic_ctype === 'core_super_feature_type' && !angular.isNumber(content.parent);
      })
    });
    $httpBackend.whenGET(superFeatureRelationsRegex)
      .respond(function (method, url, data) {
        var parentId = parseInt(superFeatureRelationsRegex.exec(url)[1], 10);
        var relations = mockApiData['content.list'].results.filter(function (content) {
          return content.parent === parentId;
        });

        return [200, relations];
      });
    $httpBackend.whenPUT(superFeatureRelationsRegex)
      .respond(function (method, url, data) {
        if (superFeatureRelationsRegex.exec(url)[3] === 'ordering') {
          return [200, {}];
        }

        return [404, {}];
      });

    // content list
    var listRegex = /^\/cms\/api\/v1\/(content|super-feature)\/(\?.*)?$/;
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

    // CMS notifications
    mockApiData.cmsNotifications = [{
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
    $httpBackend.whenGET('/cms/api/v1/cms_notifications/').respond(mockApiData.cmsNotifications);
    $httpBackend.whenPOST('/cms/api/v1/cms_notifications/').respond(200, {
      id: 5,
      title: 'New Notification',
      body: 'Ipsum ipsum ipsum. This was POSTed here.',
      post_date: today.clone().add({days: 1}).format(),
      notify_end_date: today.clone().add({days: 4}).format()
    });
    $httpBackend.whenPUT(/\/cms\/api\/v1\/cms_notifications\/(\d+)\//).respond(200, {
      id: 5,
      title: 'Updated Notification',
      body: 'This was PUT here.',
      post_date: today.clone().add({days: 1}).format(),
      notify_end_date: today.clone().add({days: 4}).format()
    });
    $httpBackend.whenDELETE(/\/cms\/api\/v1\/cms_notifications\/(\d+)\//).respond(200);

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

    $httpBackend.when('OPTIONS', /^http:\/\/clickholeimg.local.*/).respond('');
    $httpBackend.when('GET', /^http:\/\/clickholeimg.local.*/).respond(mockApiData['bettycropper.detail']);
    $httpBackend.when('POST', /^http:\/\/clickholeimg.local.*/).respond(mockApiData['bettycropper.new']);

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
    $httpBackend.when('GET', /^http:\/\/local.images.com\/.*/).respond({
      id: 0,
      name: 'some-garbage-image.png',
      width: 1600,
      height: 900,
      selections: {
        '16x9': { x0: 0, x1: 1600, y0: 0, y1: 900},
        '3x1': { x0: 0, x1: 1600, y0: 0, y1: 900},
        '1x1': { x0: 0, x1: 1600, y0: 0, y1: 900}
      }
    });

    // super features
    $httpBackend.whenGET(/\/cms\/api\/v1\/super-features\//).respond({
      results: mockApiData['content.list'].results.filter(function (content) {
        return content.polymorphic_ctype === 'core_super_feature_type';
      })
    });
  }
]);
