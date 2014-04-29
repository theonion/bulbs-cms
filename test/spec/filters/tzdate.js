'use strict';

describe('Filter: tzDate', function () {

  // load the filter's module
  beforeEach(module('bulbsCmsApp'));

  // initialize a new instance of the filter before each test
  var tzDate;
  beforeEach(inject(function ($filter) {
    tzDate = $filter('tzDate');
  }));

});
