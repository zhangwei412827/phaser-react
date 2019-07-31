// //////////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2016-present
//  Licensed under the The MIT License (MIT)
//  https://choosealicense.com/licenses/mit/
//
//  Github Home: https://github.com/AlexWang1987
//  Author: alexwong
//  Date: 2018-01-12 16:14:17
//  Email: 1669499355@qq.com
//  Last Modified time: 2018-03-09 14:49:50 by {{last_modified_by}}
//  Description: PhaserNavigator
//
// //////////////////////////////////////////////////////////////////////////////

import PhaserComponent from './phaser_component';

export default class PhaserNavigator {
  constructor() {
    PhaserComponent._navigator = this;
  }

  init(params = {}) {
    // init phaser stage parameters
    this.game.stage.disableVisibilityChange = params.disableVisibilityChange || false

    PhaserComponent._game = this.game;
  }

  update() {
    this._com_stack.forEach(({ com }) => com.update && com.update())
  }

  render() {
    this._com_stack.forEach(({ com }) => com.render && com.render())
  }

  reg(com_id, Component) {
    this._com_regs[com_id] = Component
  }

  level(key) {
    const lowerLevels = this._com_stack.filter((com) => com.com_id === key)
    return lowerLevels.length && lowerLevels[0]
  }

  clear(clear_cache) {
    if (this.game) {
      this.game.tweens.removeAll();
      this.game.time.removeAll();
      this.game.world.shutdown();
      if (clear_cache) {
        this.game.cache.destroy();
      }
      console.warn('THE WORLD IS CLEARED!')
    }
  }

  // 当前互动
  _com_idx = ''
  //以key:value的形式存储注册的互动
  _com_regs = {}
  //当前大屏正在进行中的所有互动
  _com_stack = []

  get com_idx() {
    return this._com_idx
  }

  // resolve flag
  _com_nav_promise = undefined

  get com_nav_promise() {
    return this._com_nav_promise
  }

  // next
  _com_next_idx = undefined

  get com_next_idx() {
    return this._com_next_idx
  }

  /**
   * 
   * @param {String} 组件key，多个组件以‘/’分割 
   * @param {*} params 
   */
  goto(new_com_idx = '', params) {
    if (this._com_nav_promise) {
      console.warn('PHASER NAVIGATOR IS SWITCHING, PLEASE USE com_nav_promise INSTEAD.');
      return this._com_nav_promise
    }

    this._com_nav_promise = this._goto(new_com_idx, params)

    this._com_nav_promise.then(() => {
      this._com_nav_promise = undefined
    })

    return this._com_nav_promise
  }
  /**
   * 
   * @param {Array} new_com_idx 已注册的互动组件的key
   * @param {*} params 参数
   */
  async _goto(new_com_idx = '', params) {
    if (this._com_idx === new_com_idx) {
      console.warn('the same path ignored.')
      return
    }
    this._com_next_idx = new_com_idx
    //播放组件队列,如“floorBackground/countDown”
    const new_com_stack = new_com_idx.split('/').filter(i => i)
    //空跳转，例如goto('')
    if (!new_com_stack.length) {
      // console.warn('goto is empty and be ignored.')
      await this._destoryComponents(this._com_stack.splice(0))
      this._com_idx = new_com_idx
      this._com_next_idx = undefined
      this.clear()
      return
    }
    //当前无进行中的互动
    if (!this._com_idx) {
      await this._createComponents(new_com_stack, params)
      //记录当前互动
      this._com_idx = new_com_idx
      //下一个互动设置为undefined
      this._com_next_idx = undefined
      return
    }

    //记录索引，如果队列中存在该互动，则不重新渲染，只渲染队列中不存在的互动，用于优化
    let diff_index = -1

    for (let i = 0; i < new_com_stack.length; i++) {
      const target_id = new_com_stack[i]
      const current_id = this._com_stack[i] && this._com_stack[i].com_id

      if (current_id === undefined || target_id !== current_id) {
        diff_index = i
        break
      }
    }

    if (diff_index === -1) {
      diff_index = new_com_stack.length
    }
    //销毁的互动
    const desComs = this._com_stack.splice(diff_index);
    //创建的互动
    const creComs = new_com_stack.slice(diff_index)

    await this._destoryComponents(desComs)

    // clear
    if (diff_index === 0) {
      this.clear()
    }

    await this._createComponents(creComs, params)

    console.log('phaser_navigator[', this._com_idx, ']->[', new_com_idx, ']');

    this._com_idx = new_com_idx
    this._com_next_idx = undefined
  }

  /**
   * 
   * @param {Array} 已注册的互动组件的key 
   * @param {*} params 参数
   */
  async _createComponents(create_com_idx, params = {}) {
    if (!create_com_idx.length) return

    try {
      for (let i = 0; i < create_com_idx.length; i++) {
        const new_com_id = create_com_idx[i]
        //互动组件类
        const PhaserComponentClass = this._com_regs[new_com_id];

        if (!PhaserComponentClass) throw new Error('this component has not been registered.')

        //实例化该组件
        const phaser_component = new PhaserComponentClass();

        if (phaser_component.init) {
          await phaser_component.init(params);
        }

        if (phaser_component.preload) {
          phaser_component.preload();
          this.game.load.start();
          //所有资源加载完毕，才调用create
          await this._cacheComplete();
        }

        if (phaser_component.create) {
          phaser_component.create();
        }
        //缓存大屏进行中的互动
        this._com_stack.push({ com_id: new_com_id, com: phaser_component })
      }
    } catch (e) {
      console.error('phaser_navigator create component errors', e)
    }
  }

  /**
   * 
   * @param {Array} 互动队列 
   */
  async _destoryComponents(coms) {
    if (!coms.length) return
    try {
      const com_shutdown_promises = []
      for (let i = coms.length - 1; i >= 0; i--) {
        //进行中的互动以com_id:com方式存储
        const com = await coms[i].com
        if (com.shutdown) {
          com_shutdown_promises.push(com.shutdown())
        }
      }
      await Promise.all(com_shutdown_promises)
    } catch (e) {
      console.error('Destoring components failed.', e);
    }
  }

  /**
   * 检测是否所有的loaders已经加载完毕
   */
  async _cacheComplete() {
    if (!this.game.load.hasLoaded) {
      return new Promise((res) => {
        this.game.load.onLoadComplete.addOnce(res);
      })
    }
  }
}
