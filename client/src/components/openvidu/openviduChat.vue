<template>
 <!-- <el-collapse-transition>
        <div v-show="show3">
          <div class="transition-box">el-collapse-transition</div>
          <div class="transition-box">el-collapse-transition</div>
        </div>
      </el-collapse-transition> -->

  <div id="chatContainer">
    <div id="chatComponent">
      <div id="chatToolbar">
        <span>聊天</span>
        <el-button  circle  @click="close()" icon="el-icon-close" id="closeButton"> 
        </el-button>
      </div>
      <!-- #chatScroll -->
      <div ref="chatScroll" class="message-wrap">
        <div
          v-for="(data, index) in messageList"
          :key="index"
          class="message"
          :class="{ right: data.isLocal, left: !data.isLocal }"
        >
          <img class="user-img" :src="data.userAvatar" />
          <div class="msg-detail">
            <div class="msg-info">
              <p>{{ data.nickname }}</p>
            </div>
            <div class="msg-content">
              <span class="triangle"></span>
              <p class="text" >{{data.message}}</p>
            </div>
          </div>
        </div>
      </div>

      <div id="messageInput">
        <!--  #chatInput (keypress)="eventKeyPress($event)" -->
        <el-input
          placeholder="输入消息"
          autocomplete="off"
          @keyup.enter.native="sendMessage"
          v-model="message"
          id="chatInput"
        />
        <el-button  type="success" id="sendButton" icon="el-icon-message" circle @click="sendMessage()">
          <!-- <mat-icon matTooltip="Send">send</mat-icon> -->
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

import { chatService } from "@/lib/utils/openvidu/openviduWechat"
export default {
  created() {
    this.subscribeToMessages()
    this.subscribeToToggleChat()
  },
  data() {
    return {
      // 聊天服务
      chatService,
      message: "",
    }
  },
  computed: {
    ...mapGetters(["messageList", "toggleChat"]),
  },
  methods: {
    subscribeToToggleChat() {
      if (this.toggleChat) {
        this.scrollToBottom()
        // 聚焦输入框
        // setTimeout(() => {
        //   this.chatInput.nativeElement.focus()
        // })
      }
    },
    subscribeToMessages() {
      // 滑倒底部
      this.scrollToBottom()
    },
    // // 划到底部
    scrollToBottom() {
      setTimeout(() => {
        try {
          this.$refs.chatScroll.scrollTop =
            this.$refs.chatScroll.scrollHeight
        } catch (err) {
          console.log(err,"滑动失败")
        }
      }, 20)
    },
    toggle() {
      console.log("点击开关")
    },
    close() {
      console.log("close")
      this.chatService.toggleChat()
    },
    sendMessage() {
      console.log("send message",this.message)
      this.chatService.sendMessage(this.message)
      this.message = ""
    },
  },
}
</script>

<style src="@/styles/openvidu/openviduCat.css" scoped   >
</style>
<style scoped>
  .el-input >>> input{
    border-radius: 1px 1px 13px 13px;
  }
</style>