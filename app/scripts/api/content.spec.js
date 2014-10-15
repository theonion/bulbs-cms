describe('ContentService', function () {
  
  var ContentService, $httpBackend;
  beforeEach(function() {

    module('bulbs.api');
    module('bulbs.api.mock');

    inject(function ($controller, $injector) {
      ContentService = $injector.get('ContentService');
      $httpBackend = $injector.get('$httpBackend');
    });
  });

  it('should get a content detail', function () {
    ContentService.one(6).get().then(function(content){
      expect(content.id).toBe(6);
    });
    $httpBackend.flush();
  });

  it('should return the contributions for content', function () {
    ContentService.one(6).all('contributions').getList().then(function(contributions){
      expect(contributions.length).toBe(2);
      expect(contributions[0].contributor.getFullName()).toBe('Chris Sinchok');
    });
    $httpBackend.flush();
  });

  it('should update the contributions for content', function() {
    data = [{
      id: 7,
      content: 1234,
      contributor: {
        id: 3,
        first_name: 'Shawn',
        last_name: 'Cook',
        username: 'scook'
      },
      role: {
        id: 3,
        name: 'Programmer'
      }
    }];
    // console.log(ContentService.one(6).all('contributions').post(data));
    ContentService.one(6).all('contributions').post(data).then(function(contributions){
      expect(contributions.length).toBe(1);
      expect(contributions).toEqual(data);
    });
    $httpBackend.flush();
  });

  it('should update the contributions for content', function() {
    data = [{
      id: 7,
      content: 1234,
      contributor: {
        id: 3,
        first_name: 'Shawn',
        last_name: 'Cook',
        username: 'scook'
      },
      role: {
        id: 3,
        name: 'Programmer'
      }
    }];
    // console.log(ContentService.one(6).all('contributions').getList());
    // console.log(ContentService.one(6).all('contributions').post(data));
    ContentService.one(6).all('contributions').save(data).then(function(contributions){
      expect(contributions.length).toBe(1);
      expect(contributions).toEqual(data);
    });
    $httpBackend.flush();
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

});