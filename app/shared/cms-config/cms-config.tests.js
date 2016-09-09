'use strict';

describe('CmsConfig', function () {

  var $injector;
  var configs;
  var sandbox;
  var sealedConfigs;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'bulbs.cms.site.config',
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

      context('api url root', function () {

        it('should provide a setter and getter', function () {
          var url = '/api/root';

          configs.setApiUrlRoot(url);

          expect(sealedConfigs().buildApiUrlRoot()).to.equal(url);
        });

        it('should provide a getter to build out a url', function () {
          var url = '/api/root';
          var somePath = '/something-special';

          configs.setApiUrlRoot(url);

          expect(sealedConfigs().buildApiUrlRoot(somePath))
            .to.equal(url + somePath);
        });

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setApiUrlRoot(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): api url root must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setApiUrlRoot('/api/root')).to.eql(configs);
        });
      });

      context('article editoral statuses', function () {

        it('should provide a method to add a new status and a getter for statuses', function () {
          var label1 = 'my label';
          var value1 = 'my value';
          var label2 = 'my label';
          var value2 = 'my value';

          configs.addArticleEditoralStatus(label1, value1);
          configs.addArticleEditoralStatus(label2, value2);

          expect(sealedConfigs().getArticleEditoralStatuses()).to.eql([{
            label: label1,
            value: value1
          }, {
            label: label2,
            value: value2
          }]);
        });

        it('should throw an error if label given to adder is not a string', function () {

          expect(function () {
            configs.addArticleEditoralStatus(1, 'hello');
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): article editoral status label must be a string!'
          );
        });

        it('should throw an error if value given to adder is not a string', function () {

          expect(function () {
            configs.addArticleEditoralStatus('hello', 1);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): article editoral status value must be a string!'
          );
        });

        it('should return config object from adder', function () {

          expect(configs.addArticleEditoralStatus('one', 'two')).to.eql(configs);
        });
      });

      context('auto add author', function () {

        it('should provide a setter and getter', function () {
          var autoAddAuthor = true;

          configs.setAutoAddAuthor(autoAddAuthor);

          expect(sealedConfigs().getAutoAddAuthor()).to.equal(true);
        });

        it('should throw an error if given value is not a boolean', function () {

          expect(function () {
            configs.setAutoAddAuthor('hello');
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): auto add author must be a boolean!'
          );
        });

        it('should default to false', function () {

          expect(sealedConfigs().getAutoAddAuthor()).to.equal(false);
        });

        it('should return config object', function () {

          expect(configs.setAutoAddAuthor(true)).to.eql(configs);
        });
      });

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

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setComponentPath(123);
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

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setContentPartialsPath(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): content partials path must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setContentPartialsPath('/content_types/')).to.eql(configs);
        });
      });

      context('date time format human readable', function () {

        it('should provide a getter and setter', function () {
          var dateFormat = 'M/d/yyyy h:mma';

          configs.setDateTimeFormatHumanReadable(dateFormat);

          expect(sealedConfigs().getDateTimeFormatHumanReadable()).to.equal(dateFormat);
        });

        it('should throw an error if given value is not a string', function () {

          expect(function () {
            configs.setDateTimeFormatHumanReadable(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): date time format human readable must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setDateTimeFormatHumanReadable('abc')).to.eql(configs);
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

      context('content api url', function () {

        it('should provide a setter and getter', function () {
          var url = '/content/url/';

          configs.setContentApiUrl(url);

          expect(sealedConfigs().buildContentApiUrl()).to.equal(url);
        });

        it('should provide a getter to build out a url', function () {
          var url = '/content/url/';
          var someId = '123456';

          configs.setContentApiUrl(url);

          expect(sealedConfigs().buildContentApiUrl(someId))
            .to.equal(url + someId);
        });

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setContentApiUrl(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): content api url must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setContentApiUrl('/content/url')).to.eql(configs);
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

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setDirectivePartialsPath(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): directive partials path must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setDirectivePartialsPath('/directives/path')).to.eql(configs);
        });
      });

      context('external url', function () {

        it('should provide a setter and getter', function () {
          var url = 'http://www.mysite.com';

          configs.setExternalUrl(url);

          expect(sealedConfigs().buildExternalUrl()).to.equal(url);
        });

        it('should provide a getter to build out a path', function () {
          var url = 'http://www.mysite.com';
          var path = '/whatever';

          configs.setExternalUrl(url);

          expect(sealedConfigs().buildExternalUrl(path))
            .to.equal(url + path);
        });

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setExternalUrl(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): external url must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setExternalUrl('/directives/path')).to.eql(configs);
        });
      });

      context('inline objects path', function () {

        it('should provide a getter and setter', function () {
          var path = '/inline-objects.json';

          configs.setInlineObjectsPath(path);

          expect(sealedConfigs().getInlineObjecsPath()).to.equal(path);
        });

        it('should throw an error if given value is not a string', function () {

          expect(function () {
            configs.setInlineObjectsPath(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): inline objects path must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setInlineObjectsPath('/inline-objects.json'))
            .to.equal(configs);
        });
      });

      context('internal url', function () {

        it('should provide a setter and getter', function () {
          var url = 'http://admin.mysite.com';

          configs.setInternalUrl(url);

          expect(sealedConfigs().buildInternalUrl()).to.equal(url);
        });

        it('should provide a getter to build out a path', function () {
          var url = 'http://admin.mysite.com';
          var path = '/whatever';

          configs.setInternalUrl(url);

          expect(sealedConfigs().buildInternalUrl(path))
            .to.equal(url + path);
        });

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setInternalUrl(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): internal url must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setInternalUrl('/directives/path')).to.eql(configs);
        });
      });

      context('timezone name', function () {

        it('should provide a setter and getter', function () {
          var timezone = 'Africa/Abidjan';

          configs.setTimezoneName('Africa/Abidjan');

          expect(sealedConfigs().getTimezoneName()).to.equal(timezone);
        });

        it('should throw an error if given value is not a valid timezone name', function () {
          var timezone = 'not a real timezone';

          expect(function () {
            configs.setTimezoneName(timezone);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): given timezone name "' + timezone + '" is not a valid timezone!'
          );
        });

        it('should default to "America/Chicago"', function () {

          expect(sealedConfigs().getTimezoneName()).to.equal('America/Chicago');
        });

        it('should return config object', function () {

          expect(configs.setTimezoneName('Africa/Abidjan')).to.equal(configs);
        });
      });

      context('top bar mappings', function () {

        it('should provide a setter and getter', function () {
          var name = 'nav';
          var template = 'nav.html';

          configs.setTopBarMapping(name, template);

          expect(sealedConfigs().getTopBarMapping(name)).to.equal(template);
        });

        it('should throw an error if given key is not a string', function () {

          expect(function () {
            configs.setTopBarMapping(123, 'garbage');
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): top bar mapping name must be a string!'
          );
        });

        it('should throw an error if given value is not a string', function () {

          expect(function () {
            configs.setTopBarMapping('nav', 123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): top bar mapping template must be a string!'
          );
        });

        it('should throw an error from the getter if given name has no mapping', function () {
          var name = 'no mapping for this thing!';

          expect(function () {
            sealedConfigs().getTopBarMapping(name);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): no top bar mapping exists for name "' + name + '"!'
          );
        });

        it('should return config object', function () {

          expect(configs.setTopBarMapping('nav', 'nav.html')).to.equal(configs);
        });
      });

      context('shared path', function () {

        it('should provide a setter and getter', function () {
          var path = '/directives/path';

          configs.setSharedPath(path);

          expect(sealedConfigs().buildSharedPath()).to.equal(path);
        });

        it('should provide a getter to build out a path', function () {
          var path = '/directives/path';
          var templatePath = '/my/content/directive.html';

          configs.setSharedPath(path);

          expect(sealedConfigs().buildSharedPath(templatePath))
            .to.equal(path + templatePath);
        });

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setSharedPath(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): shared path must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setSharedPath('/directives/path')).to.eql(configs);
        });
      });

      context('super features type', function () {

        it('should provide a getter and setter', function () {
          var type = 'core_super_features';

          configs.setSuperFeaturesType(type);

          expect(sealedConfigs().getSuperFeaturesType()).to.equal(type);
        });

        it('should throw an error if given value is not a string', function () {

          expect(function () {
            configs.setSuperFeaturesType(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): super features type must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setSuperFeaturesType('abc')).to.eql(configs);
        });
      });

      context('unpublished path', function () {
        var internalUrl = 'admin.my.site';

        beforeEach(function () {
          configs.setInternalUrl(internalUrl);
        });

        it('should provide a setter and getter', function () {
          var path = '/unpublished/path';

          configs.setUnpublishedPath(path);

          expect(sealedConfigs().buildUnpublishedUrl())
            .to.equal(internalUrl + path);
        });

        it('should provide a getter to build out a path', function () {
          var path = '/unpublished/path/';
          var someId = '123456';

          configs.setUnpublishedPath(path);

          expect(sealedConfigs().buildUnpublishedUrl(someId))
            .to.equal(internalUrl + path + someId);
        });

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setUnpublishedPath(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): unpublished path must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setUnpublishedPath('/unpublished/path')).to.eql(configs);
        });
      });

      context('video path', function () {
        var externalUrl = 'www.my.site';

        beforeEach(function () {
          configs.setExternalUrl(externalUrl);
        });

        it('should provide a setter and getter', function () {
          var path = '/videos/embed';

          configs.setVideoPath(path);

          expect(sealedConfigs().buildVideoUrl())
            .to.equal(externalUrl + path);
        });

        it('should provide a getter to build out a path', function () {
          var path = '/videos/embed/';
          var someId = '123456';

          configs.setVideoPath(path);

          expect(sealedConfigs().buildVideoUrl(someId))
            .to.equal(externalUrl + path + someId);
        });

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setVideoPath(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): video path must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setVideoPath('/videos/embed')).to.eql(configs);
        });
      });

      context('video thumbnail url', function () {

        it('should provide a getter and setter', function () {
          var url = 'http://my.garbage.videos/something/the/';

          configs.setVideoThumbnailUrl(url);

          expect(sealedConfigs().buildVideoThumbnailUrl()).to.equal(url);
        });

        it('should provide a getter to build out a path', function () {
          var url = 'http://my.garbage.videos/something/the/';
          var someVideo = 'my-favorite-video/';
          var someImage = 'frame_whatever.jpg';

          configs.setVideoThumbnailUrl(url);

          expect(sealedConfigs().buildVideoThumbnailUrl(someVideo, someImage))
            .to.equal(url + someVideo + someImage);
        });

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setVideoThumbnailUrl(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): video thumbnail url must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setVideoThumbnailUrl('http://my.garbage.com'))
            .to.eql(configs);
        });
      });
    });

    context('firebase', function () {

      context('api endpoint', function () {

        it('should provide a setter and getter', function () {
          var url = 'http://firebaseio.com';

          configs.setFirebaseUrl(url);

          expect(sealedConfigs().buildFirebaseUrl()).to.equal(url);
        });

        it('should provide a getter to build out a path', function () {
          var url = 'http://firebaseio.com';
          var path = '/whatever';

          configs.setFirebaseUrl(url);

          expect(sealedConfigs().buildFirebaseUrl(path))
            .to.equal(url + path);
        });

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setFirebaseUrl(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): firebase url must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setFirebaseUrl('http://firebaseio.com')).to.eql(configs);
        });
      });

      context('max article history', function () {

        it('should provide a setter and getter', function () {
          var num = 10;

          configs.setFirebaseMaxArticleHistory(num);

          expect(sealedConfigs().getFirebaseMaxArticleHistory()).to.equal(num);
        });

        it('should default to 25', function () {

          expect(sealedConfigs().getFirebaseMaxArticleHistory()).to.equal(25);
        });


        it('should throw an error if the given value is not a number', function () {

          expect(function () {
            configs.setFirebaseMaxArticleHistory('hello');
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): firebase max article history must be a number!'
          );
        });

        it('should return config object', function () {

          expect(configs.setFirebaseMaxArticleHistory(10)).to.eql(configs);
        });
      });

      context('site root path', function () {
        var firebaseUrl = 'http://firebaseio.com';

        beforeEach(function () {
          configs.setFirebaseUrl(firebaseUrl);
        });

        it('should provide a setter and getter', function () {
          var path = '/sites/onion/';

          configs.setFirebaseSiteRoot(path);

          expect(sealedConfigs().buildFirebaseSiteUrl())
            .to.equal(firebaseUrl + path);
        });

        it('should provide a getter to build out a path', function () {
          var path = '/sites/onion/';
          var someNode = '123';

          configs.setFirebaseSiteRoot(path);

          expect(sealedConfigs().buildFirebaseSiteUrl(someNode))
            .to.equal(firebaseUrl + path + someNode);
        });

        it('should throw an error if the given value is not a string', function () {

          expect(function () {
            configs.setFirebaseSiteRoot(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): firebase site url must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setFirebaseSiteRoot('/sites/onion')).to.eql(configs);
        });
      });
    });

    context('live blog', function () {

      context('author selection directive name', function () {

        it('should provide a setter and getter', function () {
          var name = 'my-author-selection-directive';

          configs.setLiveBlogAuthorSelectorDirectiveName(name);

          expect(sealedConfigs().getLiveBlogAuthorSelectorDirectiveName())
            .to.equal(name);
        });

        it('should throw an error if given value is not a string', function () {

          expect(function () {
            configs.setLiveBlogAuthorSelectorDirectiveName(123);
          }).to.throw(
            BulbsCmsConfigError,
            'Configuration Error (CmsConfig): live blog author selector directive name must be a string!'
          );
        });

        it('should return config object', function () {

          expect(configs.setLiveBlogAuthorSelectorDirectiveName('hello'))
            .to.equal(configs);
        });
      });
    });

    context('static assets', function () {

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
    });
  });
});
