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
    expect(createContentButton.isDisplayed()).to.equalTruthy();
  });

  it('modal should be invisible on the page', function () {
    expect(modal.isPresent()).to.equalTruthy();
    expect(modal.isDisplayed()).to.equalFalsy();
  });

  it('createContentButton click should display modal', function () {
    createContentButton.click();
    expect(modal.isDisplayed()).to.equalTruthy();
  });

  describe('create content modal', function () {
    beforeEach(function () {
      createContentButton.click();
      nextButton = element(by.css('button.next-pane'));
    });

    it('should have a next button', function () {
      expect(nextButton.isDisplayed()).to.equalTruthy();
    });

    describe('next panel', function () {
      beforeEach(function () {
        nextButton.click();
        titleInput = element(by.css('input.new-title'));
      });

      it('should have an input field', function () {
        expect(titleInput.isDisplayed()).to.equalTruthy();
      });

      //TODO: test that entering a title and pressing enter makes a new article

    });



  });
});
