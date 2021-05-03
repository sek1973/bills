import { AddHiddenAttributeDirective } from './add-hidden-attribute.directive';

describe('AddAttributeDirective', () => {
  it('should create an instance', () => {
    const directive = new AddHiddenAttributeDirective(undefined, undefined);
    expect(directive).toBeTruthy();
  });
});
