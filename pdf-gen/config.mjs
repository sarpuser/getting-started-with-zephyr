/**
 * config.mjs
 *
 * All user-facing configuration for the PDF generator lives here.
 * To adapt this tool for a different lab manual, edit only this file
 * (and docusaurus.config.js / sidebars.js for the website).
 *
 * See README-ADAPTING.md for a step-by-step guide.
 */

export default {

  // -------------------------------------------------------------------------
  // Cover page text
  // -------------------------------------------------------------------------

  cover: {
    title:        'Getting Started with Zephyr RTOS',
    organization: 'Microchip Technology',
  },

  // Base name used in output filenames.
  // PDFs are written to: lab_manuals/pdf/<board>/<outputName>_<board>_<os>.pdf
  outputName: 'Zephyr-Getting-Started',

  // -------------------------------------------------------------------------
  // Versions
  //
  // One PDF is generated per board × os combination.
  // For a single PDF (no multiplexing), use one board and one os.
  //
  // boards:
  //   Each key becomes the board identifier used in folder names and filenames.
  //   "displayName" is printed on the cover page.
  //   "vars" (optional) defines %TOKEN% substitutions in the markdown source.
  //   Omit "vars" entirely if you don't use %TOKEN% substitution.
  //
  // os:
  //   Each entry produces a separate PDF per board.
  //   These values are matched against <TabItem value="..."> in MDX source.
  //   If you don't use OS tabs, use a single entry like ["default"].
  // -------------------------------------------------------------------------

  versions: {
    boards: {
      same54: {
        displayName: 'SAM E54 Xplained Pro',
        vars: {
          BOARD:            'same54_xpro',
          BOARD_NAME:       'SAM E54 Xplained Pro',
          FLASH_ARGS_LINUX: '',
          FLASH_ARGS_MACOS: '',
          FLASH_ARGS_WIN:   '',
        },
      },
      pic32bz6: {
        displayName: 'PIC32WM BZ6 Curiosity',
        vars: {
          BOARD:            'pic32wm_bz6204_curiosity',
          BOARD_NAME:       'PIC32WM BZ6 Curiosity',
          FLASH_ARGS_LINUX: '--openocd openOCD-wireless/prebuilt_binaries/linux/bin/openocd',
          FLASH_ARGS_MACOS: '--openocd openOCD-wireless/prebuilt_binaries/macos/bin/openocd',
          FLASH_ARGS_WIN:   '--openocd openOCD-wireless/prebuilt_binaries/windows/openocd_support_wbz_pic32wm/bin/openocd.exe',
        },
      },
    },

    os: ['linux', 'macos', 'windows'],
  },

  // -------------------------------------------------------------------------
  // Intro file
  //
  // Prepended to every PDF. Resolved from lab_manuals/markdown/ root.
  // -------------------------------------------------------------------------

  introFile: 'home.md',

  // -------------------------------------------------------------------------
  // Page sequence
  //
  // Ordered list of pages after the intro file.
  //
  // - Bare filename (no slash) → looked up in lab_manuals/markdown/<board>/
  //   If the file does not exist for a given board it is silently skipped,
  //   so one list works for all boards.
  //
  // - Path containing a slash → resolved from lab_manuals/markdown/ root.
  //   Use this for shared content like appendices that live outside the
  //   board folder.
  // -------------------------------------------------------------------------

  pages: [
    'index.md',
    'additional-software-setup.md',
    'lab1.md',
    'lab2.md',
    'lab3.md',
    'appendices/appendix-a.md',
    'appendices/appendix-b.md',
    'appendices/appendix-c.md',
    'appendices/appendix-d.md',
    'appendices/appendix-e.md',
  ],

};
