// //////////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2016-present
//  Licensed under the The MIT License (MIT)
//  https://choosealicense.com/licenses/mit/
//
//  Github Home: https://github.com/AlexWang1987
//  Author: alexwong
//  Date: 2018-01-02 20:54:54
//  Email: 1669499355@qq.com
//  Last Modified time: 2018-02-07 17:46:43 by {{last_modified_by}}
//  Description: futuquant-main
//
// //////////////////////////////////////////////////////////////////////////////

import phaser_react from '../index.js';

export default  class B extends phaser_react.PhaserComponent {

  create() {
    this.container = this.make.group(null);
  }

  shutdown() {
    this.world.remove(this.bg)
    this.bg = null
    // this.dog = null
    return new Promise((res) => {
      setTimeout(() => {
        console.log('2000');
        res()
      }, 2000)
    })
  }
}
