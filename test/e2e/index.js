describe('index page', function () {
  var ptor, elem;

  var indexUrl = 'http://0.0.0.0:9069/cms/app/list/published/';

  beforeEach(function () {
    browser.get(indexUrl);
    ptor = protractor.getInstance();
  });

  describe('create content button', function () {
    it('should have a create content button', function () {
      elem = by.css('[data-target="#create"]');

      expect(element(elem).isPresent()).toBeTruthy()
    });
  });

});