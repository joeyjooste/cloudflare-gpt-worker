import { Ai } from '@cloudflare/ai'
import { Hono } from 'hono'

import blocking from './blocking.html'
import streaming from './streaming.html'
  
const app = new Hono()

app.get('/', c => {
  return c.html(streaming) 
})

app.get('/b', c => {
  return c.html(blocking)
})

app.get("/stream", async c => {

  const ai = new Ai(c.env.AI)

  const query = c.req.query("query")
  const question = query || 'What is the square route of 163216'


  const messages = [
    { role: "system", content: "You are an intelligent assistant"},
    { role: "assistant", content: "You should always respond in less than 100 words"},
    { role: "user", content: question }
  ]

  const aiResponse = await ai.run(
    '@cf/meta/llama-3-8b-instruct',
    { messages, stream: true }
  )

  return new Response(aiResponse, {
    headers: {
      'Content-Type': 'text/event-stream'
    }
  })
})

app.post('/', async c => {
  const ai = new Ai(c.env.AI)

  const body = await c.req.json()
  const question = body.query || 'What is the square route of 163216'

  
  const messages = [
    { role: "system", content: "You are an intelligent assistant"},
    { role: "assistant", content: "You should always respond in less than 100 words"},
    { role: "user", content: question }
  ]
  
  const aiResponse = await ai.run(
    '@cf/meta/llama-3-8b-instruct',
    { messages }
  )
  
  return c.text(aiResponse.response)
})

export default app
