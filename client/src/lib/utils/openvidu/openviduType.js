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
const  Storage={
  USER_NICKNAME : "openviduCallNickname",
  VIDEO_DEVICE : "openviduCallVideoDevice",
  AUDIO_DEVICE : "openviduCallAudioDevice"
}
export { CameraType, ScreenType, VideoType, environment, AvatarType,Storage }
