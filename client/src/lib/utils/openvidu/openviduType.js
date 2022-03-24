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
  BIG: "el-icon-zoom-in",
  NORMAL: "el-icon-zoom-out"
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
export {
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
