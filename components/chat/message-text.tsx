import type { ReactNode } from 'react';
import type { ChatMessage, Citation } from '@/lib/chat-types';

export function sourceHost(url: string) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol)
      ? parsed.hostname
      : null;
  } catch {
    return null;
  }
}

function withCitationMarkers(message: ChatMessage) {
  let content = '';
  let cursor = 0;
  const citations: Citation[] = [];

  for (const citation of [...message.citations].sort(
    (a, b) => a.start - b.start,
  )) {
    if (
      !sourceHost(citation.url) ||
      citation.start < cursor ||
      citation.end < citation.start ||
      citation.end > message.content.length
    )
      continue;

    content += message.content.slice(cursor, citation.start);
    citations.push(citation);
    content += `\uE000${citations.length}\uE001`;
    cursor = citation.end;
  }

  content += message.content.slice(cursor);
  return { content, citations };
}

function inline(text: string, citations: Citation[]): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokens =
    /\uE000(\d+)\uE001|\*\*([^*\n]+)\*\*|`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|(?<!\*)\*([^*\n]+)\*(?!\*)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokens.exec(text))) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const key = match.index;

    if (match[1]) {
      const number = Number(match[1]);
      const citation = citations[number - 1];
      nodes.push(
        citation ? (
          <a
            className="chat-citation"
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            title={citation.title}
            aria-label={`Джерело ${number}: ${citation.title}`}
            key={key}
          >
            [{number}]
          </a>
        ) : null,
      );
    } else if (match[2]) {
      nodes.push(<strong key={key}>{inline(match[2], citations)}</strong>);
    } else if (match[3]) {
      nodes.push(<code key={key}>{match[3]}</code>);
    } else if (match[4] && match[5] && sourceHost(match[5])) {
      nodes.push(
        <a
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          key={key}
        >
          {match[4]}
        </a>,
      );
    } else if (match[6]) {
      nodes.push(<em key={key}>{inline(match[6], citations)}</em>);
    } else {
      nodes.push(match[0]);
    }
    cursor = tokens.lastIndex;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

const listLine = /^(\s{0,3})(?:(\d+)\.|([-*]))\s+(.+)$/;

function blocks(lines: string[], citations: Citation[]): ReactNode[] {
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index++;
      continue;
    }

    if (/^\s*```/.test(line)) {
      const language = line.trim().slice(3).trim();
      const code: string[] = [];
      index++;
      while (index < lines.length && !/^\s*```/.test(lines[index]))
        code.push(lines[index++]);
      if (index < lines.length) index++;
      nodes.push(
        <pre key={nodes.length}>
          <code data-language={language || undefined}>{code.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    const heading = line.match(/^\s{0,3}(#{1,4})\s+(.+)$/);
    if (heading) {
      const title = inline(heading[2], citations);
      nodes.push(
        heading[1].length <= 2 ? (
          <h3 key={nodes.length}>{title}</h3>
        ) : (
          <h4 key={nodes.length}>{title}</h4>
        ),
      );
      index++;
      continue;
    }

    const firstItem = line.match(listLine);
    if (firstItem) {
      const ordered = Boolean(firstItem[2]);
      const start = ordered ? Number(firstItem[2]) : undefined;
      const items: ReactNode[] = [];

      while (index < lines.length) {
        while (index < lines.length && !lines[index].trim()) index++;
        const item = lines[index]?.match(listLine);
        if (!item || Boolean(item[2]) !== ordered) break;
        index++;
        const itemLines = [item[4]];

        while (index < lines.length) {
          if (lines[index].trim()) {
            if (lines[index].match(listLine)) break;
            if (!/^\s{2,}/.test(lines[index])) break;
            itemLines.push(lines[index].replace(/^\s{2,4}/, ''));
            index++;
            continue;
          }
          const next = lines.slice(index + 1).find((entry) => entry.trim());
          if (next && /^\s{2,}/.test(next) && !next.match(listLine)) {
            itemLines.push('');
            index++;
            continue;
          }
          break;
        }

        items.push(<li key={items.length}>{blocks(itemLines, citations)}</li>);
      }

      nodes.push(
        ordered ? (
          <ol start={start} key={nodes.length}>
            {items}
          </ol>
        ) : (
          <ul key={nodes.length}>{items}</ul>
        ),
      );
      continue;
    }

    if (/^\s{0,3}>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^\s{0,3}>\s?/.test(lines[index]))
        quote.push(lines[index++].replace(/^\s{0,3}>\s?/, ''));
      nodes.push(
        <blockquote key={nodes.length}>{blocks(quote, citations)}</blockquote>,
      );
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^\s*```/.test(lines[index]) &&
      !/^\s{0,3}#{1,4}\s+/.test(lines[index]) &&
      !lines[index].match(listLine) &&
      !/^\s{0,3}>\s?/.test(lines[index])
    )
      paragraph.push(lines[index++].trim());
    nodes.push(
      <p key={nodes.length}>{inline(paragraph.join(' '), citations)}</p>,
    );
  }

  return nodes;
}

export function MessageText({ message }: { message: ChatMessage }) {
  if (message.role === 'user')
    return <div className="chat-message-text chat-message-plain">{message.content}</div>;

  const { content, citations } = withCitationMarkers(message);
  return (
    <div className="chat-message-text">
      {blocks(content.replace(/\r\n?/g, '\n').split('\n'), citations)}
    </div>
  );
}
