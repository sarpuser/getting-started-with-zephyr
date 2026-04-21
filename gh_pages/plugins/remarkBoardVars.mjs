/**
 * remarkBoardVars.mjs
 *
 * Replaces {{PLACEHOLDER}} tokens in doc content (prose, inline code, and
 * fenced code blocks) based on which board directory the file lives in.
 *
 * Add new boards or variables to boardMap as needed.
 */

const boardMap = {
  same54: {
    BOARD:      'same54_xpro',
    BOARD_NAME: 'SAM E54 Xplained Pro',
  },
  pic32bz6: {
    BOARD:      'pic32wm_bz6204_curiosity',
    BOARD_NAME: 'PIC32WM BZ6 Curiosity',
  },
};

function replaceVars(str, vars) {
  return str.replace(/%(\w+)%/g, (_, key) => vars[key] ?? `%${key}%`);
}

function walkTree(node, vars) {
  if (node.type === 'text' || node.type === 'inlineCode' || node.type === 'code') {
    node.value = replaceVars(node.value, vars);
  }
  if (node.children) {
    for (const child of node.children) {
      walkTree(child, vars);
    }
  }
}

export default function remarkBoardVars() {
  return (tree, file) => {
    const filePath = file.history?.[0] ?? '';
    const board = Object.keys(boardMap).find(k => filePath.includes(`/${k}/`));
    if (!board) return;
    walkTree(tree, boardMap[board]);
  };
}
