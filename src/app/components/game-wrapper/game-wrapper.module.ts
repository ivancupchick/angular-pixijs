import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameWrapperComponent } from './game-wrapper.component';
import { TheGameModule } from '../the-game/the-game.module';


@NgModule({
  declarations: [
    GameWrapperComponent
  ],
  exports: [
    GameWrapperComponent
  ],
  imports: [
    CommonModule,
    TheGameModule
  ]
})
export class GameWrapperModule { }
