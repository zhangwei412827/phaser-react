// //////////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2016-present
//  Licensed under the The MIT License (MIT)
//  https://choosealicense.com/licenses/mit/
//
//  Github Home: https://github.com/AlexWang1987
//  Author: AlexWang
//  Date: 2018-01-17 17:18:14
//  Email: 1669499355@qq.com
//  Last Modified time: 2018-02-06 18:20:23 by {{last_modified_by}}
//  Description: phaser-react-part
//
// //////////////////////////////////////////////////////////////////////////////

import { PhaserComponent } from '../index.js';

export default class Part extends PhaserComponent {
  preload() {
    this.load.image(`lightning`, './assets/lightning.png')
  }

  create() {
    const emitter = this.add.emitter(0, 0, 20);

    emitter.makeParticles('lightning');
    emitter.setScale(0.2, 1, 0.2, 1)
    emitter.setAlpha(0.6, 1)

    emitter.flow(3000, 1, 1)

    const tween = this.add.tween(emitter).to({
      x: this.world.width,
      y: this.world.height
    }, 1500, Phaser.Easing.Linear.None, true)
  }

  shutdown() {
    return new Promise((res, rej) => {
      this.world.remove(this.lightning)
      console.log('shutdown');
      setTimeout(res, 10000)
    })
  }
}
