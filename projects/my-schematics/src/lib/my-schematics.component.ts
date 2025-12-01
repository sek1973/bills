import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'lib-my-schematics',
    template: `
    <p>
      my-schematics works!
    </p>
  `,
    styles: [],
    standalone: false
})
export class MySchematicsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
