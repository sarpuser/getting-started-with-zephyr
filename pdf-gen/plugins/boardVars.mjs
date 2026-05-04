/**
 * boardVars.mjs
 *
 * Remark plugin that replaces %PLACEHOLDER% tokens in text, inline code, and
 * fenced code block content based on the target board.
 *
 * Adapted from gh_pages/plugins/remarkBoardVars.mjs.
 */

import { visit } from 'unist-util-visit';

export const boardMap = {
  same54: {
    BOARD:            'same54_xpro',
    BOARD_NAME:       'SAM E54 Xplained Pro',
    FLASH_ARGS_LINUX: '',
    FLASH_ARGS_MACOS: '',
    FLASH_ARGS_WIN:   '',
  },
  pic32bz6: {
    BOARD:            'pic32wm_bz6204_curiosity',
    BOARD_NAME:       'PIC32WM BZ6 Curiosity',
    FLASH_ARGS_LINUX: '--openocd openOCD-wireless/prebuilt_binaries/linux/bin/openocd',
    FLASH_ARGS_MACOS: '--openocd openOCD-wireless/prebuilt_binaries/macos/bin/openocd',
    FLASH_ARGS_WIN:   '--openocd openOCD-wireless/prebuilt_binaries/windows/openocd_support_wbz_pic32wm/bin/openocd.exe',
  },
};

function replaceVars(str, vars) {
  return str.replace(/%(\w+)%/g, (_, key) => vars[key] ?? `%${key}%`);
}

export function remarkBoardVars({ board }) {
  const vars = boardMap[board];
  return (tree) => {
    if (!vars) return;
    visit(tree, (node) => {
      if (
        node.type === 'text' ||
        node.type === 'inlineCode' ||
        node.type === 'code'
      ) {
        node.value = replaceVars(node.value, vars);
      }
    });
  };
}
