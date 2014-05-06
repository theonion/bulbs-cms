describe('create content directive', function () {
  var ptor, createContentButton, modal, nextButton, titleInput;

  var indexUrl = 'http://0.0.0.0:9069/cms/app/list/published/';

  beforeEach(function () {
    browser.get(indexUrl);
    ptor = protractor.getInstance();
  });

  beforeEach(function () {
    createContentButton = element(by.css('[data-target="#create"]'));
    modal = element(by.id('create'));
  })

  it('createContentButton should be displayed on the page', function () {
    expect(createContentButton.isDisplayed()).toBeTruthy();
  });

  it('modal should be invisible on the page', function () {
    expect(modal.isPresent()).toBeTruthy();
    expect(modal.isDisplayed()).toBeFalsy();
  });

  it('createContentButton click should display modal', function () {
    createContentButton.click();
    expect(modal.isDisplayed()).toBeTruthy();
  });

  describe('create content modal', function () {
    beforeEach(function () {
      createContentButton.click();
      nextButton = element(by.css('button.next-pane'));
    });

    it('should have a next button', function () {
      expect(nextButton.isDisplayed()).toBeTruthy();
    });

    describe('next panel', function () {
      beforeEach(function () {
        nextButton.click();
        titleInput = element(by.css('input.new-title'));
      });

      it('should have an input field', function () {
        expect(titleInput.isDisplayed()).toBeTruthy();
      });

      //TODO: test that entering a title and pressing enter makes a new article

    });



  });
});
