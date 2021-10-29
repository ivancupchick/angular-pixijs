import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { GameWrapperModule } from 'src/app/components/game-wrapper/game-wrapper.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: '',
  component: GameComponent
}]

@NgModule({
  declarations: [
    GameComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    GameWrapperModule
  ]
})
export class GameModule { }
