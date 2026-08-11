import Anthropic from '@anthropic-ai/sdk';
import { Database } from '../config/database.js';

let anthropicClient = null;

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_claude_api_key_here') {
    if (!anthropicClient) {
      anthropicClient = new Anthropic({ apiKey });
    }
    return anthropicClient;
  }
  return null;
}

export const ClaudeService = {
  getPromptTemplates() {
    return [
      {
        id: 'code-refactor',
        title: '⚡ ES Module & Async Refactoring',
        category: 'Code Quality',
        systemPrompt: 'You are an expert Full-Stack JavaScript Architect specializing in Node.js, ES Modules, and modern browser APIs. Provide clean, well-annotated code snippets.',
        userPrompt: 'Refactor an old CommonJS Express controller using callback patterns into clean ES Module syntax using async/await, proper try-catch error handling, and structured JSON responses.'
      },
      {
        id: 'sql-vs-nosql-advisor',
        title: '📊 SQL vs NoSQL Schema Advisor',
        category: 'Architecture',
        systemPrompt: 'You are a Senior Principal Database Engineer with deep expertise in PostgreSQL, SQLite, and MongoDB. Offer clear trade-offs, index recommendations, and schema design.',
        userPrompt: 'We are building a real-time collaborative document app with user comments and audit trails. Analyze whether PostgreSQL or MongoDB is better suited, and outline the recommended database schema and index strategy.'
      },
      {
        id: 'claude-streaming-integration',
        title: '🌊 Claude API Streaming Implementation',
        category: 'AI Integration',
        systemPrompt: 'You are an Anthropic Claude AI integration engineer. Focus on optimal prompt engineering, streaming SSE implementations, token efficiency, and robust backend handling.',
        userPrompt: 'Show a complete Node.js Express endpoint implementation that connects to Anthropic Claude 3.5 Sonnet SDK, streams tokens to the client via Server-Sent Events (SSE), and handles client disconnections cleanly.'
      },
      {
        id: 'data-transformation-pipeline',
        title: '🛠️ Data Transformation & ETL Prompt',
        category: 'Data Engineering',
        systemPrompt: 'You are a Senior Data Engineer. Focus on parsing CSV/JSON data into clean normalized SQL database schema records.',
        userPrompt: 'Given an array of raw user feedback records in JSON with unstructured comments, demonstrate how to clean text, extract sentiment tags, and structure the data for insertion into a relational SQL database.'
      },
      {
        id: 'security-audit',
        title: '🛡️ Node.js Security & Input Audit',
        category: 'Security',
        systemPrompt: 'You are a Senior Web Security Specialist specializing in Node.js, Express, OWASP Top 10, and sanitization standards.',
        userPrompt: 'Review an Express REST API endpoint handling user document uploads. Provide code fixes for SQL injection prevention, XSS sanitization, rate-limiting headers, and CORS validation.'
      },
      {
        id: 'vector-search',
        title: '🧠 pgvector Vector Embedding Search',
        category: 'AI Vector Search',
        systemPrompt: 'You are an AI Vector Database Architect specializing in PostgreSQL pgvector embeddings and similarity search.',
        userPrompt: 'Demonstrate how to store 1536-dimensional text vector embeddings generated from Claude AI into PostgreSQL using the pgvector extension, and write a SQL cosine distance query for RAG semantic search.'
      }
    ];
  },

  async streamCompletion({ prompt, systemPrompt, model = 'claude-3-5-sonnet-20241022', temperature = 0.7 }, res) {
    const client = getAnthropicClient();
    const isMock = !client;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(`data: ${JSON.stringify({ type: 'start', model, isMock })}\n\n`);

    let fullText = '';
    let tokenEstimate = 0;

    if (!isMock) {
      try {
        console.log(`🤖 Invoking Anthropic Claude API (${model})...`);
        const stream = await client.messages.create({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          temperature: parseFloat(temperature) || 0.7,
          system: systemPrompt || 'You are an expert Full-Stack JavaScript AI developer.',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        });

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta && chunk.delta.text) {
            const textChunk = chunk.delta.text;
            fullText += textChunk;
            tokenEstimate += Math.ceil(textChunk.length / 4);

            res.write(`data: ${JSON.stringify({ type: 'chunk', content: textChunk })}\n\n`);
          }
        }
      } catch (err) {
        console.error('❌ Anthropic SDK Error:', err.message);
        res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
      }
    } else {
      console.log('⚡ Using local simulated Claude AI streaming generator (No API key set)...');
      
      const mockResponses = [
        `### Claude 3.5 Sonnet Solution & Architecture\n\nHere is a complete, production-grade implementation engineered for your Node.js, Express, and SQL stack:\n\n\`\`\`javascript\n// server/controllers/aiController.js\nimport Anthropic from '@anthropic-ai/sdk';\n\nexport const streamClaudeCompletion = async (req, res) => {\n  const { prompt, model = 'claude-3-5-sonnet-20241022' } = req.body;\n  \n  // 1. Initialize Server-Sent Events headers\n  res.setHeader('Content-Type', 'text/event-stream');\n  res.setHeader('Cache-Control', 'no-cache');\n  res.setHeader('Connection', 'keep-alive');\n\n  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });\n\n  try {\n    const stream = await anthropic.messages.create({\n      model,\n      max_tokens: 1524,\n      system: 'You are a Senior Full-Stack JavaScript Architect.',\n      messages: [{ role: 'user', content: prompt }],\n      stream: true,\n    });\n\n    for await (const chunk of stream) {\n      if (chunk.type === 'content_block_delta' && chunk.delta?.text) {\n        res.write(\`data: \${JSON.stringify({ content: chunk.delta.text })}\\n\\n\`);\n      }\n    }\n    res.write('data: [DONE]\\n\\n');\n    res.end();\n  } catch (error) {\n    res.write(\`data: \${JSON.stringify({ error: error.message })}\\n\\n\`);\n    res.end();\n  }\n};\n\`\`\`\n\n### Key Technical Highlights\n- **Non-Blocking SSE Stream**: Tokens stream directly to the client without buffering HTTP responses.\n- **Database Audit Logging**: Prompt token metrics are recorded into PostgreSQL/SQLite asynchronously.\n- **Production Resilience**: Handles client disconnect events cleanly to prevent memory leaks.`
      ];

      const chosenMock = mockResponses[0];
      const words = chosenMock.split(' ');

      for (let i = 0; i < words.length; i++) {
        const wordChunk = words[i] + (i === words.length - 1 ? '' : ' ');
        fullText += wordChunk;
        tokenEstimate += Math.ceil(wordChunk.length / 4);

        res.write(`data: ${JSON.stringify({ type: 'chunk', content: wordChunk })}\n\n`);
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 25) + 15));
      }
    }

    Database.logAiInteraction(prompt, model, tokenEstimate);
    res.write(`data: ${JSON.stringify({ type: 'end', fullText, tokenEstimate, isMock })}\n\n`);
    res.end();
  }
};
