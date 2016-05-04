'use strict';

describe('Author service', function () {

  var AuthorService, $httpBackend;
  beforeEach(function () {

    module('bulbs.api');
    module('bulbs.api.mock');

    inject(function ($controller, $injector) {
      AuthorService = $injector.get('AuthorService');
      $httpBackend = $injector.get('$httpBackend');
    });
  });

  it('should get an author detail', function () {
    AuthorService.get(2).then(function (author) {
      expect(author.id).to.equal(2);
      expect(author.getFullName()).to.equal('Chris Sinchok');
    });
    $httpBackend.flush();
  });

  it('should be able to search authors', function () {
    AuthorService.getList({'q': 'Chris'}).then(function (authors) {
      expect(authors.length).to.equal(5);
      expect(authors[0].getFullName()).to.equal('T. Herman Zweibel');
    });
    $httpBackend.flush();
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

});
