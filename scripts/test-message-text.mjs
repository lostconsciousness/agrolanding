import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = readFileSync('components/chat/message-text.tsx', 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const loaded = { exports: {} };
vm.runInNewContext(compiled, {
  module: loaded,
  exports: loaded.exports,
  require,
  URL,
});
const { MessageText } = loaded.exports;

const title = 'TESEO - USA: sales prices of Agricultural Products';
const content = `1. **Поточні ціни:**\n\n   Дані за вересень. ${title}\n\n2. **Урожайність:**\n\n   Перевірте джерело.`;
const start = content.indexOf(title);
const html = renderToStaticMarkup(
  MessageText({
    message: {
      id: 1,
      role: 'assistant',
      content,
      citations: [
        {
          start,
          end: start + title.length,
          url: 'https://example.com/report',
          title,
        },
      ],
      createdAt: 0,
    },
  }),
);
assert.match(html, /<ol/);
assert.match(html, /<strong>Поточні ціни:<\/strong>/);
assert.match(html, /<strong>Урожайність:<\/strong>/);
assert.match(html, /class="chat-citation"/);
assert.match(html, />\[1\]<\/a>/);
assert.doesNotMatch(html, /\*\*Поточні ціни/);
assert.doesNotMatch(html, />TESEO - USA/);

const user = renderToStaticMarkup(
  MessageText({
    message: {
      id: 2,
      role: 'user',
      content: '**Дослівно**',
      citations: [],
      createdAt: 0,
    },
  }),
);
assert.match(user, /\*\*Дослівно\*\*/);
assert.doesNotMatch(user, /<strong>/);

console.log('PASS: chat Markdown, compact citations and plain user text');
