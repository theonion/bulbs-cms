describe('CreateContentConfig', function () {

  var $compile;
  var $injector;
  var provider;
  var sandbox;

  beforeEach(function () {
    module(
      'bulbs.cms.components.createContent.config',
      function (CreateContentConfigProvider) {
        provider = CreateContentConfigProvider;
      }
    );

    inject(function (_$compile_, _$injector_) {
      $compile = _$compile_;
      $injector = _$injector_;
    });

    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  context('adding a content type', function () {

    it('should create listing for given content type', function () {
      var contentTypeSpec = {
        title: 'Article',
        payload: { feature_type: 'something' },
        context: {
          some: 'context',
          for: 'the template'
        }
      };

      provider.addContentType(contentTypeSpec);

      var contentType = $injector.invoke(provider.$get).getContentTypes()[0];
      expect(contentType.title).to.equal(contentTypeSpec.title);
      expect(contentType.defaultPayload).to.eql(contentTypeSpec.payload);
    });

    it('should use provided directive', function () {
      var directiveName = 'my-garbage-directive';

      provider.addContentType({
        title: 'Article',
        payload: { feature_type: 'something' },
        directive: directiveName
      })

      expect($injector.invoke(provider.$get).getContentTypes()[0].directive)
        .to.eql($compile(directiveName)({}));
    });

    it('should throw an error when not given an argument', function () {

      expect(function () {
        provider.addContentType();
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): must provide parameters when adding a content type!');
    });

    it('should thrown an error when title is not provided', function () {

      expect(function () {
        provider.addContentType({
          payload: { feature_type: 'something' }
        });
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): all content types must have a title!');
    });

    it('should throw an error when a payload is not provided', function () {
      var title = 'My Garbage Article';

      expect(function () {
        provider.addContentType({
          title: title
        });
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): payload not provided for "' + title + '"!');
    });

    it('should throw an error when feature_type is not included in payload', function () {
      var title = 'Garbage';

      expect(function () {
        provider.addContentType({
          title: title,
          payload: {}
        });
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): provide a feature type for "' + title + '"!');
    });

    it('should throw an error when attempting to add a content type with a title that already exists', function () {
      var title = 'Garbage';

      provider.addContentType({
        title: title,
        payload: { feature_type: 'garbage' }
      });

      expect(function () {
        provider.addContentType({
          title: title,
          payload: { feature_type: 'garbage' }
        });
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): "' + title + '" is not unique!');
    });

    it('should provide a default directive', function () {

      provider.addContentType({
        title: 'Article',
        payload: { feature_type: 'something' }
      });

      expect($injector.invoke(provider.$get).getContentTypes()[0].directive)
        .to.eql($compile('create-content-default')({}));
    });

    it('should return the configuration object', function () {

      var config = provider.addContentType({
        title: 'Article',
        payload: { feature_type: 'garbage' }
      });

      expect(config).to.equal(provider);
    });
  });

  context('getting content types', function () {

    it('should return all content types', function () {
      var parentTitle1 = 'Garbage Parent 1';
      var parentTitle2 = 'Garbage Parent 2';

      provider.addContentType({
        title: parentTitle1,
        payload: { feature_type: 'abc' }
      });
      provider.addContentType({
        title: parentTitle2,
        payload: { feature_type: 'abc' }
      });

      var contentTypes = $injector.invoke(provider.$get).getContentTypes();
      expect(contentTypes.length).to.equal(2);
      expect(contentTypes[0].title).to.equal(parentTitle1);
      expect(contentTypes[1].title).to.equal(parentTitle2);
    });
  });
});
