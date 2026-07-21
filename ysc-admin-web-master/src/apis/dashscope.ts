import axios from 'axios'

const DASHSCOPE_API_KEY = 'sk-b091470073f24b97a24a3c03580ba269'
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/api/v1'

const dashscopeClient = axios.create({
  baseURL: DASHSCOPE_BASE_URL,
  headers: {
    'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
    'Content-Type': 'application/json'
  }
})

export interface TextGenerationResponse {
  output: {
    text: string
  }
}

export interface EmbeddingResponse {
  output: {
    embeddings: Array<{
      embedding: number[]
    }>
  }
}

export const dashscopeApi = {
  async generateText(prompt: string, model: string = 'qwen-turbo'): Promise<string> {
    const response = await dashscopeClient.post<TextGenerationResponse>(
      '/services/aigc/text-generation/generation',
      {
        model: model,
        input: {
          prompt: prompt
        },
        parameters: {
          max_tokens: 4096,
          temperature: 0.7,
          top_p: 0.95
        }
      }
    )
    return response.data.output.text
  },

  async generateEmbedding(text: string, model: string = 'text-embedding-v4'): Promise<number[]> {
    const response = await dashscopeClient.post<EmbeddingResponse>(
      '/services/embeddings/text-embedding/text-embedding',
      {
        model: model,
        input: {
          texts: [text]
        }
      }
    )
    return response.data.output.embeddings[0].embedding
  },

  async analyzeDocument(fileContent: string): Promise<string> {
    const prompt = `请分析以下文档内容，提取关键信息并整理成结构化的知识库条目。

文档内容：
${fileContent}

要求：
1. 提取文档的主要标题和子标题
2. 总结每个部分的核心内容
3. 将内容整理成适合知识库存储的格式，包括标题、分类和详细内容
4. 如果文档中有多个主题，请分别处理
5. 保持内容的准确性和完整性

请直接输出整理后的知识库内容，不需要额外的解释。`

    return await this.generateText(prompt)
  },

  async summarizeDocument(fileContent: string): Promise<string> {
    const prompt = `请对以下文档内容进行摘要总结：

文档内容：
${fileContent}

要求：
1. 总结文档的核心主题和主要观点
2. 保持原文的关键信息不丢失
3. 输出简洁明了的摘要
4. 控制在300字以内

请直接输出摘要内容。`

    return await this.generateText(prompt)
  }
}

export default dashscopeApi
