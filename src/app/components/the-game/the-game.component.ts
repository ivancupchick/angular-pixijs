import { Component, ElementRef, HostListener, Input, NgZone, OnInit } from '@angular/core';
import * as PIXI from 'pixi.js';
import { Subject } from 'rxjs';

const REEL_WIDTH = 160;
const SYMBOL_SIZE = 150;

@Component({
  selector: 'app-the-game',
  template: ''
})
export class TheGameComponent implements OnInit {
  private tweening = [] as any[];

  public app!: PIXI.Application;

  @Input() public devicePixelRatio = window.devicePixelRatio || 1;
  @Input() public applicationOptions: PIXI.IApplicationOptions = { backgroundColor: 0x1099bb };
  @Input() startSubj!: Subject<boolean>;

  constructor(private elementRef: ElementRef, private ngZone: NgZone) {}

  init() {
    this.ngZone.runOutsideAngular(() => {
      this.app = new PIXI.Application(this.applicationOptions);

      this.initApp();
    });

    console.log(window.devicePixelRatio);

    this.elementRef.nativeElement.appendChild(this.app.view);
    this.resize();
  }

  ngOnInit(): void {
    this.init();
  }

  @HostListener('window:resize')
  public resize() {
    const width = 800;
    const height = 600;
    const viewportScale = 1 / this.devicePixelRatio;
    this.app.renderer.resize(width * this.devicePixelRatio, height * this.devicePixelRatio);
    this.app.view.style.transform = `scale(${viewportScale})`;
    this.app.view.style.transformOrigin = `top left`;
  }

  destroy() {
    this.app.destroy();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  initApp() {
    this.app.loader
      .add('assets/eggHead.png', 'assets/eggHead.png')
      .add('assets/flowerTop.png', 'assets/flowerTop.png')
      .add('assets/helmlok.png', 'assets/helmlok.png')
      .add('assets/skully.png', 'assets/skully.png')
      .load(this.onAssetsLoaded);

    this.app.ticker.add((delta) => {
      const now = Date.now();
      const remove = [];
      for (let i = 0; i < this.tweening.length; i++) {
        const t = this.tweening[i];
        const phase = Math.min(1, (now - t.start) / t.time);

        t.object[t.property] = this.lerp(
          t.propertyBeginValue,
          t.target,
          t.easing(phase)
        );
        if (t.change) t.change(t);
        if (phase === 1) {
          t.object[t.property] = t.target;
          if (t.complete) t.complete(t);
          remove.push(t);
        }
      }
      for (let i = 0; i < remove.length; i++) {
        this.tweening.splice(this.tweening.indexOf(remove[i]), 1);
      }
    });
  }

  onAssetsLoaded = () => {
    // Create different slot symbols.
    const slotTextures = [
      PIXI.Texture.from("assets/eggHead.png"),
      PIXI.Texture.from("assets/flowerTop.png"),
      PIXI.Texture.from("assets/helmlok.png"),
      PIXI.Texture.from("assets/skully.png"),
    ];

    // Build the reels
    const reels = [] as any[];
    const reelContainer = new PIXI.Container();
    for (let i = 0; i < 5; i++) {
      const rc = new PIXI.Container();
      rc.x = i * REEL_WIDTH;
      reelContainer.addChild(rc);

      const reel = {
        container: rc,
        symbols: [] as any[],
        position: 0,
        previousPosition: 0,
        blur: new PIXI.filters.BlurFilter(),
      };
      reel.blur.blurX = 0;
      reel.blur.blurY = 0;
      rc.filters = [reel.blur];

      // Build the symbols
      for (let j = 0; j < 4; j++) {
        const symbol = new PIXI.Sprite(
          slotTextures[Math.floor(Math.random() * slotTextures.length)]
        );
        // Scale the symbol to fit symbol area.
        symbol.y = j * SYMBOL_SIZE;
        symbol.scale.x = symbol.scale.y = Math.min(
          SYMBOL_SIZE / symbol.width,
          SYMBOL_SIZE / symbol.height
        );
        symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
        reel.symbols.push(symbol);
        rc.addChild(symbol);
      }
      reels.push(reel);
    }
    this.app.stage.addChild(reelContainer);

    // Build top & bottom covers and position reelContainer
    const margin = (this.app.screen.height - SYMBOL_SIZE * 3) / 2;
    reelContainer.y = margin;
    reelContainer.x = Math.round(this.app.screen.width - REEL_WIDTH * 5);
    const top = new PIXI.Graphics();
    top.beginFill(0, 1);
    top.drawRect(0, 0, this.app.screen.width, margin);
    const bottom = new PIXI.Graphics();
    bottom.beginFill(0, 1);
    bottom.drawRect(0, SYMBOL_SIZE * 3 + margin, this.app.screen.width, margin);

    // Add play text
    const style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fontStyle: "italic",
      fontWeight: "bold",
      fill: ["#ffffff", "#00ff99"], // gradient
      stroke: "#4a1850",
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
      wordWrap: true,
      wordWrapWidth: 440,
    });

    // Add header text
    const headerText = new PIXI.Text("PIXI MONSTER SLOTS!", style);
    headerText.x = Math.round((top.width - headerText.width) / 2);
    headerText.y = Math.round((margin - headerText.height) / 2);
    top.addChild(headerText);

    this.app.stage.addChild(top);
    this.app.stage.addChild(bottom);

    let running = false;

    this.startSubj
      .subscribe(() => {
        startPlay();
      })

    // Function to start playing.
    const startPlay = () => {
      if (running) return;
      running = true;

      for (let i = 0; i < reels.length; i++) {
        const r = reels[i];
        const extra = Math.floor(Math.random() * 3);
        const target = r.position + 10 + i * 5 + extra;
        const time = 2500 + i * 600 + extra * 600;
        this.tweenTo(
          r,
          "position",
          target,
          time,
          this.backout(0.5),
          null,
          i === reels.length - 1 ? reelsComplete : null
        );
      }
    }

    // Reels done handler.
    function reelsComplete() {
      running = false;
    }

    // Listen for animate update.
    this.app.ticker.add((delta) => {
      // Update the slots.
      for (let i = 0; i < reels.length; i++) {
        const r = reels[i];
        // Update blur filter y amount based on speed.
        // This would be better if calculated with time in mind also. Now blur depends on frame rate.
        r.blur.blurY = (r.position - r.previousPosition) * 8;
        r.previousPosition = r.position;

        // Update symbol positions on reel.
        for (let j = 0; j < r.symbols.length; j++) {
          const s = r.symbols[j];
          const prevy = s.y;
          s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
          if (s.y < 0 && prevy > SYMBOL_SIZE) {
            // Detect going over and swap a texture.
            // This should in proper product be determined from some logical reel.
            s.texture =
              slotTextures[Math.floor(Math.random() * slotTextures.length)];
            s.scale.x = s.scale.y = Math.min(
              SYMBOL_SIZE / s.texture.width,
              SYMBOL_SIZE / s.texture.height
            );
            s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
          }
        }
      }
    });
  }

  tweenTo(object: any, property: any, target: any, time: any, easing: any, onchange: any, oncomplete: any) {
    const tween = {
      object,
      property,
      propertyBeginValue: object[property],
      target,
      easing,
      time,
      change: onchange,
      complete: oncomplete,
      start: Date.now(),
    };

    this.tweening.push(tween);
    return tween;
  }

  // Basic lerp funtion.
  lerp(a1: number, a2: number, t: number) {
    return a1 * (1 - t) + a2 * t;
  }

  // Backout function from tweenjs.
  // https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
  backout(amount: number) {
    return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
  }
}
