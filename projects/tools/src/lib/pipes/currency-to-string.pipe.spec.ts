import { CurrencyToStringPipe } from './currency-to-string.pipe';

describe('CurrencyToStringPipe', () => {
  it('create an instance', () => {
    const pipe = new CurrencyToStringPipe();
    expect(pipe).toBeTruthy();
  });
});
