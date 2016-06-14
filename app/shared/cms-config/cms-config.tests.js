describe('CmsConfig', function () {

  var $injector;
  var configs;
  var sandbox;
  var sealedConfigs;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'bulbs.cms.config',
      function (CmsConfigProvider) {
        configs = CmsConfigProvider;
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

  context('settings for', function () {

    context('images', function () {

      context('api endpoint', function () {

        it('should provide a setter and getter', function () {
          var imageUrl = 'http://my.garbage.url/';

          configs.images.setApiUrl(imageUrl);

          expect(sealedConfigs().images.buildApiUrl()).to.equal(imageUrl);
        });

        it('should provide a getter to build from a relative url', function () {
          var imageUrl = 'http://my.garbage.url';
          var somePath = '/some/stupid/path';

          configs.images.setApiUrl(imageUrl);

          expect(sealedConfigs().images.buildApiUrl(somePath))
            .to.equal(imageUrl + somePath);
        });

        it('should throw an error if given value is not a string', function () {

          expect(function () {
            configs.images.setApiUrl(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): image api url must be a string!'
          );
        });

        it('should return image config object', function () {

          expect(configs.images.setApiUrl('http://whatever.com'))
            .to.eql(configs.images);
        });

        it('should set window.BC_ADMIN_URL', function () {
          // NOTE : this is to be ticketed and removed
          var imageUrl = 'http://whatever.com';

          configs.images.setApiUrl(imageUrl);

          expect(window.BC_ADMIN_URL).to.equal(imageUrl);
        });
      });

      context('api key', function () {

        it('should provide a setter and getter', function () {

          var key = '123abc';

          configs.images.setApiKey(key);

          expect(sealedConfigs().images.getApiKey()).to.equal(key);
        });

        it('should throw an error if given value is not a string', function () {

          expect(function () {
            configs.images.setApiKey(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): image api key must be a string!'
          );
        });

        it('should return image config object', function () {

          expect(configs.images.setApiKey('123abc'))
          .to.eql(configs.images);
        });

        it('should set window.BC_API_KEY', function () {
          // NOTE : this is to be ticketed and removed
          var key = 'abc123';

          configs.images.setApiKey(key);

          expect(window.BC_API_KEY).to.equal(key);
        });
      });
    });
  });
});
