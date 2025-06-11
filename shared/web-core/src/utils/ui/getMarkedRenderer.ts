import { katexExtension } from '@dodao/web-core/utils/ui/katexMarketExtension';
import { marked } from 'marked';
import prism from 'prismjs';

export function getMarkedRenderer(katexExt: marked.MarkedExtension = katexExtension()): marked.Renderer {
  const renderer = new marked.Renderer();
  renderer.code = function (code: any, lang: any, escaped: any) {
    code = renderer.options.highlight?.(code, lang!) as string;
    if (!lang) {
      return `<pre><code>${code}</code></pre>`;
    }

    const langClass = 'language-' + lang;
    return `<pre class="${langClass}"><code class="${langClass}">${code}</code></pre>`;
  };

  marked.setOptions({
    renderer,
    highlight: (code: string, lang: string) => {
      console.log(`prism.highlight with ${lang} `, code);
      if (prism.languages[lang]) {
        return prism.highlight(code, prism.languages[lang], lang);
      } else {
        return code;
      }
    },
  });

  marked.use(katexExt);
  renderer.link = function (href: string, title: string, text: string) {
    // If the link starts with #, it's an internal anchor link (table of contents)
    // so we don't open it in a new tab
    const target = href.startsWith('#') ? '' : ' target="_blank"';
    return '<a' + target + ' href="' + href + '" title="' + title + '">' + text + '</a>';
  };

  // ![Sample Image](path/to/image.jpg "300x200")
  renderer.image = function (href, title, text) {
    let size = '';
    if (title) {
      // Look for a size pattern like "300x200" in the title.
      const sizeMatch = title.match(/(\d+)\s*x\s*(\d+)/);
      if (sizeMatch) {
        size = ` width="${sizeMatch[1]}" height="${sizeMatch[2]}"`;
        // Optionally, remove the size text from the title attribute.
        title = title.replace(sizeMatch[0], '').trim();
      }
    }
    return `<img src="${href}" alt="${text}" title="${title}"${size}>`;
  };

  return renderer;
}
