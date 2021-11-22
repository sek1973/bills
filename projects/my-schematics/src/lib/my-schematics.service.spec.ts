import { TestBed } from '@angular/core/testing';

import { MySchematicsService } from './my-schematics.service';

describe('MySchematicsService', () => {
  let service: MySchematicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MySchematicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
