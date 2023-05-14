import katex from 'katex';

// Code is taken from https://github.com/UziTech/marked-katex-extension/blob/main/src/index.js
export function katexExtension() {
  return {
    extensions: [inlineKatex(), blockKatex()],
  };
}

function inlineKatex() {
  return {
    name: 'inlineKatex',
    level: 'inline',
    start(src) {
      return src.indexOf('$');
    },
    tokenizer(src, tokens) {
      const match = src.match(/^\$\$([^$\n]+?)\$\$/);
      if (match) {
        return {
          type: 'inlineKatex',
          raw: match[0],
          text: match[1].trim(),
        };
      }
    },
    renderer(token) {
      return katex.renderToString(token.text, {
        throwOnError: false,
      });
    },
  };
}

function blockKatex() {
  return {
    name: 'blockKatex',
    level: 'block',
    start(src) {
      return src.indexOf('\n$$');
    },
    tokenizer(src, tokens) {
      const match = src.match(/^\$\$+\n([^$]+?)\n\$\$+\n/);
      if (match) {
        return {
          type: 'blockKatex',
          raw: match[0],
          text: match[1].trim(),
        };
      }
    },
    renderer(token) {
      return `<p>${katex.renderToString(token.text, {
        throwOnError: false,
      })}</p>`;
    },
  };
}
