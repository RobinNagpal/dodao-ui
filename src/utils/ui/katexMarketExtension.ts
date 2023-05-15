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
    start(src: string) {
      return src.indexOf('$');
    },
    tokenizer(src: string, tokens: any[]) {
      const match = src.match(/^\$\$([^$\n]+?)\$\$/);
      if (match) {
        return {
          type: 'inlineKatex',
          raw: match[0],
          text: match[1].trim(),
        };
      }
    },
    renderer(token: any) {
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
    start(src: string) {
      return src.indexOf('\n$$');
    },
    tokenizer(src: string, tokens: any[]) {
      const match = src.match(/^\$\$+\n([^$]+?)\n\$\$+\n/);
      if (match) {
        return {
          type: 'blockKatex',
          raw: match[0],
          text: match[1].trim(),
        };
      }
    },
    renderer(token: any) {
      return `<p>${katex.renderToString(token.text, {
        throwOnError: false,
      })}</p>`;
    },
  };
}
