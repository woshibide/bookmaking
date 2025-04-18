# ✨🫂✨ bookmaking aid ✨🫂✨ 

This is a collection of scripts that come in handy when bookmaking. They are not really user-friendly (sorry, not sorry), but they prove very useful in certain cases.

>CONTRIBUTORS ARE VERY MUCH WELCOME
 
## Overview

### `image_combo.pde`
A [Processing](https://processing.org) sketch that assists in photobook creation. It displays one image against another, making it easier to see which images work well together on a spread.

### `find_doppelgangers.py`
Identifies recurring images that are placed within an InDesign file, relies on report file.

### `include_pages.py`
Used for indexing. Adds page numbers to the information entries, relies on report file.

### `move_reported_images.py`
Moves images flagged in the InDesign file into a separate folder, relies on report file.

### `sign_calc.py`
Calculates which spreads will be wrapping signatures, useful when working with book spine or graphics.

### `spine_manager.py`
Applies graphics onto the spine of already imposed book, a tool to put image/text on the spine of exposed binding book.

### `transcriber3000`
Takes audio as input and outputs text. Works with audio of any length. Very likely to be incoherent. Relies on OpenAI API token

### `meaningfy`
Processes raw text and structures it into a grammatically correct LaTeX document, ready for typesetting. Relies on OpenAI API Token

### `scroll_color_picker.pde`
Great for exploring colors intuitively. Scroll over one of the three regions of the screen to change H || S || B vaues of the current background color.

### `ID_twoTabs.jsx`
InDesign script that inserts two tabs in the highlighted piece of text. First tab goes to the first line, right after the first character, the second tab goes to the beginning of the second line. The outcome somewhat resembles *illuminated initial* from medieval books. Used it for typesetting an interview 

### `compress.sh`
Bash script that makes use of image magick, that can be installed on Mac OS via `brew install imagemagick`. Will compress with decreasing quality all files inside the directory file is until desired file size is reached. Will also delete original images, so be careful



