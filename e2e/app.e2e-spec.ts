import { EmiPage } from './app.po';

describe('emi App', function() {
  let page: EmiPage;

  beforeEach(() => {
    page = new EmiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
