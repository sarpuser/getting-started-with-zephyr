/**
 * boardVars.mjs
 *
 * Replaces %PLACEHOLDER% tokens in text based on the target board.
 * Ported directly from gh_pages/plugins/remarkBoardVars.mjs.
 */

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

export function applyBoardVars(text, board) {
  const vars = boardMap[board];
  if (!vars) return text;
  return text.replace(/%(\w+)%/g, (_, key) => vars[key] ?? `%${key}%`);
}
