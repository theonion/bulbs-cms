describe('Utils', function () {

  var $injector;
  var sandbox;
  var utils;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'bulbs.cms.utils',
      function (UtilsProvider) {
        utils = UtilsProvider;
      }
    );

    inject(function (_$injector_) {
      $injector = _$injector_;
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should be the same object after providers have resolved', function () {

    expect($injector.invoke(utils.$get)).to.eql(utils);
  });

  context('path utilities', function () {

    it('should have a join function', function () {
      var first = '/first';
      var second = 'second';

      var constructed = utils.path.join(first, second);

      expect(constructed).to.equal(first + '/' + second);
    });

    it('should preserve scheme for urls', function () {
      var url = 'https://my.example.com';
      var path = '/some/path';

      var constructed = utils.path.join(url, path);

      expect(constructed).to.equal(url + path);
    });

    it('should join argument lists', function () {
      var one = 'one';
      var two = 'two';
      var three = 'three';

      var constructed = utils.path.join(one, two, three);

      expect(constructed).to.equal(one + '/' + two + '/' + three);
    });

    it('should strip existing separators from given arguments', function () {
      var one = 'one/';
      var two = '/two';

      var constructed = utils.path.join(one, two);

      expect(constructed).to.equal(one.replace('/', '') + '/' + two.replace('/', ''));
    });

    it('should keep first separator in first argument', function () {
      var one = '/one';
      var two = 'two';

      var constructed = utils.path.join(one, two);

      expect(constructed).to.equal(one + '/' + two);
    });

    it('should flatten arguments list', function () {
      var one = 'one';
      var two = 'two';
      var three = 'three';

      var constructed = function () {
        return utils.path.join(arguments);
      }.call(null, one, two, three);

      expect(constructed).to.equal(one + '/' + two + '/' + three);
    });
  });
});
