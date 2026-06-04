# BZ6 Bugfix

There is a bug in the OpenOCD config for the BZ6 that prevents OpenOCD from halting the CPU so it can attach to it. While the fix for this has not been officially released yet, a temporary fix is available in this folder.

## Applying the Patch

1. Download the file `bugfix.patch` and put it at the root of your `zephyrproject` folder.
2. Run
   ```
   git -C zephyr apply ../bugfix.patch
   ```
3. Run
   ```
   git -C zephyr status
   ```
   You should see an output like the following:
   ```
   ❱ git -C zephyr status
   On branch mchp_pic32cxbz_v420
   Your branch is up to date with 'origin/mchp_pic32cxbz_v420'.

   Changes not staged for commit:
     (use "git add <file>..." to update what will be committed)
     (use "git restore <file>..." to discard changes in working directory)
   	modified:   boards/microchip/pic32wm/pic32wm_bz6204_curiosity/board.cmake
   	modified:   boards/microchip/pic32wm/pic32wm_bz6204_curiosity/support/openocd.cfg
   ```

## Information

The patch file is based on the `mchp_pic32cxbz_v420` branch. This folder also contains the final files after the temporary fix has been applied. The files are in `boards/microchip/pic32wm/pic32wm_bz6204_curiosity/board.cmake` and `boards/microchip/pic32wm/pic32wm_bz6204_curiosity/support/openocd.cfg`.