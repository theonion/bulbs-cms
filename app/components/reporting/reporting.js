'use strict';

angular.module('reports', [
  'lineItems.edit',
  'lineItems.list',
  'rateOverrides.edit',
  'rateOverrides.list',
  'roles.edit',
  'roles.list',
  'utils'
])
  .config([
    '$routeProvider', 'COMPONENTS_URL', 'UtilsProvider',
    function ($routeProvider, COMPONENTS_URL, Utils) {

      $routeProvider.when('/cms/app/reporting/', {
        templateUrl: Utils.path.join(
          COMPONENTS_URL,
          'reporting',
          'reporting.html'
        ),
        controller: [
          '$scope', '$window', '$filter', '$interpolate', 'CMS_NAMESPACE', 'moment',
            'ContributionReportingService', 'ContentReportingService',
            'FreelancePayReportingService',
          function ($scope, $window, $filter, $interpolate, CMS_NAMESPACE, moment,
              ContributionReportingService, ContentReportingService,
              FreelancePayReportingService) {
            $window.document.title = CMS_NAMESPACE + ' | Reporting'; // set title

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
                  {'title': 'Contributor', 'expression': 'user.full_name'},
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
            $scope.moreFilters = [];

            $scope.startOpen = false;
            $scope.endOpen = false;

            $scope.startInitial = moment().startOf('month').format('YYYY-MM-DD');
            $scope.endInitial = moment().endOf('month').format('YYYY-MM-DD');

            $scope.setReport = function ($reportingService) {
              $scope.report = $reportingService;
            };

            $scope.setUserFilter = function (value) {
              $scope.userFilter = value;
              loadReport($scope.report, $scope.start, $scope.end, $scope.orderBy);
            };

            $scope.setPublishedFilter = function (value) {
              $scope.publishedFilter = value;
              if (value === 'published') {
                $scope.end = moment().format('YYYY-MM-DD');
              }
              loadReport($scope.report, $scope.start, $scope.end, $scope.orderBy);
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

              if ($scope.publishedFilter) {
                $scope.downloadURL += ('&published=' + $scope.publishedFilter);
                reportParams['published'] = $scope.publishedFilter;
              }

              if ($scope.userFilter) {
                $scope.downloadURL += ('&staff=' + $scope.userFilter);
                reportParams['staff'] = $scope.userFilter;
              }

              if ($scope.moreFilters) {
                for (var key in $scope.moreFilters) {
                  if ($scope.moreFilters[key].type === 'authors') {
                    $scope.downloadURL += ('&' + 'contributors=' + $scope.moreFilters[key].query);
                    reportParams['contributors'] = $scope.moreFilters[key].query;
                  } else {
                    $scope.downloadURL += ('&' + $scope.moreFilters[key].type + '=' + $scope.moreFilters[key].query);
                    reportParams[$scope.moreFilters[key].type] = $scope.moreFilters[key].query;
                  }
                }
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
          }
        ]
      });
    }
  ]);
