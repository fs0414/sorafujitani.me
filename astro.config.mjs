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
        name: 'custom-biome-theme',
        type: 'dark',
        colors: {
          'editor.background': '#161b22',
          'editor.foreground': '#e1e4e8',
        },
        tokenColors: [
          {
            scope: ['comment', 'punctuation.definition.comment'],
            settings: {
              foreground: '#6e7681',
              fontStyle: 'italic',
            },
          },
          {
            scope: ['source.shell', 'text.shell'],
            settings: {
              foreground: '#e1e4e8',
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
              foreground: '#00d8ff',
              fontStyle: 'bold',
            },
          },
          {
            scope: ['source.shell keyword', 'source.shell support.function'],
            settings: {
              foreground: '#e1e4e8',
              fontStyle: 'normal',
            },
          },
          {
            scope: ['entity.name.function', 'support.function'],
            settings: {
              foreground: '#58a6ff',
            },
          },
          {
            scope: ['string', 'string.quoted'],
            settings: {
              foreground: '#7ee787',
            },
          },
          {
            scope: ['constant.numeric', 'constant.language'],
            settings: {
              foreground: '#79c0ff',
            },
          },
          {
            scope: ['variable', 'variable.other'],
            settings: {
              foreground: '#e1e4e8',
            },
          },
          {
            scope: ['entity.name.type', 'entity.name.class', 'support.class'],
            settings: {
              foreground: '#00d8ff',
            },
          },
          {
            scope: ['punctuation', 'meta.brace'],
            settings: {
              foreground: '#c9d1d9',
            },
          },
          {
            scope: ['constant.other'],
            settings: {
              foreground: '#79c0ff',
            },
          },
        ],
      },
      wrap: true,
      transformers: [transformerFilename()],
    },
  },
});
