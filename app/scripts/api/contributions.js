'use strict';

angular.module('bulbs.api')
  .factory('ContributionRoleService', function (Restangular) {
    return Restangular.service('contributions/role');
  })
  .factory('ContentReportingService', function (Restangular) {
    return Restangular.service('contributions/contentreporting');
  })
  .factory('FreelancePayReportingService', function(Restangular, moment) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl('/cms/api/v1/contributions/');
      RestangularConfigurer.setRequestSuffix('/');
    }).service('freelancereporting');
  })
  .factory('ContributionReportingService', function (Restangular, moment) {

    Restangular.extendModel('reporting', function (obj) {
      obj.user = angular.extend(obj.user, {
        toString: function () {
          return obj.user.full_name || obj.user.username;
        }
      });

      obj.content = angular.extend(obj.content, {
        toString: function () {
          return obj.content.title + ' (' + moment(obj.content.published).format('MM/DD/YYYY h:mm a') + ')';
        },
      });
      return obj;
    });

    return Restangular.service('contributions/reporting');
  });
