import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'lib-store',
    template: `
    <p>
      store works!
    </p>
  `,
    styles: [],
    standalone: false
})
export class StoreComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
