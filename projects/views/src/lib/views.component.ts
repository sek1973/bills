import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'lib-views',
    template: `
    <p>
      views works!
    </p>
  `,
    styles: [],
    standalone: false
})
export class ViewsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
