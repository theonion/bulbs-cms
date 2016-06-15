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

    context('general cms', function () {

      context('components path', function () {

        it('should provide a setter and getter', function () {
          var path = '/components/';

          configs.setComponentPath(path);

          expect(sealedConfigs().buildComponentPath()).to.equal(path);
        });

        it('should provide a getter to build out a path', function () {
          var path = '/components';
          var templatePath = '/my/favorite/component.html';

          configs.setComponentPath(path);

          expect(sealedConfigs().buildComponentPath(templatePath))
            .to.equal(path + templatePath);
        });

        it('should throw an error if value given to getter is not a string', function () {

          expect(function () {
            sealedConfigs().buildComponentPath(123)
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): value given to component path build must be a string!'
          );
        });

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setComponentPath(123)
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): component path must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setComponentPath('/components/')).to.eql(configs);
        });
      });

      context('content partials path', function () {

        it('should provide a setter and getter', function () {
          var path = '/content_types';

          configs.setContentPartialsPath(path);

          expect(sealedConfigs().buildContentPartialsPath()).to.equal(path);
        });

        it('should provide a getter to build out a path', function () {
          var path = '/content_types';
          var templatePath = '/my/content/content_content.html';

          configs.setContentPartialsPath(path);

          expect(sealedConfigs().buildContentPartialsPath(templatePath))
            .to.equal(path + templatePath);
        });

        it('should throw an error if value given to getter is not a string', function () {

          expect(function () {
            sealedConfigs().buildContentPartialsPath(123)
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): value given to content partials path build must be a string!'
          );
        });

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setContentPartialsPath(123)
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): content partials path must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setContentPartialsPath('/content_types/')).to.eql(configs);
        });
      });

      context('cache buster', function () {

        it('should provide a getter and setter', function () {
          var buster = 'busted';

          configs.setCacheBuster(buster);

          expect(sealedConfigs().getCacheBuster()).to.equal(buster);
        });

        it('should throw an error if given value is not a string', function () {

          expect(function () {
            configs.setCacheBuster(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): cache buster must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setCacheBuster('buster')).to.eql(configs);
        });
      });

      context('cms name', function () {

        it('should provide a getter and setter', function () {
          var name = 'My CMS';

          configs.setCmsName(name);

          expect(sealedConfigs().getCmsName()).to.equal(name);
        });

        it('should throw an error if given value is not a string', function () {

          expect(function () {
            configs.setCmsName(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): cms name must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setCmsName('abc')).to.eql(configs);
        });
      });

      context('directive partials path', function () {

        it('should provide a setter and getter', function () {
          var path = '/directives/path';

          configs.setDirectivePartialsPath(path);

          expect(sealedConfigs().buildDirectivePartialsPath()).to.equal(path);
        });

        it('should provide a getter to build out a path', function () {
          var path = '/directives/path';
          var templatePath = '/my/content/directive.html';

          configs.setDirectivePartialsPath(path);

          expect(sealedConfigs().buildDirectivePartialsPath(templatePath))
            .to.equal(path + templatePath);
        });

        it('should throw an error if value given to getter is not a string', function () {

          expect(function () {
            sealedConfigs().buildDirectivePartialsPath(123)
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): value given to directive partials path build must be a string!'
          );
        });

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setDirectivePartialsPath(123)
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): directive partials path must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setDirectivePartialsPath('/directives/path')).to.eql(configs);
        });
      });
    });

    context('images', function () {

      context('api endpoint', function () {

        it('should provide a setter and getter', function () {
          var imageUrl = 'http://my.garbage.url/';

          configs.setImageApiUrl(imageUrl);

          expect(sealedConfigs().buildImageApiUrl()).to.equal(imageUrl);
        });

        it('should provide a getter to build from a relative url', function () {
          var imageUrl = 'http://my.garbage.url';
          var somePath = '/some/stupid/path';

          configs.setImageApiUrl(imageUrl);

          expect(sealedConfigs().buildImageApiUrl(somePath))
            .to.equal(imageUrl + somePath);
        });

        it('should throw an error if value given to getter is not a string', function () {

          expect(function () {
            sealedConfigs().buildImageApiUrl(123)
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): value given to image api url build must be a string!'
          );
        });

        it('should throw an error if given value is not a string', function () {

          expect(function () {
            configs.setImageApiUrl(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): image api url must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setImageApiUrl('http://whatever.com'))
            .to.eql(configs);
        });

        it('should set window.BC_ADMIN_URL', function () {
          // NOTE : this is to be ticketed and removed
          var imageUrl = 'http://whatever.com';

          configs.setImageApiUrl(imageUrl);

          expect(window.BC_ADMIN_URL).to.equal(imageUrl);
        });
      });

      context('api key', function () {

        it('should provide a setter and getter', function () {

          var key = '123abc';

          configs.setImageApiKey(key);

          expect(sealedConfigs().getImageApiKey()).to.equal(key);
        });

        it('should throw an error if given value is not a string', function () {

          expect(function () {
            configs.setImageApiKey(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): image api key must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setImageApiKey('123abc'))
          .to.eql(configs);
        });

        it('should set window.BC_API_KEY', function () {
          // NOTE : this is to be ticketed and removed
          var key = 'abc123';

          configs.setImageApiKey(key);

          expect(window.BC_API_KEY).to.equal(key);
        });
      });

      context('nav logo', function () {

        it('should provide a setter and getter', function () {
          var path = '/onion-logo.png';

          configs.setNavLogoPath(path);

          expect(sealedConfigs().getNavLogoPath()).to.equal(path);
        });

        it('should throw an error if given value is not a string', function () {

          expect(function () {
            configs.setNavLogoPath(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): nav logo path must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setNavLogoPath('/onion-logo.png')).to.equal(configs);
        });
      });
    });
  });
});
