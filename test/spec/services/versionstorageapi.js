'use strict';

describe('Service: VersionStorageApi', function () {

  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));

  var VersionStorageApiTest,
      liveArticleMock,
      localStorageBackupMock,
      $q,
      $rootScope;

  // provide mock dependencies
  beforeEach(module(function ($provide) {
    liveArticleMock = {
      versions: [],
      $createVersion: function () {},
      $versions: function () {}
    };
    spyOn(liveArticleMock, '$createVersion').andCallFake(function (articleData) {
      var createDeferred = $q.defer(),
          createPromise = createDeferred.promise,
          // fyi: angularfire is using push() which creates new items in chronological order. So we don't have to do any
          //  manual work to ensure things come out of firebase in the correct order. Here, let's just simulate each
          //  item added as being an additional
          versionData = {timestamp: liveArticleMock.versions.length + 1, content: articleData};

      // let's cheat here and say if articleData has error property, we reject createDeferred so we can test reject
      if ('hasAnError' in articleData) {
        createDeferred.reject()
      } else {
        liveArticleMock.versions.push(versionData);
        createDeferred.resolve(versionData);
      }

      return createPromise;
    });
    spyOn(liveArticleMock, '$versions').andCallFake(function () {
      return {
        length: liveArticleMock.versions.length,
        $loaded: function (cb) {
          return cb(liveArticleMock.versions);
        }
      };
    });
    $provide.service('FirebaseArticleFactory', function () {
      return {
        $retrieveCurrentArticle: function () { return liveArticleMock; }
      };
    });
    $provide.service('LocalStorageBackup', function () {
      localStorageBackupMock = {
        versionsBack: [],
        $create: function () {},
        $versions: function () {}
      };
      spyOn(localStorageBackupMock, '$create').andCallFake(function (articleData) {
        var versionData = null,
            createDefer = $q.defer(),
            createPromise = createDefer.promise;

        // let's cheat here and say if articleData has error property, we reject createDeferred so we can test reject
        if (!('hasAnError' in articleData)) {
          versionData = {timestamp: localStorageBackupMock.versionsBack.length + 1, content: articleData};
          localStorageBackupMock.versionsBack.push(versionData);
          createDefer.resolve(versionData);
        } else {
          createDefer.reject('Some error happened.');
        }

        return createPromise;
      });
      spyOn(localStorageBackupMock, '$versions').andCallFake(function () {
        var versionsDefer = $q.defer(),
            versionsPromise = versionsDefer.promise;
        versionsDefer.resolve(localStorageBackupMock.versionsBack);
        return versionsPromise;
      });
      return localStorageBackupMock
    });
  }));

  // grab dependencies we need to be able to test
  beforeEach(inject(function(_$q_, _$rootScope_) {
    $q = _$q_;
    $rootScope = _$rootScope_;
  }));

  describe('when a user has firebase', function () {

    // inject hasFirebase before injecting version storage API so that it resolves to the correct value on init
    beforeEach(inject(function (FirebaseApi) {
      FirebaseApi.hasFirebase = true;
    }));

    beforeEach(inject(function (VersionStorageApi) {
      VersionStorageApiTest = VersionStorageApi;
    }));

    it('a new version should be created when there are no versions', function () {

      var article = {
        title: 'Some Article Data',
        body: 'Here is this article.'
      };

      var created = VersionStorageApiTest.$create(article, false),
          versionData = null;
      created.then(function (versionDataCreated) {
        versionData = versionDataCreated;
      });

      // cause promises to fire
      $rootScope.$apply();

      expect(liveArticleMock.$createVersion).toHaveBeenCalled();
      expect(versionData.content).toEqual(article);

    });

    it('a new version should be created when article is dirty and there are already versions', function () {

      VersionStorageApiTest.$create({title: 'A1', body: 'B1'}, false);
      VersionStorageApiTest.$create({title: 'A2', body: 'B2'}, true);

      // cause promises to fire
      $rootScope.$apply();

      expect(liveArticleMock.$createVersion).toHaveBeenCalled();
      expect(liveArticleMock.versions.length).toBe(2);

    });

    it('creation of a new version should be rejected if firebase create version fails', function () {

      var creationFailed = false;
      VersionStorageApiTest
        .$create({ title: 'F1', body: 'F1', hasAnError: true })
        .catch(function () {
          creationFailed = true;
        });

      // cause promises to fire
      $rootScope.$apply();

      expect(liveArticleMock.$createVersion).toHaveBeenCalled();
      expect(liveArticleMock.versions.length).toBe(0);
      expect(creationFailed).toBe(true);

    });

    it('creation of a new version should be rejected if article is not dirty and there exists a version', function () {

      var creationFailed = false;
      VersionStorageApiTest.$create({title: 'A1', body: 'B1'}, false);
      VersionStorageApiTest
        .$create({title: 'A1', body: 'B1'}, false)
        .catch(function () {
          creationFailed = true;
        });

      // cause promises to fire
      $rootScope.$apply();

      expect(liveArticleMock.$createVersion).toHaveBeenCalled();
      expect(liveArticleMock.versions.length).toBe(1);
      expect(creationFailed).toBe(true);

    });

    it('should provide a list of all versions sorted by timestamp', function () {

      VersionStorageApiTest.$create({title: 'A1', body: 'B1'}, false);
      VersionStorageApiTest.$create({title: 'A1', body: 'B2'}, true);
      VersionStorageApiTest.$create({title: 'A1', body: 'B3'}, true);

      var versions = [];
      VersionStorageApiTest.$all().then(function (versionsData) {
        versions = versionsData;
      });

      // cause promises to fire
      $rootScope.$apply();

      expect(liveArticleMock.$versions).toHaveBeenCalled();
      expect(versions.length).toBe(3);
      expect(versions[0].content.body).toBe('B3');

    });

  });

  describe('when a user is using local storage', function () {

    // inject hasFirebase before injecting version storage API so that it resolves to the correct value on init
    beforeEach(inject(function (FirebaseApi) {
      FirebaseApi.hasFirebase = false;
    }));

    beforeEach(inject(function (VersionStorageApi) {
      VersionStorageApiTest = VersionStorageApi;
    }));

    it('a new version should be created when there are no versions', function () {

      var article = {
        title: 'Some Article Data',
        body: 'Here is this article.'
      };

      var created = VersionStorageApiTest.$create(article, false),
          versionData = null;
      created.then(function (versionDataCreated) {
        versionData = versionDataCreated;
      });

      // cause promises to fire
      $rootScope.$apply();

      expect(localStorageBackupMock.$create).toHaveBeenCalled();
      expect(versionData.content).toEqual(article);

    });

    it('a new version should be created when article is dirty and there are already versions', function () {

      VersionStorageApiTest.$create({title: 'A1', body: 'B1'}, false);
      VersionStorageApiTest.$create({title: 'A2', body: 'B2'}, true);

      // cause promises to fire
      $rootScope.$apply();

      expect(localStorageBackupMock.$create).toHaveBeenCalled();
      expect(localStorageBackupMock.versionsBack.length).toBe(2);

    });

    it('creation of a new version should be rejected if local storage create version fails', function () {
      var creationFailed = false;
      VersionStorageApiTest
        .$create({ title: 'F1', body: 'F1', hasAnError: true })
        .catch(function () {
          creationFailed = true;
        });

      // cause promises to fire
      $rootScope.$apply();

      expect(localStorageBackupMock.$create).toHaveBeenCalled();
      expect(localStorageBackupMock.versionsBack.length).toBe(0);
      expect(creationFailed).toBe(true);

    });

    it('creation of a new version should be rejected if article is not dirty and there exists a version', function () {

      var creationFailed = false;
      VersionStorageApiTest.$create({title: 'A1', body: 'B1'}, false);
      VersionStorageApiTest
        .$create({title: 'A1', body: 'B1'}, false)
        .catch(function () {
          creationFailed = true;
        });

      // cause promises to fire
      $rootScope.$apply();

      expect(localStorageBackupMock.$create).toHaveBeenCalled();
      expect(localStorageBackupMock.versionsBack.length).toBe(1);
      expect(creationFailed).toBe(true);

    });

    it('should provide a list of all versions sorted by timestamp', function () {

      VersionStorageApiTest.$create({title: 'A1', body: 'B1'}, false);
      VersionStorageApiTest.$create({title: 'A1', body: 'B2'}, true);
      VersionStorageApiTest.$create({title: 'A1', body: 'B3'}, true);

      var versions = [];
      VersionStorageApiTest.$all().then(function (versionsData) {
        versions = versionsData;
      });

      // cause promises to fire
      $rootScope.$apply();

      expect(localStorageBackupMock.$versions).toHaveBeenCalled();
      expect(versions.length).toBe(3);
      expect(versions[0].content.body).toBe('B3');

    });

  });

});