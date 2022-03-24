import { OpenVidu } from "openvidu-browser"
import { CameraType, Storage } from "./openviduType"
import { utils } from "./openviduUtils"
import { storageSrv } from "./newStory"
class DevicesService {
  constructor () {
    this.OV = null
    // 所有设备
    this.devices = []
    // 摄像
    this.cameras = []
    // 麦
    this.microphones = []
    // 现在选择的设备
    this.camSelected = null
    this.micSelected = null
    // 获取状态
    this.videoDevicesDisabled = false
    this.audioDevicesDisabled = false
    this.OV = new OpenVidu()
    this.Uutils = utils
    this.storageSrv = storageSrv
  }
  // 页面更新 判断下需要更新config么
  needUpdateAudioTrack (newAudioSource) {
    return this.getMicSelected().device !== newAudioSource
  }
  async initDevices () {
    await this.initOpenViduDevices()
    this.devices.length > 0
      ? console.log("Devices found: ", this.devices)
      : console.log("No devices found!")
    this.resetDevicesArray()
    if (this.hasAudioDeviceAvailable()) {
      this.initAudioDevices()
      this.micSelected = this.getMicSelected()
    }
    if (this.hasVideoDeviceAvailable()) {
      this.initVideoDevices()
      this.camSelected = this.cameras.find(
        device => device.type === CameraType.FRONT
      )
    }
  }
  /**
   * 初始化获取全部设备
   */
  async initOpenViduDevices () {
    this.devices = await this.OV.getDevices()
    console.log("奇怪了", this.devices)
  }

  initAudioDevices () {
    const audioDevices = this.devices.filter(
      device => device.kind === "audioinput"
    )
    audioDevices.forEach(device => {
      this.microphones.push({ label: device.label, device: device.deviceId })
    })
  }

  initVideoDevices () {
    const FIRST_POSITION = 0
    const videoDevices = this.devices.filter(
      device => device.kind === "videoinput"
    )
    videoDevices.forEach((device, index) => {
      const myDevice = {
        label: device.label,
        device: device.deviceId,
        type: CameraType.BACK
      }
      //
      if (this.Uutils.isMobile()) {
        // We assume front video device has 'front' in its label in Mobile devices
        // 使用前置摄像头
        if (
          myDevice.label.toLowerCase().includes(CameraType.FRONT.toLowerCase())
        ) {
          myDevice.type = CameraType.FRONT
        }
      } else {
        // We assume first device is web camera in Browser Desktop
        if (index === FIRST_POSITION) {
          myDevice.type = CameraType.FRONT
        }
      }

      this.cameras.push(myDevice)
    })
    console.log("Camera selected", this.camSelected)
  }

  getCamSelected () {
    if (this.cameras.length === 0) {
      console.log("No video devices found!")
      return
    }
    // 看看以前选过么 这里简单处理
    const storageDevice = this.getCamFromStorage()
    if (storageDevice) {
      return storageDevice
    }
    return this.camSelected || this.cameras[0]
  }
  //获取缓存的
  getCamFromStorage () {
    let storageDevice = this.storageSrv.get(Storage.VIDEO_DEVICE)
    storageDevice = this.getCameraByDeviceField(storageDevice?.device)
    if (storageDevice) {
      return storageDevice
    }
  }

  getMicSelected () {
    if (this.microphones.length === 0) {
      console.log("No audio devices found!")
      return
    }
    const storageDevice = this.getMicFromStogare()
    if (storageDevice) {
      return storageDevice
    }
    return this.micSelected || this.microphones[0]
  }

  getMicFromStogare () {
    let storageDevice = this.storageSrv.get(Storage.AUDIO_DEVICE)
    storageDevice = this.getMicrophoneByDeviceField(storageDevice?.device)
    if (storageDevice) {
      return storageDevice
    }
  }

  setCamSelected (deviceField) {
    this.camSelected = this.getCameraByDeviceField(deviceField)
    this.saveCamToStorage(this.camSelected)
  }

  saveCamToStorage (cam) {
    this.storageSrv.set(Storage.VIDEO_DEVICE, cam)
  }

  setMicSelected (deviceField) {
    this.micSelected = this.getMicrophoneByDeviceField(deviceField)
    this.saveMicToStorage(this.micSelected)
  }
  saveMicToStorage (mic) {
    this.storageSrv.set(Storage.AUDIO_DEVICE, mic)
  }

  needUpdateVideoTrack (newVideoSource) {
    return this.getCamSelected().device !== newVideoSource
  }
 
  getCameras () {
    return this.cameras
  }

  getMicrophones () {
    return this.microphones
  }
  /**
   * 有无可用
   * @returns
   */
  hasVideoDeviceAvailable () {
    return (
      !this.videoDevicesDisabled &&
      !!this.devices?.find(device => device.kind === "videoinput")
    )
  }

  hasAudioDeviceAvailable () {
    return (
      !this.audioDevicesDisabled &&
      !!this.devices?.find(device => device.kind === "audioinput")
    )
  }

  cameraNeedsMirror (deviceField) {
    return this.getCameraByDeviceField(deviceField)?.type === CameraType.FRONT
  }

  areEmptyLabels () {
    return (
      !!this.cameras.find(device => device.label === "") ||
      !!this.microphones.find(device => device.label === "")
    )
  }

  disableVideoDevices () {
    this.videoDevicesDisabled = true
  }

  disableAudioDevices () {
    this.audioDevicesDisabled = true
  }

  clear () {
    this.OV = new OpenVidu()
    this.devices = []
    this.cameras = []
    this.microphones = []
    this.camSelected = null
    this.micSelected = null
    this.videoDevicesDisabled = false
    this.audioDevicesDisabled = false
  }

  getCameraByDeviceField (deviceField) {
    return this.cameras.find(
      opt => opt.device === deviceField || opt.label === deviceField
    )
  }

  getMicrophoneByDeviceField (deviceField) {
    return this.microphones.find(
      opt => opt.device === deviceField || opt.label === deviceField
    )
  }

  resetDevicesArray () {
    this.cameras = [{ label: "None", device: null, type: null }]
    this.microphones = [{ label: "None", device: null, type: null }]
  }
}

export const devicesService = new DevicesService()
