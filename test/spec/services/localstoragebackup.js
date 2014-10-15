'use strict';

describe('Service: LocalStorageBackup', function () {

  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));

// TODO : some day, we will mock this better, until then let's not run this
  return;

  var LocalStorageBackupTest,
      mockWindow,
      $rootScope,
      $q,
      CurrentUser;

  // provide mock dependencies
  beforeEach(module(function ($provide) {
    $provide.service('$routeParams', function () {
      return {id: '2'}
    });
    $provide.service('moment', function () {
      return function () {
        return {
          // return some ms
          valueOf: function () {
            return 5;
          },
          // subtraction just returns ms from "yesterday"
          subtract: function () {
            return {
              valueOf: function () {
                return 4;
              }
            };
          }
        }
      }
    });
    $provide.service('CurrentUser', function ($q) {
      return {
        $simplified: function () {
          var currentUserDefer = $q.defer(),
              currentUserPromise = currentUserDefer.promise;
          currentUserDefer.resolve({id: 0, displayName: 'Test User'});
          return currentUserPromise;
        }
      }
    });
    $provide.service('$window', function () {
      return {
        localStorage: {
          'article.1.1': JSON.stringify({
            timestamp: 1,
            user: {},
            content: {
              title: 'Some Article',
              body: 'Something'
            }
          }),
          'article.1.2': JSON.stringify({
            timestamp: 2,
            user: {},
            content: {
              title: 'Some Article Has Changes',
              body: 'Whatever balh balh balhb.'
            }
          }),
          'article.2.3': JSON.stringify({
            timestamp: 3,
            user: {},
            content: {
              title: 'This Is A Different Article',
              body: 'I am NOT article 1.'
            }
          }),
          // not an actual property, but we can use it for testing
          itemCount: 3,
          setItem: function (key, value) {
            // set a simulated maximum size on local storage (4 items) we can test pruning
            if (this.itemCount >= 4) {
              throw 'Too many things in here.'
            } else {
              this.itemCount++;
            }

            // otherwise just set the key, value
            this[key] = value;
          },
          removeItem: function (key) {
            // remove item and delete key
            this.itemCount--;
            delete this[key];
          }
        }
      };
    });
  }));

  // grab dependencies we need to be able to test
  beforeEach(inject(function ($window, _$rootScope_, _CurrentUser_, _$q_) {

    CurrentUser = _CurrentUser_;
    mockWindow = $window;
    LocalStorageBackupTest = LocalStorageBackup;
    $rootScope = _$rootScope_
    $q = _$q_;

  }));

  it('should create a new version in local storage', function () {

    // add new article
    var user = null,
        article = {
          title: 'Some New Article',
          body: 'Batman is the man.'
        };
    LocalStorageBackupTest.$create(article);
    CurrentUser.$simplified().then(function (currentUser) { user = currentUser; });

    // apply promises
    $rootScope.$apply();

    // see if it got stored properly in local storage
    expect(mockWindow.localStorage['article.2.5'])
      .toBe(JSON.stringify({
        timestamp: 5,
        user: user,
        content: article
      }));

  });

  it('should log an error and prune old entries when local storage is full', function () {

    // shut off logging for this one so we don't see the error message in testing logs
    spyOn(console, 'log').andCallFake(function () {});

    // local storage mock can hold a max of 4 entries, 5th entry will trigger an error and then a read
    // add two new entries, according to the rules of the mock local storage, both of these will have a timestamp of 5
    LocalStorageBackupTest.$create({ title: 'New Article 1', body: 'New article 1...'});
    LocalStorageBackupTest.$create({ title: 'New Article 2', body: 'New article 2...'});

    // apply promises
    $rootScope.$apply();

    // entries already in local storage have values less than 4, those three are removed and only 2 new ones remain
    expect(mockWindow.localStorage.itemCount).toBe(2);
  });

  it('should provide a list of versions in local storage', function () {

    // simulate adding a new article 2 version
    var article = {
      title: 'Some New Article',
      body: 'Batman is the man.'
    };
    LocalStorageBackupTest.$create(article);

    // apply promises
    $rootScope.$apply();

    var versions = [];
    LocalStorageBackupTest.$versions().then(function (versionsData) {
      versions = _.sortBy(versionsData, function (version) {
        return -version.timestamp;
      });
    });

    // apply promises
    $rootScope.$apply();

    // test output versions
    expect(versions.length).toBe(2);
    expect(versions[0].content.title).toBe(article.title);
    expect(versions[0].content.body).toBe(article.body);
    expect(versions[1].content.title).toBe('This Is A Different Article');
    expect(versions[1].content.body).toBe('I am NOT article 1.');

  });

});
