/**
 * CopyButton/index.js  (swizzled – wrap)
 *
 * For shell-session code blocks (bash-session / ps-session) the copy button
 * strips prompt prefixes before writing to the clipboard so users get only
 * the command text.
 *
 * For every other language the original Docusaurus CopyButton is rendered
 * unchanged.
 *
 * Intentionally avoids importing from @docusaurus/theme-common/internal to
 * prevent React context mismatches across pnpm module boundaries.
 */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import OriginalCopyButton from '@theme-original/CodeBlock/Buttons/CopyButton';
import IconCopy from '@theme/Icon/Copy';
import IconSuccess from '@theme/Icon/Success';
import {useShellCopyCode} from '@site/src/shellCopyContext';
import styles from './styles.module.css';

async function writeToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
}

function ShellCopyButton({className, strippedCode}) {
  const [isCopied, setIsCopied] = useState(false);
  const timeout = useRef(undefined);

  const handleCopy = useCallback(() => {
    writeToClipboard(strippedCode).then(() => {
      setIsCopied(true);
      timeout.current = window.setTimeout(() => setIsCopied(false), 1000);
    });
  }, [strippedCode]);

  useEffect(() => () => window.clearTimeout(timeout.current), []);

  return (
    <button
      type="button"
      aria-label={isCopied ? 'Copied' : 'Copy code to clipboard'}
      title="Copy"
      className={clsx(
        'clean-btn',
        className,
        styles.copyButton,
        isCopied && styles.copyButtonCopied,
      )}
      onClick={handleCopy}>
      <span className={styles.copyButtonIcons} aria-hidden="true">
        <IconCopy className={styles.copyButtonIcon} />
        <IconSuccess className={styles.copyButtonSuccessIcon} />
      </span>
    </button>
  );
}

export default function CopyButton(props) {
  const strippedCode = useShellCopyCode();

  if (strippedCode !== null) {
    return <ShellCopyButton {...props} strippedCode={strippedCode} />;
  }

  return <OriginalCopyButton {...props} />;
}
