import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: '',
  loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
}, {
  path: 'game',
  loadChildren: () => import('./pages/game/game.module').then(m => m.GameModule),
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
