import { Fragment, type ReactNode } from 'react';
import { Navbar } from '../components/Navbar.tsx';
import { Footer } from '../components/Footer.tsx';
import { designTokens } from '../design-tokens.js';
import { legalConfig } from '../lib/legalConfig.ts';
import {
  PRIVACY_POLICY_CONTACT_INTRO,
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_MD,
} from '../content/privacyPolicy.ts';

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

/** Minimal renderer for the policy Markdown: ##, ###, "- " lists, paragraphs, **bold**. */
function renderPolicy(md: string): ReactNode[] {
  const blocks = md.trim().split(/\n{2,}/);
  return blocks.map((block, i) => {
    if (block.startsWith('### ')) {
      return (
        <h3
          key={i}
          className="text-lg font-bold mt-8 mb-3"
          style={{ fontFamily: headingFont, color: designTokens.colors.dark }}
        >
          {block.slice(4)}
        </h3>
      );
    }
    if (block.startsWith('## ')) {
      return (
        <h2
          key={i}
          className="text-2xl font-extrabold mt-12 mb-4"
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
        <ul key={i} className="list-disc pl-6 mb-4 flex flex-col gap-1.5">
          {block.split('\n').map((line, j) => (
            <li key={j}>{renderInline(line.replace(/^- /, ''))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="mb-4">
        {renderInline(block)}
      </p>
    );
  });
}

export function PrivacyPolicy() {
  const { entityName, contactEmail, address, websiteUrl } = legalConfig;
  const contactRows: Array<[string, ReactNode]> = [];
  if (entityName) contactRows.push(['Company or legal entity', entityName]);
  if (contactEmail) {
    contactRows.push([
      'Privacy contact email',
      <a key="email" href={`mailto:${contactEmail}`} style={{ textDecoration: 'underline' }}>
        {contactEmail}
      </a>,
    ]);
  }
  if (address) contactRows.push(['Business or registered address', address]);
  if (websiteUrl) {
    contactRows.push([
      'Website',
      <a key="site" href={websiteUrl} style={{ textDecoration: 'underline' }}>
        {websiteUrl}
      </a>,
    ]);
  }

  return (
    <div className="min-h-full flex flex-col" style={{ background: designTokens.colors.bgWhite }}>
      <Navbar minimal />
      <main className="flex-1 px-6 md:px-12 pt-28 pb-20">
        <article
          className="mx-auto text-base leading-relaxed"
          style={{ maxWidth: 760, color: designTokens.colors.textMuted }}
        >
          <h1
            className="text-4xl sm:text-5xl font-extrabold leading-tight"
            style={{
              fontFamily: headingFont,
              color: designTokens.colors.dark,
              letterSpacing: '-0.03em',
            }}
          >
            Yakku Privacy Policy
          </h1>
          <p className="mt-3 mb-2 text-sm">
            <strong style={{ color: designTokens.colors.dark }}>Last Updated:</strong>{' '}
            {PRIVACY_POLICY_LAST_UPDATED}
          </p>

          {renderPolicy(PRIVACY_POLICY_MD)}

          <h2
            className="text-2xl font-extrabold mt-12 mb-4"
            style={{
              fontFamily: headingFont,
              color: designTokens.colors.dark,
              letterSpacing: '-0.02em',
            }}
          >
            17. Contact Us
          </h2>
          <p className="mb-4">{PRIVACY_POLICY_CONTACT_INTRO}</p>
          {contactRows.map(([label, value]) => (
            <p key={label} className="mb-3">
              <strong style={{ color: designTokens.colors.dark }}>{label}:</strong> {value}
            </p>
          ))}
        </article>
      </main>
      <Footer minimal />
    </div>
  );
}

export default PrivacyPolicy;
