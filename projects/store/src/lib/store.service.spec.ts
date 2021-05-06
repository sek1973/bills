import { TestBed } from '@angular/core/testing';
import { BillsStoreService } from './store.service';


describe('StoreService', () => {
  let service: BillsStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillsStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
