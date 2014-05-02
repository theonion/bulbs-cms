describe('changelog modal', function () {
  var ptor, moreButton, changelogButton, modal;

  var indexUrl = 'http://0.0.0.0:9069/cms/app/edit/1/';

  beforeEach(function () {
    browser.get(indexUrl);
    ptor = protractor.getInstance();

    moreButton = element(by.css('ul.nav li.dropdown a'));
    moreButton.click();

    changelogButton = element(by.css('a.changelog-button'));
    changelogButton.click()
  });

  it('should display the changelog', function () {
    var ul = element(by.css('div.modal-body ul.list-group'));
    expect(ul.isDisplayed()).toBeTruthy();
  });

});
