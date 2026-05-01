import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { chatgptAdapter } from './chatgpt.js';
import { claudeAdapter } from './claude.js';
import { isGeminiConversation } from './gemini.js';
import { createOnyxAdapter } from './onyx.js';

function docFrom(html: string): Document {
  return new JSDOM(html).window.document;
}

describe('chatgptAdapter.findTurnRoots', () => {
  it('anchors on user-role nodes', () => {
    const html = `
      <main>
        <article><div data-message-author-role="assistant">Bot</div></article>
        <article><div data-message-author-role="user">Hi</div></article>
      </main>`;
    const roots = chatgptAdapter.findTurnRoots(docFrom(html));
    expect(roots).toHaveLength(1);
    expect(roots[0].closest('article')?.innerHTML).toContain('user');
  });

  it('prefers data-turn="user" anchors (modern ChatGPT UI)', () => {
    const html = `
      <main>
        <div data-turn-id="a" data-turn="assistant"><p>A1</p></div>
        <div data-turn-id="b" data-turn="user"><p>Question one</p></div>
        <div data-turn-id="c" data-turn="assistant"><p>A2</p></div>
        <div data-turn-id="d" data-turn="user"><p>Question two</p></div>
      </main>`;
    const roots = chatgptAdapter.findTurnRoots(docFrom(html));
    expect(roots).toHaveLength(2);
    expect(roots[0].textContent).toContain('Question one');
    expect(roots[1].textContent).toContain('Question two');
  });
});

describe('geminiAdapter.matchesLocation', () => {
  it('matches gemini app routes', () => {
    expect(isGeminiConversation(new URL('https://gemini.google.com/app/foo'))).toBe(true);
    expect(isGeminiConversation(new URL('https://gemini.google.com/about'))).toBe(false);
  });
});

describe('claudeAdapter.findTurnRoots', () => {
  it('uses data-role user when present', () => {
    const html = `
      <main><div data-role="user"><p>Turn A</p></div>
      <div data-role="assistant">Out</div>
      </main>`;
    const roots = claudeAdapter.findTurnRoots(docFrom(html));
    expect(roots.length).toBeGreaterThanOrEqual(1);
    expect(roots[0]?.textContent).toContain('Turn A');
  });
});

describe('onyx adapter', () => {
  it('targets .chat-message.user', () => {
    const a = createOnyxAdapter(new Set(['self.local']));
    expect(a.matchesLocation(new URL('https://self.local/search'))).toBe(true);

    const html = `<main><div class="chat-message user">Q1</div><div class="chat-message assistant">A1</div></main>`;
    const roots = a.findTurnRoots(docFrom(html));
    expect(roots).toHaveLength(1);
  });
});
