import { NumberToPercentPipe } from './number-to-percent.pipe';

describe('NumberToPercentPipe', () => {
  it('create an instance', () => {
    const pipe = new NumberToPercentPipe();
    expect(pipe).toBeTruthy();
  });
});
