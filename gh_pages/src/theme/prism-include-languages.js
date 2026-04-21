/**
 * prism-include-languages.js  (swizzled)
 *
 * Loads all additionalLanguages from docusaurus.config, then registers a
 * custom "bash-session" grammar that marks shell prompt prefixes so they
 * can be styled separately from the command text.
 */
import siteConfig from '@generated/docusaurus.config';

export default function prismIncludeLanguages(PrismObject) {
  const {
    themeConfig: {prism},
  } = siteConfig;
  const {additionalLanguages} = prism;

  // Standard Docusaurus pattern: temporarily expose PrismObject as global so
  // the prismjs component files can extend it.
  const PrismBefore = globalThis.Prism;
  globalThis.Prism = PrismObject;

  additionalLanguages.forEach((lang) => {
    if (lang === 'php') {
      // eslint-disable-next-line global-require
      require('prismjs/components/prism-markup-templating.js');
    }
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(`prismjs/components/prism-${lang}`);
  });

  delete globalThis.Prism;
  if (typeof PrismBefore !== 'undefined') {
    globalThis.Prism = PrismObject;
  }

  // ── Custom shell-session grammars ────────────────────────────────────────
  // Each grammar marks only the prompt prefix with the "shell-prompt" alias
  // so CSS can colour it differently.  Command text and output lines are left
  // as plain, unstyled text.  Keep the patterns in sync with shellCopyContext.js.

  // bash-session: bash / Zephyr UART shell
  //   (.venv) $ west build …     ← bash with active venv
  //   $ west flash               ← plain bash prompt
  //   uart:~$ device list        ← Zephyr UART shell
  //   # some-root-command        ← root shell
  PrismObject.languages['bash-session'] = {
    prompt: {
      pattern: /^(?:\([^)]+\)\s+)?[^\s$#%!"'<>|\\]*[$#%]\s+/m,
      alias: 'shell-prompt',
    },
  };

  // ps-session: Windows PowerShell with optional (.venv) prefix
  //   (.venv) PS C:\...\zephyrproject> west build …
  //   PS C:\Users\you> Get-Command openocd
  PrismObject.languages['ps-session'] = {
    prompt: {
      pattern: /^(?:\([^)]+\)\s+)?PS\s+[^\r\n>]*>\s+/im,
      alias: 'shell-prompt',
    },
  };
}
