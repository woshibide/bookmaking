"""
this script puts images onto the pdf
expects on input imposed for printing pdf and sliced images
outputs same pdf, but with images being put on the book spine

TODO: image splicer
TODO: instead of hardcoding 8 value of signature size to be provided

"""

import fitz 
import logging
from pathlib import Path
import glob

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    handlers=[
        logging.FileHandler('spine_debug.log'),
        logging.StreamHandler()
    ]
)

def add_spines_to_pdf(input_pdf: str, output_pdf: str) -> None:
    """
    add spine images to pdf pages with test lines at absolute positions
    """
    if not Path(input_pdf).exists():
        raise FileNotFoundError(f"cant find input pdf: {input_pdf}")
    
    spine_images = sorted(glob.glob("spine-text-*.png"))
    if not spine_images:
        raise FileNotFoundError("no spine images found in current directory")
    
    logging.info(f"found {len(spine_images)} spine images")
    
    doc = fitz.open(input_pdf)
    img_idx = 0
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        
        # TODO: specify from which page to start inserting images
        if page_num % 8 == 0 and img_idx < len(spine_images):
            try:
                img_path = spine_images[img_idx]
                page_rect = page.rect
                
                logging.debug(f"page dimensions - width: {page_rect.width}, height: {page_rect.height}")
                logging.debug(f"page rect: x0={page_rect.x0}, y0={page_rect.y0}, x1={page_rect.x1}, y1={page_rect.y1}")
                
                # get image dimensions
                img = fitz.Pixmap(img_path)
                image_width = img.width
                image_height = img.height
                logging.debug(f"image dimensions - width: {image_width}, height: {image_height}")
                
                # works for the case of given input (vertical image slices)
                rx0 = 0                                                     # top
                ry0 = round((page_rect.width / 2) - (image_width / 2), 2)   # left edge
                rx1 = round(page_rect.height, 2)                            # bottom of page
                ry1 = round((page_rect.width / 2) + (image_width / 2), 2)   # right edge
                
                logging.debug(f"calculated positions:")
                logging.debug(f"  rx0: {rx0}, ry0: {ry0}")
                logging.debug(f"  rx1: {rx1}, ry1: {ry1}")
                
                # create rectangle with exact placement
                spine_rect = fitz.Rect(
                    rx0,
                    ry0,
                    rx1,
                    ry1 
                )
                
                # debugging circles
                # page.draw_circle((rx0, ry0), 10, color=(1, 0, 0), width=1)  #  red 
                # page.draw_circle((rx1, ry0), 10, color=(0, 1, 0), width=1)  #  green
                # page.draw_circle((rx0, ry1), 10, color=(0, 0, 1), width=1)  #  blue
                # page.draw_circle((rx1, ry1), 10, color=(1, 1, 0), width=1)  #  yellow

                logging.debug(f"final spine_rect: x0={spine_rect.x0}, y0={spine_rect.y0}, x1={spine_rect.x1}, y1={spine_rect.y1}")
                
                # this rotation was a fix for what was provided input wise
                page.insert_image(spine_rect, filename=img_path, rotate=90)
                # page.draw_rect(spine_rect, color=(0, 1, 0), width=1)
                
                logging.info(f"added spine {img_idx + 1} with centered rectangles to page {page_num + 1}")
                img_idx += 1
                
            except Exception as e:
                logging.error(f"failed to add spine to page {page_num + 1}: {str(e)}")
    
    doc.save(output_pdf)
    logging.info(f"saved output to {output_pdf}")
    print(f"✨ all done! check {output_pdf}")

if __name__ == "__main__":
    input_pdf = "input.pdf"
    output_pdf = "output.pdf"
    
    try:
        add_spines_to_pdf(input_pdf, output_pdf)
    except Exception as e:
        logging.error(f"something went wrong: {str(e)}")
        raise