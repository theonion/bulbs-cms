'use strict';

describe('Role Factory', function() {
  var $httpBackend;
  var $q;

  var Role;

  var featureTypeRatesPayload;
  var featureTypeRatesUrl;
  var mockRolePayload;
  var role;
  var roleUrl;

  beforeEach(module('apiServices.reporting.factory'));
  beforeEach(module('bulbs.cms.utils'));

  beforeEach(inject(function(_$httpBackend_, _$q_, _Role_) {
      $httpBackend = _$httpBackend_;
      $q = _$q_;
      Role = _Role_;

      roleUrl = '/cms/api/v1/contributions/role/';
      mockRolePayload = {
        id: 12345,
        name: 'flat rate role',
        payment_type: 'Flat Rate',
        rate: 125
      };

      featureTypeRatesUrl = '/cms/api/v1/contributions/role/' + mockRolePayload.id + '/feature_type_rates/?page=1';
      featureTypeRatesPayload = {
        count: 1,
        next: null,
        previous: null,
        results: [{
          id: 1,
          rate: 0,
          feature_type: 'Any Feature Type',
        }]
      };
    }));

  describe('updateRole()', function () {

      it('is dirty when flat_rate.rate is updated.', function () {
        mockRolePayload.payment_type = 'Flat Rate';
        $httpBackend.expectGET(roleUrl + mockRolePayload.id + '/').respond(200, mockRolePayload);
        role = Role.$find(mockRolePayload.id);
        $httpBackend.flush();

        expect(role.flat_rate.rate).to.equal(0);
        expect(role.$dirty('flat_rate.rate')).to.equal(false);

        role.flat_rate.rate = 10;
        expect(role.$dirty('flat_rate.rate')).to.equal(true);
      });

      it('is dirty when hourly.rate is updated.', function () {
        mockRolePayload.payment_type = 'Hourly';
        $httpBackend.expectGET(roleUrl + mockRolePayload.id + '/').respond(200, mockRolePayload);
        role = Role.$find(mockRolePayload.id);
        $httpBackend.flush();

        expect(role.hourly_rate.rate).to.equal(0);
        expect(role.$dirty('hourly_rate.rate')).to.equal(false);

        role.hourly_rate.rate = 10;
        expect(role.$dirty('hourly_rate.rate')).to.equal(true);
      });

      it('is dirty when feature_type_rates are updated.', function () {
        mockRolePayload.payment_type = 'FeatureType';
        $httpBackend.expectGET(roleUrl + mockRolePayload.id + '/').respond(200, mockRolePayload);
        role = Role.$find(mockRolePayload.id);
        $httpBackend.flush();

        $httpBackend.expectGET(featureTypeRatesUrl).respond(200, featureTypeRatesPayload);
        role.feature_type_rates.$fetch();
        $httpBackend.flush();

        expect(role.feature_type_rates[0].rate).to.equal(0);
        expect(role.feature_type_rates[0].$dirty('rate')).to.equal(false);

        role.feature_type_rates[0].rate = 10;
        expect(role.feature_type_rates[0].$dirty('rate')).to.equal(true);
      });

  });

});