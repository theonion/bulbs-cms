'use strict';

describe('Role Factory', function() {
  var $httpBackend;
  var $q;

  var Role;

  var role;
  var roleUrl;

  beforeEach(module('apiServices.reporting.factory'));
  beforeEach(module('bulbs.cms.utils'));

  beforeEach(inject(function(_$httpBackend_, _$q_, _Role_) {
      $httpBackend = _$httpBackend_;
      $q = _$q_;
      Role = _Role_;
      roleUrl = '/cms/api/v1/contributions/role';
    }));

  describe('updateRole()', function () {

      it('is dirty when flat_rate is altered.', function () {
        role = Role.$build();
        expect(role.flat_rate.rate).to.equal(0);
        expect(role.$dirty().length).to.equal(0);
      });

  });

});