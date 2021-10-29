import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-game-wrapper',
  templateUrl: './game-wrapper.component.html',
  styleUrls: ['./game-wrapper.component.scss']
})
export class GameWrapperComponent implements OnInit {

  startSubj = new Subject<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  startSpin() {
    this.startSubj.next(true);
  }

}
