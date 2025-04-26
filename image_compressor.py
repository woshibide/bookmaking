import os
import tempfile
import argparse
from PIL import Image

# config
MAX_SIZE = 200000       # maximum file size in bytes
INITIAL_QUALITY = 99    # starting quality for compression
MIN_QUALITY = 1         # minimum quality to try
OUTPUT_PREFIX = ""      # prefix for output files, empty for overwriting
MAX_DIMENSION = 1400    # maximum width or height in pixels
RECURSIVE = True        # whether to process subdirectories
CONVERT_TO_WEBP = True  # whether to convert images to webp format
WEBP_LOSSLESS = False   # whether to use lossless compression for webp (for png with alpha)
DELETE_ORIGINALS = True # whether to delete original files after successful compression

# list to track unsuccessful compressions
FAILED_COMPRESSIONS = []

# to track space savings
TOTAL_BYTES_BEFORE = 0
TOTAL_BYTES_AFTER = 0
TOTAL_FILES_PROCESSED = 0

def resize_image_if_needed(img, max_dimension=MAX_DIMENSION):
    """resize image proportionally if either dimension exceeds the maximum"""
    width, height = img.size
    
    # check if resizing is needed
    if width <= max_dimension and height <= max_dimension:
        return img
    
    # calculate the scaling factor
    scale = min(max_dimension / width, max_dimension / height)
    new_width = int(width * scale)
    new_height = int(height * scale)
    
    # resize the image
    resized = img.resize((new_width, new_height), Image.LANCZOS)
    print(f"  resized from {width}x{height} to {new_width}x{new_height}")
    return resized

def prepare_image(image_path, handle_alpha=True, convert_to_webp=CONVERT_TO_WEBP):
    """open, resize, and prepare image for compression (including alpha handling and webp conversion)"""
    with Image.open(image_path) as img:
        # determine if image has alpha channel
        has_alpha = img.mode == 'RGBA' or img.mode == 'LA'
        
        # resize if needed before compressing
        resized_img = resize_image_if_needed(img)
        
        # handle image format conversion
        if convert_to_webp:
            print("  converting to webp format")
            # for png with alpha channel, we'll preserve the alpha
            if has_alpha and os.path.splitext(image_path)[1].lower() == '.png':
                print("  preserving alpha channel for png")
                # we're keeping the image as is, just changing the format later
            elif has_alpha and handle_alpha:
                # for other formats with alpha, convert to RGB if alpha handling is enabled
                print("  converting RGBA to RGB for non-png output")
                resized_img = resized_img.convert('RGB')
        else:
            # original behavior for non-webp output
            if handle_alpha and resized_img.mode == 'RGBA':
                output_format = os.path.splitext(image_path)[1].lower()
                if output_format in ['.jpg', '.jpeg']:
                    # convert RGBA to RGB for JPEG output
                    print("  converting RGBA to RGB for JPEG output")
                    resized_img = resized_img.convert('RGB')
        
        # return a copy of the image to avoid closing issues
        return resized_img.copy()

def compress_image(image_path, output_path, quality=99):
    """compress image with given quality, using prepared image"""
    img = prepare_image(image_path)
    
    # determine output format
    if CONVERT_TO_WEBP:
        # for webp output with png alpha, use lossless mode
        has_alpha = img.mode == 'RGBA' or img.mode == 'LA'
        is_png = os.path.splitext(image_path)[1].lower() == '.png'
        
        if has_alpha and is_png and WEBP_LOSSLESS:
            img.save(output_path, format="WEBP", lossless=True)
        else:
            img.save(output_path, format="WEBP", quality=quality)
    else:
        img.save(output_path, quality=quality, optimize=True)

def find_optimal_quality(image_path, max_size, min_quality=MIN_QUALITY, max_quality=INITIAL_QUALITY, prepared_img=None):
    """use binary search to find the optimal quality setting"""
    # create a temporary file for testing compression
    suffix = '.webp' if CONVERT_TO_WEBP else os.path.splitext(image_path)[1].lower()
    if suffix not in ['.jpg', '.jpeg', '.png', '.webp']:
        suffix = '.jpg'  # default fallback
    
    # use the prepared image if provided, otherwise prepare it
    img = prepared_img if prepared_img is not None else prepare_image(image_path)
    
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as temp_file:
        temp_filename = temp_file.name
        
        # helper function to compress without resizing
        def compress_only(quality):
            if CONVERT_TO_WEBP:
                has_alpha = img.mode == 'RGBA' or img.mode == 'LA'
                is_png = os.path.splitext(image_path)[1].lower() == '.png'
                
                if has_alpha and is_png and WEBP_LOSSLESS:
                    img.save(temp_filename, format="WEBP", lossless=True)
                else:
                    img.save(temp_filename, format="WEBP", quality=quality)
            else:
                img.save(temp_filename, quality=quality, optimize=True)
            return os.path.getsize(temp_filename)
        
        # check if even the highest quality meets the size requirement
        size_at_max = compress_only(max_quality)
        if size_at_max <= max_size:
            return max_quality
            
        # check if even the lowest quality doesn't meet the size requirement
        size_at_min = compress_only(min_quality)
        if size_at_min > max_size:
            return min_quality  # can't meet the requirement, return lowest quality
            
        # binary search for the optimal quality
        low, high = min_quality, max_quality
        best_quality = min_quality
        
        while low <= high:
            mid = (low + high) // 2
            size = compress_only(mid)
            
            print(f"    testing quality {mid}: {size} bytes")
            
            if size <= max_size:
                # this quality works, try to increase it to improve quality
                best_quality = mid
                low = mid + 1
            else:
                # need to decrease quality to meet size requirement
                high = mid - 1
                
        return best_quality

def compress_with_optimal_quality(image_path, output_path, max_size):
    """compress image once with optimal quality to meet size requirements"""
    # prepare the image (resize and handle alpha) just once
    img = prepare_image(image_path)
    
    # find optimal quality, passing the already prepared image
    optimal_quality = find_optimal_quality(image_path, max_size, prepared_img=img)
    
    # save with optimal quality
    if CONVERT_TO_WEBP:
        # ensure output path has webp extension
        base, ext = os.path.splitext(output_path)
        if ext.lower() != '.webp':
            output_path = base + '.webp'
            
        has_alpha = img.mode == 'RGBA' or img.mode == 'LA'
        is_png = os.path.splitext(image_path)[1].lower() == '.png'
        
        if has_alpha and is_png and WEBP_LOSSLESS:
            img.save(output_path, format="WEBP", lossless=True)
        else:
            img.save(output_path, format="WEBP", quality=optimal_quality)
    else:
        img.save(output_path, quality=optimal_quality, optimize=True)
    
    final_size = os.path.getsize(output_path)
    
    print(f"  optimal quality found: {optimal_quality}")
    print(f"  final size: {final_size} bytes")
    
    if final_size <= max_size:
        print(f"  success! compressed below target size of {max_size} bytes")
        return True
    else:
        print(f"  warning: could not compress below {max_size} bytes")
        return False

def brute_force_compress(image_path, output_path, max_size):
    """aggressively compress image to meet size requirements"""
    # first try more aggressive quality reduction
    img = prepare_image(image_path)
    
    # ensure output path has webp extension if converting
    if CONVERT_TO_WEBP:
        base, ext = os.path.splitext(output_path)
        if ext.lower() != '.webp':
            output_path = base + '.webp'
    
    # try qualities in decreasing order
    for quality in [10, 5, 1]:
        if CONVERT_TO_WEBP:
            has_alpha = img.mode == 'RGBA' or img.mode == 'LA'
            is_png = os.path.splitext(image_path)[1].lower() == '.png'
            
            if has_alpha and is_png and WEBP_LOSSLESS:
                img.save(output_path, format="WEBP", lossless=True)
            else:
                img.save(output_path, format="WEBP", quality=quality)
        else:
            img.save(output_path, quality=quality, optimize=True)
        
        final_size = os.path.getsize(output_path)
        
        if final_size <= max_size:
            print(f"  brute force quality {quality} success! final size: {final_size} bytes")
            return True
    
    # if quality reduction wasn't enough, start reducing dimensions
    width, height = img.size
    scale_factor = 0.8  # reduce by 20% each iteration (more aggressive than before)
    
    for attempt in range(5):
        # calculate new dimensions
        width = int(width * scale_factor)
        height = int(height * scale_factor)
        if width < 100 or height < 100:
            break  # prevent images becoming too small
            
        # resize image
        current_img = img.resize((width, height), Image.LANCZOS)
        print(f"  reducing to {width}x{height}, attempt {attempt+1}/5")
        
        # try minimum quality
        if CONVERT_TO_WEBP:
            has_alpha = current_img.mode == 'RGBA' or current_img.mode == 'LA'
            is_png = os.path.splitext(image_path)[1].lower() == '.png'
            
            if has_alpha and is_png and WEBP_LOSSLESS:
                current_img.save(output_path, format="WEBP", lossless=True)
            else:
                current_img.save(output_path, format="WEBP", quality=1)
        else:
            current_img.save(output_path, quality=1, optimize=True)
        
        final_size = os.path.getsize(output_path)
        
        if final_size <= max_size:
            print(f"  brute force resize success! final size: {final_size} bytes")
            return True
    
    print(f"  failed to compress below {max_size} bytes after all attempts")
    return False

def convert_to_webp_format(image_path, output_path, quality=99):
    """convert an image to webp format while preserving alpha channel if needed"""
    try:
        img = prepare_image(image_path, convert_to_webp=True)
        
        # ensure output path has webp extension
        base, ext = os.path.splitext(output_path)
        if ext.lower() != '.webp':
            output_path = base + '.webp'
        
        has_alpha = img.mode == 'RGBA' or img.mode == 'LA'
        is_png = os.path.splitext(image_path)[1].lower() == '.png'
        
        if has_alpha and is_png and WEBP_LOSSLESS:
            img.save(output_path, format="WEBP", lossless=True)
        else:
            img.save(output_path, format="WEBP", quality=quality)
        
        print(f"  converted to webp: {output_path}")
        return True
    except Exception as e:
        print(f"  error converting to webp: {e}")
        return False

def process_directory(directory, recursive=RECURSIVE):
    """process all images in directory, optionally recursively"""
    count = 0
    global TOTAL_BYTES_BEFORE, TOTAL_BYTES_AFTER, TOTAL_FILES_PROCESSED
    
    try:
        # check if the path exists and is accessible
        entries = os.listdir(directory)
    except (PermissionError, FileNotFoundError) as e:
        print(f"error accessing directory {directory}: {e}")
        return count
        
    for item in entries:
        item_path = os.path.join(directory, item)
        
        # skip hidden files/directories (starting with .)
        if item.startswith('.'):
            continue
        
        # process subdirectories if recursive is enabled
        if recursive and os.path.isdir(item_path):
            print(f"entering directory: {item_path}")
            count += process_directory(item_path, recursive)
            continue
            
        # process image file formats
        if os.path.isfile(item_path) and item.lower().endswith(('.png', '.jpg', '.jpeg')):
            try:
                size = os.path.getsize(item_path)
                base_filename, ext = os.path.splitext(item)
                
                if size > MAX_SIZE:
                    print(f"compressing {item_path}...")
                    # adjust filename for webp if needed
                    if CONVERT_TO_WEBP:
                        output_filename = os.path.join(directory, f"{OUTPUT_PREFIX}{base_filename}.webp")
                    else:
                        output_filename = os.path.join(directory, f"{OUTPUT_PREFIX}{item}")
                        
                    success = compress_with_optimal_quality(item_path, output_filename, MAX_SIZE)
                    count += 1
                    TOTAL_FILES_PROCESSED += 1
                    TOTAL_BYTES_BEFORE += size
                    
                    if success:
                        new_size = os.path.getsize(output_filename)
                        TOTAL_BYTES_AFTER += new_size
                        
                        # delete original if enabled and compression was successful
                        if DELETE_ORIGINALS:
                            try:
                                os.remove(item_path)
                                print(f"  deleted original file: {item_path}")
                            except Exception as e:
                                print(f"  error deleting original file: {e}")
                    else:
                        # add to failed compressions list
                        FAILED_COMPRESSIONS.append((item_path, output_filename))
                else:
                    # convert to webp if below size threshold but conversion is requested
                    if CONVERT_TO_WEBP:
                        print(f"converting {item_path} to webp (size: {size} bytes, below threshold)")
                        output_filename = os.path.join(directory, f"{OUTPUT_PREFIX}{base_filename}.webp")
                        success = convert_to_webp_format(item_path, output_filename)
                        count += 1
                        TOTAL_FILES_PROCESSED += 1
                        TOTAL_BYTES_BEFORE += size
                        
                        if success:
                            new_size = os.path.getsize(output_filename)
                            TOTAL_BYTES_AFTER += new_size
                            
                            # delete original if enabled and conversion was successful
                            if DELETE_ORIGINALS:
                                try:
                                    os.remove(item_path)
                                    print(f"  deleted original file: {item_path}")
                                except Exception as e:
                                    print(f"  error deleting original file: {e}")
                    else:
                        print(f"skipping {item_path} (size: {size} bytes, below threshold)")
            except Exception as e:
                print(f"@@@@@ error processing {item_path}: {e}")
    
    return count

def process_failed_compressions():
    """process images where standard compression failed, absolutely arbitrary params"""
    global TOTAL_BYTES_AFTER
    
    if not FAILED_COMPRESSIONS:
        return
        
    print("\n" + "="*80)
    print(f"compression failed for {len(FAILED_COMPRESSIONS)} images:")
    
    for i, (image_path, output_path) in enumerate(FAILED_COMPRESSIONS):
        size = os.path.getsize(image_path)
        print(f"{i+1}. {image_path} ({size} bytes)")
    
    print("\nwould you like to attempt brute force compression on these images? [y/n]")
    response = input().lower().strip()
    
    if response == 'y' or response == 'yes':
        print("\nbrute forcing compression...")
        success_count = 0
        still_failed = []
        
        for image_path, output_path in FAILED_COMPRESSIONS:
            print(f"brute forcing {image_path}...")
            if brute_force_compress(image_path, output_path, MAX_SIZE):
                success_count += 1
                TOTAL_BYTES_AFTER += os.path.getsize(output_path)
                
                # delete original if enabled and brute force was successful
                if DELETE_ORIGINALS:
                    try:
                        os.remove(image_path)
                        print(f"  deleted original file: {image_path}")
                    except Exception as e:
                        print(f"  error deleting original file: {e}")
            else:
                still_failed.append(image_path)
                
        print(f"\nbrute force complete: {success_count}/{len(FAILED_COMPRESSIONS)} successfully compressed")
        
        if still_failed:
            print("\nthe following images still couldn't be compressed below the target size:")
            for path in still_failed:
                print(f"- {path}")
    else:
        print("brute force compression skipped")

def format_bytes(size_bytes):
    """format bytes into a human readable format"""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024**2:
        return f"{size_bytes/1024:.2f} KB"
    elif size_bytes < 1024**3:
        return f"{size_bytes/1024**2:.2f} MB"
    else:
        return f"{size_bytes/1024**3:.2f} GB"

if __name__ == "__main__":

    # cli commands
    parser = argparse.ArgumentParser(description="compress images to target file size")
    parser.add_argument("-r", "--recursive", action="store_true", help="process subdirectories recursively")
    parser.add_argument("-s", "--size", type=int, default=MAX_SIZE, help="maximum file size in bytes")
    parser.add_argument("-d", "--dimension", type=int, default=MAX_DIMENSION, help="maximum width/height in pixels")
    parser.add_argument("-p", "--prefix", default=OUTPUT_PREFIX, help="prefix for output files")
    parser.add_argument("-w", "--webp", action="store_true", default=CONVERT_TO_WEBP, help="convert images to webp format")
    parser.add_argument("-l", "--lossless", action="store_true", default=WEBP_LOSSLESS, help="use lossless webp for PNG images with alpha")
    parser.add_argument("--no-webp", action="store_false", dest="webp", help="disable webp conversion")
    parser.add_argument("--delete-originals", action="store_true", default=DELETE_ORIGINALS, help="delete original files after successful compression")
    parser.add_argument("--keep-originals", action="store_false", dest="delete_originals", help="keep original files after compression")
    parser.add_argument("directory", nargs="?", default=".", help="directory to process (default: current directory)")
    args = parser.parse_args()
    
    # update global parameters from command line arguments
    MAX_SIZE = args.size
    MAX_DIMENSION = args.dimension
    OUTPUT_PREFIX = args.prefix
    RECURSIVE = args.recursive or RECURSIVE
    CONVERT_TO_WEBP = args.webp
    WEBP_LOSSLESS = args.lossless
    DELETE_ORIGINALS = args.delete_originals
    
    print(f"starting with settings:")
    print(f"  max file size: {MAX_SIZE} bytes")
    print(f"  max dimension: {MAX_DIMENSION} pixels")
    print(f"  recursive: {'yes' if RECURSIVE else 'no'}")
    print(f"  output prefix: '{OUTPUT_PREFIX}'")
    print(f"  convert to webp: {'yes' if CONVERT_TO_WEBP else 'no'}")
    print(f"  lossless webp for png with alpha: {'yes' if WEBP_LOSSLESS else 'no'}")
    print(f"  delete originals: {'yes' if DELETE_ORIGINALS else 'no'}")
    print(f"  directory: {args.directory}")
    
    # process the specified directory
    processed = process_directory(args.directory, RECURSIVE)
    
    # calculate space savings
    bytes_saved = TOTAL_BYTES_BEFORE - TOTAL_BYTES_AFTER
    percent_saved = 0 if TOTAL_BYTES_BEFORE == 0 else (bytes_saved / TOTAL_BYTES_BEFORE) * 100
    
    print(f"\ncompression completed. {processed} files processed.")
    print(f"space usage statistics:")
    print(f"  total files processed: {TOTAL_FILES_PROCESSED}")
    print(f"  original size: {format_bytes(TOTAL_BYTES_BEFORE)} ({TOTAL_BYTES_BEFORE:,} bytes)")
    print(f"  compressed size: {format_bytes(TOTAL_BYTES_AFTER)} ({TOTAL_BYTES_AFTER:,} bytes)")
    print(f"  space saved: {format_bytes(bytes_saved)} ({bytes_saved:,} bytes), {percent_saved:.2f}% reduction")
    
    # handle failed compressions
    process_failed_compressions()


