"""
this is to find duplicated images in the 
report produced from indesign

script to make report is here
https://www.marspremedia.com/software/indesign/links-report
"""

from collections import defaultdictr

input_file_path = "report.txt"
output_file_path = f"duplicates_{input_file_path}.txt"

image_counts = defaultdict(int)

with open(input_file_path, "r") as file:
    lines = file.readlines()

for line in lines[1:]:
    parts = line.strip().split()
    if parts: 
        image_name = parts[0]
        image_counts[image_name] += 1

duplicates = {name: count for name, count in image_counts.items() if count > 1}

with open(output_file_path, "w") as output_file:
    output_file.write("Images that occur multiple times:\n")
    if duplicates:
        for image, count in sorted(duplicates.items()):
            output_file.write(f"{image}: {count} times\n")
    else:
        output_file.write("No images occur multiple times.\n")

print(f"Duplicate image report has been saved to '{output_file_path}'.")
