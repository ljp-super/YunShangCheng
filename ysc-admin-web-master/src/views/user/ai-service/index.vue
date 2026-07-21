<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useKnowledgeStore } from '@/stores/knowledge'

interface ChatMessage {
  id: number
  content: string
  isUser: boolean
  timestamp: string
}

const knowledgeStore = useKnowledgeStore()

const messages = ref<ChatMessage[]>([
  {
    id: 1,
    content: '您好！我是AI客服，请问有什么可以帮助您的？',
    isUser: false,
    timestamp: '10:00'
  }
])

const inputMessage = ref('')
const messageIdCounter = ref(2)
const isTyping = ref(false)

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return

  const userMessage: ChatMessage = {
    id: messageIdCounter.value++,
    content: inputMessage.value,
    isUser: true,
    timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  messages.value.push(userMessage)
  inputMessage.value = ''
  isTyping.value = true

  try {
    const knowledgeResponse = knowledgeStore.searchKnowledge(userMessage.content)
    
    if (knowledgeResponse.includes('抱歉')) {
      const deepseekResponse = await callDeepSeek(userMessage.content)
      const aiResponse: ChatMessage = {
        id: messageIdCounter.value++,
        content: deepseekResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
      messages.value.push(aiResponse)
    } else {
      const aiResponse: ChatMessage = {
        id: messageIdCounter.value++,
        content: knowledgeResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
      messages.value.push(aiResponse)
    }
  } catch (error) {
    const aiResponse: ChatMessage = {
      id: messageIdCounter.value++,
      content: '抱歉，我暂时无法回答这个问题，请联系客服获取帮助。',
      isUser: false,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    messages.value.push(aiResponse)
  } finally {
    isTyping.value = false
  }
}

const callDeepSeek = async (question: string): Promise<string> => {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个电商商城的AI客服，帮助用户解答关于购物、订单、商品等方面的问题。请用友好、简洁的语言回答。'
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  })

  const data = await response.json()
  
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content
  }
  
  throw new Error('API response error')
}
</script>

<template>
  <div class="app-container">
    <div class="chat-container">
      <div class="chat-header">
        <h2>AI智能客服</h2>
        <span class="online-status">在线</span>
      </div>

      <div class="chat-messages">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="{ 'user-message': message.isUser, 'ai-message': !message.isUser }"
        >
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time">{{ message.timestamp }}</div>
        </div>
        <div v-if="isTyping" class="message-item ai-message">
          <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <el-input
          v-model="inputMessage"
          placeholder="请输入您的问题..."
          class="input-field"
          @keyup.enter="sendMessage"
        >
          <template #append>
            <el-button type="primary" @click="sendMessage">
              <Search />
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  padding: 20px;
  width: 100%;
  height: calc(100vh - 120px);
}

.chat-container {
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: #F5F7FA;
  border-bottom: 1px solid #EBEEF5;
}

.chat-header h2 {
  margin: 0;
  font-size: 16px;
}

.online-status {
  font-size: 12px;
  color: #67C23A;
  display: flex;
  align-items: center;
}

.online-status::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #67C23A;
  border-radius: 50%;
  margin-right: 5px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  max-width: 70%;
}

.user-message {
  align-items: flex-end;
  margin-left: auto;
}

.ai-message {
  align-items: flex-start;
}

.message-content {
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.user-message .message-content {
  background: #409EFF;
  color: white;
  border-bottom-right-radius: 2px;
}

.ai-message .message-content {
  background: #F5F7FA;
  color: #606266;
  border-bottom-left-radius: 2px;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.typing-indicator {
  display: flex;
  gap: 6px;
  padding: 10px 15px;
  background: #F5F7FA;
  border-radius: 8px;
  border-bottom-left-radius: 2px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: #909399;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.chat-input {
  padding: 15px 20px;
  border-top: 1px solid #EBEEF5;
  background: #F5F7FA;
}

.input-field {
  width: 100%;
}
</style>