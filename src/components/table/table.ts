import { Component } from '@angular/core';

/**
 * Generated class for the TableComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'table',
  templateUrl: 'table.html'
})
export class TableComponent {

  text: string;

  constructor() {
    console.log('Hello TableComponent Component');
    this.text = 'Hello World';
  }

}
