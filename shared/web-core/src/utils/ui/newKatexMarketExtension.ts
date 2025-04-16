import katex from 'katex';
import { marked } from 'marked';

export function newKatexExtension(): marked.MarkedExtension {
  return {
    extensions: [inlineKatex(), blockKatex()],
  };
}

function inlineKatex() {
  return {
    name: 'inlineKatex',
    level: 'inline',
    // Look for the first occurrence of either '$' or '\('.
    start(src: string) {
      const idxDollar = src.indexOf('$');
      const idxParens = src.indexOf('\\(');
      if (idxDollar === -1) return idxParens;
      if (idxParens === -1) return idxDollar;
      return Math.min(idxDollar, idxParens);
    },
    tokenizer(src: string, tokens: any) {
      // If the inline math starts with LaTeX style \( ... \)
      if (src.startsWith('\\(')) {
        // Match \(...\), allowing optional whitespace around the content.
        const regex = /^\\\(\s*([^\\)]+?)\s*\\\)/;
        const match = src.match(regex);
        if (match) {
          return {
            type: 'inlineKatex',
            raw: match[0],
            text: match[1].trim(),
          };
        }
      }
      // Otherwise, try matching math enclosed in single $ ... $
      else if (src.startsWith('$')) {
        const regex = /^\$([^$\n]+?)\$/;
        const match = src.match(regex);
        if (match) {
          return {
            type: 'inlineKatex',
            raw: match[0],
            text: match[1].trim(),
          };
        }
      }
    },
    renderer(token: any) {
      return katex.renderToString(token.text, {
        output: 'mathml',
        throwOnError: false,
      });
    },
  };
}

function blockKatex() {
  return {
    name: 'blockKatex',
    level: 'block',
    // Look for the first occurrence of '$$' or '\['.
    start(src: string) {
      const idxDollars = src.indexOf('$$');
      const idxBracket = src.indexOf('\\[');
      if (idxDollars === -1) return idxBracket;
      if (idxBracket === -1) return idxDollars;
      return Math.min(idxDollars, idxBracket);
    },
    tokenizer(src: string, tokens: any) {
      // If the block math starts with '$$'
      if (src.startsWith('$$')) {
        // This regex expects the opening $$ on its own line (or with optional whitespace),
        // then the math content, and finally the closing $$ on its own line.
        const regex = /^\$\$\s*\n([\s\S]+?)\n\s*\$\$$/;
        const match = src.match(regex);
        if (match) {
          return {
            type: 'blockKatex',
            raw: match[0],
            text: match[1].trim(),
          };
        }
      }
      // Else, if the block math starts with LaTeX style '\['
      else if (src.startsWith('\\[')) {
        // This regex handles math content between \[ and \], allowing optional whitespace and newlines.
        const regex = /^\\\[\s*\n?([\s\S]+?)\n?\s*\\\]/;
        const match = src.match(regex);
        if (match) {
          return {
            type: 'blockKatex',
            raw: match[0],
            text: match[1].trim(),
          };
        }
      }
    },
    renderer(token: any) {
      // Using a <div> ensures the rendered math is treated as a block-level element.
      return `<div>${katex.renderToString(token.text, {
        output: 'mathml',
        throwOnError: false,
      })}</div>`;
    },
  };
}
