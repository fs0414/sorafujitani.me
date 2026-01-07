// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';

/** @returns {import('unified').Plugin} */
function remarkCodeFilename() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (node.lang && node.lang.includes(':')) {
        const parts = node.lang.split(':');
        node.lang = parts[0];
        node.meta = (node.meta || '') + ` filename="${parts.slice(1).join(':')}"`;
      }
    });
  };
}

/** @type {import('shiki').ShikiTransformer} */
const transformerFilename = () => ({
  name: 'transformer-filename',
  preprocess(code, options) {
    const meta = options.meta?.__raw || '';
    const match = meta.match(/filename="([^"]+)"/);
    if (match) {
      this.filename = match[1];
    }
    return code;
  },
  pre(node) {
    if (this.filename) {
      node.properties['data-filename'] = this.filename;
    }
  },
});

// https://astro.build/config
export default defineConfig({
  site: 'https://sorafujitani.me',
  integrations: [mdx({
    remarkPlugins: [remarkGfm, remarkCodeFilename],
  })],
  markdown: {
    remarkPlugins: [remarkGfm, remarkCodeFilename],
    shikiConfig: {
      theme: {
        name: 'custom-cyan-theme',
        type: 'dark',
        colors: {
          'editor.background': '#2d2d2d',
          'editor.foreground': '#e8e6e3',
        },
        tokenColors: [
          {
            scope: ['comment', 'punctuation.definition.comment'],
            settings: {
              foreground: '#6b7280',
              fontStyle: 'italic',
            },
          },
          {
            scope: ['source.shell', 'text.shell'],
            settings: {
              foreground: '#e8e6e3',
            },
          },
          {
            scope: [
              'keyword',
              'storage.type',
              'storage.modifier',
              'keyword.control',
              'keyword.operator.new',
            ],
            settings: {
              foreground: '#22d3ee',
              fontStyle: 'bold',
            },
          },
          {
            scope: ['source.shell keyword', 'source.shell support.function'],
            settings: {
              foreground: '#e8e6e3',
              fontStyle: 'normal',
            },
          },
          {
            scope: ['entity.name.function', 'support.function'],
            settings: {
              foreground: '#60a5fa',
            },
          },
          {
            scope: ['string', 'string.quoted'],
            settings: {
              foreground: '#67e8f9',
            },
          },
          {
            scope: ['constant.numeric', 'constant.language'],
            settings: {
              foreground: '#93c5fd',
            },
          },
          {
            scope: ['variable', 'variable.other'],
            settings: {
              foreground: '#e8e6e3',
            },
          },
          {
            scope: ['entity.name.type', 'entity.name.class', 'support.class'],
            settings: {
              foreground: '#38bdf8',
            },
          },
          {
            scope: ['punctuation', 'meta.brace'],
            settings: {
              foreground: '#d1d5db',
            },
          },
          {
            scope: ['constant.other'],
            settings: {
              foreground: '#bfdbfe',
            },
          },
        ],
      },
      wrap: true,
      transformers: [transformerFilename()],
    },
  },
});
