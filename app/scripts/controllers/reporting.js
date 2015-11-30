'use strict';

angular.module('bulbsCmsApp')
  .controller('ReportingCtrl', function ($http, $scope, $window, $, $location, $filter, $interpolate, Login, routes, moment, ContributionReportingService, ContentReportingService, FreelancePayReportingService) {
    $window.document.title = routes.CMS_NAMESPACE + ' | Reporting'; // set title

    $scope.userFilter = '';
    $scope.userFilters = [
      {
        name: 'All',
        value: ''
      },
      {
        name: 'Staff',
        value: 'staff'
      },
      {
        name: 'Freelance',
        value: 'freelance'
      }
    ];

    $scope.publishedFilter = '';
    $scope.publishedFilters = [
      {
        name: 'All Content',
        value: ''
      },
      {
        name: 'Published',
        value: 'published'
      }
    ];

    $scope.reports = {
      'Contributions': {
        service: ContributionReportingService,
        headings: [
          {'title': 'Content ID', 'expression': 'content.id'},
          {'title': 'Headline', 'expression': 'content.title'},
          {'title': 'FeatureType', 'expression': 'content.feature_type'},
          {'title': 'Contributor', 'expression': 'user.payroll_name'},
          {'title': 'Role', 'expression': 'role'},
          {'title': 'Pay', 'expression': 'pay'},
          {'title': 'Date', 'expression': 'content.published | date: \'MM/dd/yyyy\''}
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
          {'title': 'Content ID', 'expression': 'id'},
          {'title': 'Headline', 'expression': 'title'},
          {'title': 'Feature Type', 'expression': 'feature_type'},
          {'title': 'Video', 'expression': 'video_id'},
          {'title': 'Article Cost', 'expression': 'value'},
          {'title': 'Date Published', 'expression': 'published | date: \'MM/dd/yyyy\''}
        ],
        orderOptions: [],
        downloadURL: '/cms/api/v1/contributions/contentreporting/',
      },
      'Freelance Pay': {
        service: FreelancePayReportingService,
        headings: [
          {'title': 'Contributor', 'expression': 'contributor.full_name'},
          {'title': 'Contribution #', 'expression': 'contributions_count'},
          {'title': 'Pay', 'expression': 'pay'},
          {'title': 'Payment Date', 'expression': 'payment_date | date: \'MM/dd/yyyy\''}
        ],
        orderOptions: [],
        downloadURL: '/cms/api/v1/contributions/freelancereporting/'
      }
    };
    $scope.items = [];
    $scope.headings = [];
    $scope.orderOptions = [];

    $scope.startInitial = moment().startOf('month').format('YYYY-MM-DD');
    $scope.endInitial = moment().endOf('month').format('YYYY-MM-DD');

    $scope.reportParams = {
      pageNumber: 1,
      start: $scope.startInitial,
      end: $scope.endInitial,
    };
    $scope.reportDisabled = true;

    $scope.pageTotal = null;
    $scope.moreFilters = [];

    $scope.startOpen = false;
    $scope.endOpen = false;

    $scope.setReport = function ($reportingService) {
      if ($scope.reportDisabled === true) {
        $scope.reportDisabled = false;
      }
      $scope.reportParams.pageNumber = 1;
      $scope.report = $reportingService;
    };

    $scope.setUserFilter = function (value) {
      $scope.userFilter = value;
      loadReport($scope.report, $scope.reportParams.start, $scope.reportParams.end, $scope.orderBy);
    };

    $scope.setPublishedFilter = function (value) {
      $scope.publishedFilter = value;
      if (value === 'published') {
        $scope.reportParams.end = moment().format('YYYY-MM-DD');
      }
      loadReport($scope.report, $scope.reportParams.start, $scope.reportParams.end, $scope.orderBy);
    };

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
      loadReport($scope.report, $scope.reportParams.start, $scope.reportParams.end, $scope.orderBy);
    };

    $scope.downloadIsValid = function () {
      if ($scope.report !== 'undefined') {
        return true;
      }
      return false;
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

      loadReport(report, $scope.reportParams.start, $scope.reportParams.end, $scope.orderBy);
    });

    $scope.$watchCollection('[reportParams.start, reportParams.end]', function (params) {
      if (!$scope.report) {
        return;
      }
      var start = params[0];
      var end = params[1];

      loadReport($scope.report, start, end, $scope.orderBy);
    });

    function loadReport(report, start, end, order, apiUrl) {
      $scope.items = [];

      if (typeof(apiUrl) === 'undefined') {
        $scope.apiURL = report.downloadURL;
      } else {
        $scope.apiURL = apiUrl;
      }

      $scope.apiURL += ('?page=' + $scope.reportParams.pageNumber);


      $scope.downloadURL = report.downloadURL + '?format=csv';
      if (end) {
        var endParam = $filter('date')(end, 'yyyy-MM-dd');
        $scope.reportParams.end = endParam;
        $scope.apiURL += ('&end=' + endParam);
        $scope.downloadURL += ('&end=' + endParam);
      }

      if (start) {
        var startParam = $filter('date')(start, 'yyyy-MM-dd');
        $scope.reportParams.start = startParam;
        $scope.apiURL += ('&start=' + startParam);
        $scope.downloadURL += ('&start=' + startParam);
      }

      if (order) {
        $scope.apiURL += ('&ordering=' + order.key);
        // $scope.downloadURL += ('&ordering=' + order.key);
        // $scope.reportParams.ordering = order.key;
      }

      if ($scope.publishedFilter) {
        $scope.apiURL += ('&published=' + $scope.publishedFilter);
        $scope.downloadURL += ('&published=' + $scope.publishedFilter);
        $scope.reportParams.published = $scope.publishedFilter;
      }

      if ($scope.userFilter) {
        $scope.apiURL += ('&staff=' + $scope.userFilter);
        $scope.downloadURL += ('&staff=' + $scope.userFilter);
        $scope.reportParams.staff = $scope.userFilter;
      }

      if ($scope.moreFilters) {
        for (var key in $scope.moreFilters) {
          if ($scope.moreFilters[key].type === 'authors') {
            $scope.apiURL += ('&' + 'contributors=' + $scope.moreFilters[key].query);
            $scope.downloadURL += ('&' + 'contributors=' + $scope.moreFilters[key].query);
            $scope.reportParams.contributors = $scope.moreFilters[key].query;
          } else {
            $scope.apiURL += ('&' + $scope.moreFilters[key].type + '=' + $scope.moreFilters[key].query);
            $scope.downloadURL += ('&' + $scope.moreFilters[key].type + '=' + $scope.moreFilters[key].query);
            $scope.reportParams[$scope.moreFilters[key].type] = $scope.moreFilters[key].query;
          }
        }
      }

      $http({
        method: 'GET',
        url: $scope.apiURL
      }).then(function (data) {
        $scope.items = [];
        $scope.pageTotal = data.data.count;
        data.data.results.forEach(function (lineItem) {
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

    $scope.goToPage = function () {
      loadReport($scope.report, $scope.reportParams.start, $scope.reportParams.end);
    };

  });
