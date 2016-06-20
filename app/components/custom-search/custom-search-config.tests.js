'use strict';

describe('CustomSearchConfig', function () {

  var $injector;
  var configs;
  var sandbox;
  var sealedConfigs;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'bulbs.cms.customSearch.config',
      function (CustomSearchConfigProvider) {
        configs = CustomSearchConfigProvider;
      }
    );

    inject(function (_$injector_) {
      $injector = _$injector_;
    });

    sealedConfigs = function () {
      return $injector.invoke(configs.$get);
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  context('condition fields', function () {

    it('should provide a setter and getter', function () {
      var name = 'Content Type';
      var endpoint = 'content-type';
      var valueStructureName = 'name';
      var valueStructureValue = 'doctype';

      configs.addConditionField(name, endpoint, valueStructureName, valueStructureValue);

      var conditionFieldMapping = sealedConfigs().getConditionFields()[0];
      expect(conditionFieldMapping.name).to.equal(name);
      expect(conditionFieldMapping.endpoint).to.equal(endpoint);
      expect(conditionFieldMapping.value_structure.name)
        .to.equal(valueStructureName);
      expect(conditionFieldMapping.value_structure.value)
        .to.equal(valueStructureValue);
    });

    it('should throw an error if given name is not a string', function () {

      expect(function () {
        configs.addConditionField(123, 'garbage', 'garbage', 'garbage');
      }).to.throw(
        BulbsCmsConfigError,
        'Configuration Error (CustomSearchConfig): condition field name must be a string!'
      );
    });

    it('should throw an error if given endpoint is not a string', function () {

      expect(function () {
        configs.addConditionField('garbage', 123, 'garbage', 'garbage');
      }).to.throw(
        BulbsCmsConfigError,
        'Configuration Error (CustomSearchConfig): condition field endpoint must be a string!'
      );
    });

    it('should throw an error if given value structure name is not a string', function () {

      expect(function () {
        configs.addConditionField('garbage', 'garbage', 123, 'garbage');
      }).to.throw(
        BulbsCmsConfigError,
        'Configuration Error (CustomSearchConfig): condition field value structure name must be a string!'
      );
    });

    it('should throw an error if given value structure value is not a string', function () {

      expect(function () {
        configs.addConditionField('garbage', 'garbage', 'garbage', 123);
      }).to.throw(
        BulbsCmsConfigError,
        'Configuration Error (CustomSearchConfig): condition field value structure value must be a string!'
      );
    });

    it('should return config object', function () {

      expect(configs.addConditionField('garbage', 'garbage', 'garbage', 'garbage'))
        .to.equal(configs);
    });
  });

  context('condition types', function () {

    it('should provide a setter and getter', function () {
      var name = 'is any of';
      var value = 'any';

      configs.addConditionType(name, value);

      var conditionType = sealedConfigs().getConditionTypes()[0];
      expect(conditionType.name).to.equal(name);
      expect(conditionType.value).to.equal(value);
    });

    it('should throw an error if given key is not a string', function () {

      expect(function () {
        configs.addConditionType(123, 'garbage');
      }).to.throw(
        BulbsCmsConfigError,
        'Configuration Error (CustomSearchConfig): condition type name must be a string!'
      );
    });

    it('should throw an error if given value is not a string', function () {

      expect(function () {
        configs.addConditionType('nav', 123);
      }).to.throw(
        BulbsCmsConfigError,
        'Configuration Error (CustomSearchConfig): condition type value must be a string!'
      );
    });

    it('should return config object', function () {

      expect(configs.addConditionType('is any of', 'any')).to.equal(configs);
    });
  });

  context('request cap milliseconds', function () {

    it('should provide a setter and getter', function () {
      var requestCap = 2000;

      configs.setRequestCapMs(requestCap);

      expect(sealedConfigs().getRequestCapMs()).to.equal(requestCap);
    });

    it('should throw an error if given value is not a boolean', function () {

      expect(function () {
        configs.setRequestCapMs('hello');
      }).to.throw(
        BulbsCmsConfigError,
        'Configuration Error (CustomSearchConfig): request cap milliseconds must be a number!'
      );
    });

    it('should default to 150', function () {

      expect(sealedConfigs().getRequestCapMs()).to.equal(150);
    });

    it('should return config object', function () {

      expect(configs.setRequestCapMs(2000)).to.eql(configs);
    });
  });

  context('time periods', function () {

    it('should provide a setter and getter', function () {
      var name = 'Past Week';
      var value = 'Past Week';

      configs.addTimePeriod(name, value);

      var timePeriod = sealedConfigs().getTimePeriods()[0];
      expect(timePeriod.name).to.equal(name);
      expect(timePeriod.value).to.equal(value);
    });

    it('should throw an error if given key is not a string', function () {

      expect(function () {
        configs.addTimePeriod(123, 'garbage');
      }).to.throw(
        BulbsCmsConfigError,
        'Configuration Error (CustomSearchConfig): time period name must be a string!'
      );
    });

    it('should throw an error if given value is not a string', function () {

      expect(function () {
        configs.addTimePeriod('nav', 123);
      }).to.throw(
        BulbsCmsConfigError,
        'Configuration Error (CustomSearchConfig): time period value must be a string!'
      );
    });

    it('should return config object', function () {

      expect(configs.addTimePeriod('Past Week', 'Past Week')).to.equal(configs);
    });
  });

});
