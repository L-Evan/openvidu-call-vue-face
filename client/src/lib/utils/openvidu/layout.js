import { OpenViduLayout } from "./baselayout"

import { LayoutClass } from "./openviduType"

class OpenViduLayoutService {
//   openviduLayout
//   openviduLayoutOptions

  constructor () {

  }

  initialize (timeout = null) {
    if (timeout) {
      setTimeout(() => {
        this._initialize()
      }, timeout)
    } else {
      this._initialize()
    }
  }

  _initialize () {
    this.openviduLayout = new OpenViduLayout()
    this.openviduLayoutOptions = this.getOptions()
    console.log("初始化，openviduLayout",document.getElementById("layout"))
    this.openviduLayout.initLayoutContainer(
      document.getElementById("layout"),
      this.openviduLayoutOptions
    )
  }

  getOptions () {
    const options = {
      maxRatio: 3 / 2, // The narrowest ratio that will be used (default 2x3)
      minRatio: 9 / 15, // The widest ratio that will be used (default 16x9)
      fixedRatio: false /* If this is true then the aspect ratio of the video is maintained
      and minRatio and maxRatio are ignored (default false) */,
      bigClass: LayoutClass.BIG_ELEMENT, // The class to add to elements that should be sized bigger
      smallClass: LayoutClass.SMALL_ELEMENT,
      bigPercentage: 0.85, // The maximum percentage of space the big ones should take up
      bigFixedRatio: false, // fixedRatio for the big ones
      bigMaxRatio: 3 / 2, // The narrowest ratio to use for the big elements (default 2x3)
      bigMinRatio: 9 / 16, // The widest ratio to use for the big elements (default 16x9)
      bigFirst: true, // Whether to place the big one in the top left (true) or bottom right
      animate: true // Whether you want to animate the transitions. Invalid property, to disable it remove   transition: all .1s linear;
    }
    return options
  }

  update (timeout) {
    if (this.openviduLayout) {
      if (!timeout) {
        this.openviduLayout.updateLayout()
        return
      }
      setTimeout(() => {
        this.openviduLayout.updateLayout()
      }, timeout)
    }
  }

  getLayout () {
    return this.openviduLayout
  }

  clear () {
    this.openviduLayout = null
  }
}
export const openViduLayoutService = new OpenViduLayoutService()