import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'lib-tools',
    template: `
    <p>
      tools works!
    </p>
  `,
    styles: [],
    standalone: true
})
export class ToolsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
