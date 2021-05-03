import { DateToStringPipe } from './timespan-to-string.pipe';

describe('TimespanToStringPipe', () => {
  it('create an instance', () => {
    const pipe = new DateToStringPipe();
    expect(pipe).toBeTruthy();
  });
});
