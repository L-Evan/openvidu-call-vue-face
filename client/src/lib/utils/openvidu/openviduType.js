const CameraType = {
  FRONT: "FRONT",
  BACK: "BACK"
}
const VideoType = {
  CAMERA: "CAMERA",
  SCREEN: "SCREEN",
  CUSTOM: "CUSTOM"
}
const environment = {
  production: false,
  openvidu_url: "",
  openvidu_secret: ""
}
const ScreenType = {
  WINDOW: "window",
  SCREEN: "screen"
}
const AvatarType = {
  DEFAULT: "default",
  CAPTURED: "captured"
}
const Storage = {
  USER_NICKNAME: "openviduCallNickname",
  VIDEO_DEVICE: "openviduCallVideoDevice",
  AUDIO_DEVICE: "openviduCallAudioDevice"
}

// -----------
const VideoSizeIcon = {
  BIG: "el-icon-zoom-out" ,
  NORMAL: "el-icon-zoom-in",
}

const VideoFullscreenIcon = {
  BIG: "el-icon-full-screen",
  NORMAL: "el-icon-crop"
}
const LayoutType = {
  ROOT_CLASS: "OT_root"
}

const LayoutClass = {
  BIG_ELEMENT: "OV_big",
  SMALL_ELEMENT: "OV_small"
}
const CHECK_CYCLE = 5000
const expressEToC = {
  neutral: "正常",
  happy: "开心",
  sad: "伤心",
  angry: "生气",
  surprised: "惊讶",
  disgusted: "厌恶",
  fearful: "恐惧",
  none: "无",
}
const expressInit={
  angry: 0,
  disgusted: 0,
  fearful: 0,
  happy: 0,
  neutral: 0,
  surprised: 0,
  sad: 0,
}
export {
  CHECK_CYCLE,
  expressInit,
  expressEToC,
  CameraType,
  LayoutType,
  LayoutClass,
  ScreenType,
  VideoType,
  environment,
  AvatarType,
  VideoSizeIcon,
  VideoFullscreenIcon,
  Storage
}
