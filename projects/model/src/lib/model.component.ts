import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'lib-model',
    template: `
    <p>
      model works!
    </p>
  `,
    styles: [],
    standalone: false
})
export class ModelComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
