import { katexExtension } from '@/utils/ui/katexMarketExtension';
import { marked } from 'marked';
import prism from 'prismjs';

export function getMarkedRenderer(): marked.Renderer {
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

  marked.use(katexExtension());
  renderer.link = function (href: string, title: string, text: string) {
    return '<a target="_blank" href="' + href + '" title="' + title + '">' + text + '</a>';
  };
  return renderer;
}
