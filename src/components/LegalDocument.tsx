import { Fragment, type ReactNode } from 'react';
import { Navbar } from './Navbar.tsx';
import { Footer } from './Footer.tsx';
import { designTokens } from '../design-tokens.js';

const headingFont = designTokens.typography.fontFamilies.heading;

/** Renders **bold** spans inside a line of text. */
function renderInline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} style={{ color: designTokens.colors.dark }}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Minimal renderer for the legal Markdown: ##, ###, "- " lists, paragraphs, **bold**. */
function renderMarkdown(md: string): ReactNode[] {
  const blocks = md.trim().split(/\n{2,}/);
  return blocks.map((block, i) => {
    if (block.startsWith('### ')) {
      return (
        <h3 key={i} style={{ fontFamily: headingFont, color: designTokens.colors.dark }}>
          {block.slice(4)}
        </h3>
      );
    }
    if (block.startsWith('## ')) {
      return (
        <h2
          key={i}
          style={{
            fontFamily: headingFont,
            color: designTokens.colors.dark,
            letterSpacing: '-0.02em',
          }}
        >
          {block.slice(3)}
        </h2>
      );
    }
    if (block.startsWith('- ')) {
      return (
        <ul key={i}>
          {block.split('\n').map((line, j) => (
            <li key={j}>{renderInline(line.replace(/^- /, ''))}</li>
          ))}
        </ul>
      );
    }
    return <p key={i}>{renderInline(block)}</p>;
  });
}

interface LegalDocumentProps {
  title: string;
  effective: string;
  lastUpdated: string;
  markdown: string;
}

/** A legal page (Privacy Policy, Terms of Service): title, effective and last-updated dates, and the document body. */
export function LegalDocument({ title, effective, lastUpdated, markdown }: LegalDocumentProps) {
  return (
    <div className="min-h-full flex flex-col" style={{ background: designTokens.colors.bgWhite }}>
      <Navbar minimal />
      <main className="legal-main">
        <article className="legal-article" style={{ color: designTokens.colors.textMuted }}>
          <h1
            style={{
              fontFamily: headingFont,
              color: designTokens.colors.dark,
              letterSpacing: '-0.03em',
            }}
          >
            {title}
          </h1>
          <p className="legal-meta">
            <strong style={{ color: designTokens.colors.dark }}>Effective date:</strong> {effective}
            <br />
            <strong style={{ color: designTokens.colors.dark }}>Last updated:</strong> {lastUpdated}
          </p>

          {renderMarkdown(markdown)}
        </article>
      </main>
      <Footer minimal />
    </div>
  );
}
