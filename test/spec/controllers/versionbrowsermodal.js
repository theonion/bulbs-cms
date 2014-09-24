'use strict';

describe('Controller: VersionBrowserModalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('jsTemplates'));

  var VersionBrowserModalCtrl,
      VersionStorageApiMock,
      rootScope,
      scope,
      modal,
      // dates for testing timestamp parsing, ordered from most recent to oldest
      dates = [
        moment('2014-09-23T12:03'),
        moment('2014-08-01T09:30'),
        moment('2013-10-21T16:09'),
        moment('2013-09-01T20:23')
      ],
      // versions, out of order since modal should know to order them
      versions = [
        {
          timestamp: dates[2].valueOf(),
          content: {
            title: 'The Third Latest Article',
            body: 'Something something.'
          }
        },
        {
          timestamp: dates[0].valueOf(),
          content: {
            title: 'The Latest Article',
            body: 'Just great.'
          }
        },
        {
          timestamp: dates[1].valueOf(),
          content: {
            title: 'The Second Latest Article',
            body: 'Just great. Hey this got deleted later.'
          }
        },
        {
          timestamp: dates[3].valueOf(),
          content: {
            title: 'The Oldest Article',
            body: 'Just starting this thing out'
          }
        }
      ],
      displayFormat = 'ddd, MMM Do YYYY, h:mma';

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($q, $controller, $rootScope, $modal, routes) {

    rootScope = $rootScope;
    scope = rootScope.$new();

    // open up version browser modal with mocked out stuff
    var modalUrl = routes.PARTIALS_URL + 'modals/version-browser-modal.html';
    modal = $modal.open({
      templateUrl: modalUrl
    });
    modal.dismiss = function () { return true; };
    modal.close = function () { return true; };

    // allow us to ensure that modal.close was called
    spyOn(modal, 'close');

    // mock version storage api
    VersionStorageApiMock = {
      $all: function() {

        var allDefer = $q.defer(),
            allPromise = allDefer.promise;

        allDefer.resolve(versions);

        return allPromise;

      }
    };

    // set up controller we're testing
    VersionBrowserModalCtrl = $controller('VersionBrowserModalCtrl', {
      $scope: scope,
      $modalInstance: modal,
      VersionStorageApi: VersionStorageApiMock
    });

    $rootScope.$apply();

  }));
  
  it('should have a scope property called timestamps, which contains the ms value and display value', function () {
    expect(scope.timestamps[0]).toEqual({ ms: dates[0].valueOf(), display: dates[0].format(displayFormat) });
    expect(scope.timestamps[1]).toEqual({ ms: dates[1].valueOf(), display: dates[1].format(displayFormat) });
    expect(scope.timestamps[2]).toEqual({ ms: dates[2].valueOf(), display: dates[2].format(displayFormat) });
    expect(scope.timestamps[3]).toEqual({ ms: dates[3].valueOf(), display: dates[3].format(displayFormat) });
  });

  it('should have a scope property called selectedVersion that is the latest version', function () {
    // note: version list is initially out of order, so the selected version should actually be the second one
    expect(scope.selectedVersion).toEqual(versions[1]);
  });

  it('should have a function to select a version by timestamp', function () {
    expect(scope.setPreview).not.toBeUndefined();

    // select the 3rd preview which will actually be the top item in the unsorted versions list
    scope.setPreview({ ms: dates[0].valueOf(), display: dates[0].format(displayFormat) });

    expect(scope.selectedVersion).toEqual(versions[1]);
  });
  
  it('should have a function to restore the selected version that will modify the article in scope', function () {
    scope.article = {
      title: 'I Have Not Been Saved',
      body: 'Here is some content that has not been saved.',
      anotherPropertyThatWontBeOverwritten: 123
    };
    scope.selectedVersion = versions[0];

    scope.restoreSelected();

    expect(scope.article.title).toBe(versions[0].content.title);
    expect(scope.article.body).toBe(versions[0].content.body);
    expect(scope.article.anotherPropertyThatWontBeOverwritten).toBe(123);

    expect(scope.articleIsDirty).toBe(true);

    expect(modal.close).toHaveBeenCalled();
  });

});
