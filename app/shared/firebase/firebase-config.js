'use strict';

angular.module('cms.firebase.config', [
  'lodash',
  'utils'
])
  .provider('FirebaseConfig', function (_, UtilsProvider) {
    var config = {};

    // url where firebase db is located
    var dbUrl = '';
    // maximum number of versions of an article to store
    var maxVersions = 25;
    // root of site specific branch of firebase db
    var siteRoot = 'a-site-is-not-configured';

    config.setDbUrl = function (newDbUrl) {
      dbUrl = newDbUrl;
      return config;
    };

    config.setMaxVersions = function (numVersions) {
      maxVersions = numVersions;
      return config;
    };

    config.setSiteRoot = function (newSiteRoot) {
      siteRoot = newSiteRoot;
      return config;
    };

    config.$get = function () {
      return {
        getConnectionStatusUrl: _.constant('https://' + UtilsProvider.path.join(dbUrl, '.info', 'connected')),
        getMaxArticleVersions: _.constant(maxVersions),
        getSiteDbUrl: _.constant(UtilsProvider.path.join(dbUrl, siteRoot))
      };
    };

    return config;
  });
