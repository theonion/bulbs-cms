'use strict';

angular.module('bulbsCmsApp')
  .controller('ReportingCtrl', function ($scope, $window, $, $location, $filter, $interpolate, Login, routes, ContributionReportingService, ContentReportingService) {
    $window.document.title = routes.CMS_NAMESPACE + ' | Reporting'; // set title

    $scope.reports = {
      'Contributions': {
        service: ContributionReportingService,
        headings: [
          {'title': 'Date', 'expression': 'content.published'},
          {'title': 'Headline', 'expression': 'content.title'},
          {'title': 'User', 'expression': 'user.full_name'},
          {'title': 'Role', 'expression': 'role'},
          {'title': 'Notes', 'expression': 'notes'},
        ],
        downloadURL: '/cms/api/v1/contributions/reporting/',
        orderOptions: [
          {
            label: 'Order by User',
            key: 'user'
          },
          {
            label: 'Order by Content',
            key: 'content'
          },
        ]
      },
      'Content': {
        service: ContentReportingService,
        headings: [
          {'title': 'Date', 'expression': 'published'},
          {'title': 'Headline', 'expression': 'title'},
          {'title': 'URL', 'expression': 'url'},
        ],
        orderOptions: [],
        downloadURL: '/cms/api/v1/contributions/contentreporting/',
      }
    };
    $scope.items = [];
    $scope.headings = [];
    $scope.orderOptions = [];

    $scope.startOpen = false;
    $scope.endOpen = false;

    $scope.openStart = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.startOpen = true;
    };

    $scope.openEnd = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.endOpen = true;
    };

    $scope.orderingChange = function () {
      loadReport($scope.report, $scope.start, $scope.end, $scope.orderBy);
    };

    $scope.$watch('report', function (report) {
      if (!report) {
        return;
      }
      $scope.orderOptions = report.orderOptions;
      if(report.orderOptions.length > 0) {        
        $scope.orderBy = report.orderOptions[0];
      } else {
        $scope.orderBy = null;
      }
      $scope.headings = [];
      report.headings.forEach(function (heading) {
        $scope.headings.push(heading.title);
      });

      loadReport(report, $scope.start, $scope.end, $scope.orderBy);
    });

    $scope.$watchCollection('[start, end]', function (params) {
      if (!$scope.report) {
        return;
      }
      var start = params[0];
      var end = params[1];

      loadReport($scope.report, start, end, $scope.orderBy);
    });


    function loadReport(report, start, end, order) {
      $scope.items = [];
      var reportParams = {};
      $scope.downloadURL = report.downloadURL + '?format=csv';
      if (end) {
        var endParam = $filter('date')(end, 'yyyy-MM-dd');
        reportParams['end'] = endParam;
        $scope.downloadURL += ('&end=' + endParam);
      }

      if (start) {
        var startParam = $filter('date')(start, 'yyyy-MM-dd');
        reportParams['start'] = startParam;
        $scope.downloadURL += ('&start=' + startParam);
      }

      if (order) {
        $scope.downloadURL += ('&ordering=' + order.key);
        reportParams['ordering'] = order.key;
      }

      report.service.getList(reportParams).then(function (data) {
        $scope.items = [];
        data.forEach(function (lineItem) {
          var item = [];
          report.headings.forEach(function (heading) {
            var exp = $interpolate('{{item.' + heading.expression + '}}');
            var value = exp({item: lineItem});
            item.push(value);
          });
          $scope.items.push(item);
        });
      });
    }

  });
