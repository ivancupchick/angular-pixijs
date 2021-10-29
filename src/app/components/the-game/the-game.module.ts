import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TheGameComponent } from './the-game.component';



@NgModule({
  declarations: [
    TheGameComponent
  ],
  exports: [
    TheGameComponent
  ],
  imports: [
    CommonModule
  ]
})
export class TheGameModule { }
