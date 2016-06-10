describe('CreateContentConfig', function () {

  var provider;
  var sandbox;

  beforeEach(function () {
    module(
      'bulbs.cms.components.createContent.config',
      function (CreateContentConfigProvider) {
        provider = CreateContentConfigProvider;
      }
    );

    inject();

    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  context('adding a content type', function () {

    it('should create listing for given content type', function () {
      var title = 'Garbage';
      var featureType = 'my_custom_feature';
      var foo = 'some extra thing';

      provider.addContentType(title, {
        feature_type: featureType,
        foo: foo
      });

      var contentType = provider.$get().getContentTypes()[0];
      expect(contentType.title).to.equal(title);
      expect(contentType.contentData.feature_type).to.equal(featureType);
      expect(contentType.contentData.foo).to.eql(foo);
    });

    it('should thrown an error when title is not provided', function () {

      expect(function () {
        provider.addContentType();
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): all content types must have titles!');
    });

    it('should throw an error when feature_type is not included', function () {
      var title = 'Garbage';

      expect(function () {
        provider.addContentType(title);
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): provide a feature type for "' + title + '"!');
    });

    it('should throw an error when attempting to add a content type with a title that already exists', function () {
      var title = 'Garbage';

      provider.addContentType(title, { feature_type: 'garbage' });

      expect(function () {
        provider.addContentType(title, { feature_type: 'my_other_content_type' });
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): "' + title + '" is not unique!');
    });

    it('should return the configuration object', function () {

      var config = provider.addContentType('Garbage', { feature_type: 'my_content_type' });

      expect(config).to.equal(provider);
    });
  });

  context('adding a content sub type', function () {

    it('should create listing for given content type', function () {
      var title = 'Garbage';
      var featureType = 'my_custom_feature';
      var foo = 'some extra thing';
      var parentTitle = 'Garbage Parent';
      provider.addContentType(parentTitle, { feature_type: 'abc'});

      provider.addContentSubType(parentTitle, title, {
        feature_type: featureType,
        foo: foo
      });

      var contentType = provider.$get().getContentSubTypes(parentTitle)[0];
      expect(contentType.parentTitle).to.equal(parentTitle);
      expect(contentType.title).to.equal(title);
      expect(contentType.contentData.feature_type).to.equal(featureType);
      expect(contentType.contentData.foo).to.eql(foo);
    });

    it('should thrown an error when title is not provided', function () {
      var parentTitle = 'Garbage Parent';
      provider.addContentType(parentTitle, { feature_type: 'abc'});

      expect(function () {
        provider.addContentSubType(parentTitle);
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): all content types must have titles!');
    });

    it('should throw an error when feature_type is not included', function () {
      var title = 'Garbage';
      var parentTitle = 'Garbage Parent';
      provider.addContentType(parentTitle, { feature_type: 'abc'});

      expect(function () {
        provider.addContentSubType(parentTitle, title);
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): provide a feature type for "' + title + '"!');
    });

    it('should throw an error when attempting to add a content type with a title that already exists', function () {
      var title = 'Garbage';
      var parentTitle = 'Garbage Parent';
      provider.addContentType(parentTitle, { feature_type: 'abc'});

      provider.addContentSubType(parentTitle, title, { feature_type: 'garbage' });

      expect(function () {
        provider.addContentSubType(parentTitle, title, { feature_type: 'my_other_content_type' });
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): "' + title + '" is not unique!');
    });

    it('should return the configuration object', function () {
      var parentTitle = 'Garbage Parent';
      provider.addContentType(parentTitle, { feature_type: 'abc'});

      var config = provider.addContentSubType(parentTitle, 'Garbage', { feature_type: 'my_content_type' });

      expect(config).to.equal(provider);
    });

    it('should throw an error if given a parent that doesn\'t exist', function () {
      var parentTitle = 'Garbage Parent';
      var title = 'Garbage';

      expect(function () {
        provider.addContentSubType(parentTitle, title, { feature_type: 'my_content_type' });
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): parent "' + parentTitle + '" for content sub type "' + title + '" doesn\'t exist!');
    });

    it('should prevent creating a sub type for a sub type', function () {
      var parentTitle = 'Garbage Parent';
      var subTitle = 'Garbage Child';
      var subSubTitle = 'Garbage';
      provider.addContentType(parentTitle, { feature_type: 'abc'});
      provider.addContentSubType(parentTitle, subTitle, { feature_type: 'something' });

      expect(function () {
        provider.addContentSubType(subTitle, subSubTitle, { feature_type: 'something' });
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): cannot nest sub type "' + subSubTitle + '" under parent "' + subTitle + '" which is already a child!');
    });
  });

  context('getting content types', function () {

    it('should return all parents', function () {
      var parentTitle1 = 'Garbage Parent 1';
      var parentTitle2 = 'Garbage Parent 2';

      provider.addContentType(parentTitle1, { feature_type: 'abc' });
      provider.addContentType(parentTitle2, { feature_type: 'abc' });
      provider.addContentSubType(parentTitle1, 'Garbage Child', { feature_type: 'abc123' });

      var contentTypes = provider.$get().getContentTypes();
      expect(contentTypes.length).to.equal(2);
      expect(contentTypes[0].title).to.equal(parentTitle1);
      expect(contentTypes[1].title).to.equal(parentTitle2);
    });
  });

  context('getting content sub types', function () {

    it('should return all children of given parent', function () {
      var parentTitle1 = 'Garbage Parent 1';
      var subTitle1 = 'Garbage Child 1';
      var subTitle2 = 'Garbage Child 2';

      provider.addContentType(parentTitle1, { feature_type: 'abc' });
      provider.addContentSubType(parentTitle1, subTitle1, { feature_type: 'abc' });
      provider.addContentSubType(parentTitle1, subTitle2, { feature_type: 'abc123' });

      var contentTypes = provider.$get().getContentSubTypes(parentTitle1);
      expect(contentTypes.length).to.equal(2);
      expect(contentTypes[0].title).to.equal(subTitle1);
      expect(contentTypes[1].title).to.equal(subTitle2);
    });

    it('should throw an error if not passed a title argument', function () {

      expect(function () {
        provider.$get().getContentSubTypes();
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): parent title not given to subtype search!');
    });

    it('should throw an error if parent doesn\'t exist', function () {

      expect(function () {
        provider.$get().getContentSubTypes('Not a Parent');
      }).to.throw(BulbsCmsConfigError, 'Configuration Error (CreateContentConfig): parent given to subtype search does not exist!');
    });
  });
});
