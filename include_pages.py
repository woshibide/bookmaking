"""
this is to add page number where image was found to 
to the .txt, provided that .txt contains same string as the image name

script to make report is here
https://www.marspremedia.com/software/indesign/links-report
"""

import csv

def add_page_numbers(report_csv, index_txt, output_txt):
    # Read the report csv and map image names to page numbers
    image_pages = {}
    with open(report_csv, 'r') as csvfile:
        reader = csv.reader(csvfile)
        next(reader)  # Skip header
        for row in reader:
            image_name, page_number = row
            image_pages[image_name.strip('"')] = page_number.strip('"')

    # Read the index txt file
    with open(index_txt, 'r') as f:
        lines = f.readlines()

    # Process lines to add page numbers
    updated_lines = []
    for line in lines:
        print("processing line:", line)
        if line.strip().isdigit():
            image_id = line.strip()
            print("found image id:", image_id)
            image_filename = f"{image_id}.jpg"
            print(f"page number for {image_filename}:", page_number)
            new_data = f"[{page_number} p.] {image_id}\n"
            updated_lines.append(new_data)
        else:
            updated_lines.append(line)

    # Write the updated lines to the output file
    with open(output_txt, 'w') as f:
        f.writelines(updated_lines)

if __name__ == "__main__":
    add_page_numbers('report.csv', 'index.txt', 'updated_index.txt')
