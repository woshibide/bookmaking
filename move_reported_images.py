"""

this is to move reported images into a different directory,
provided that report.txt contains same names as images

script to make report is here
https://www.marspremedia.com/software/indesign/links-report

"""

import os
import shutil

report_file = "report.txt"
dest_dir = "a_directory"

os.makedirs(dest_dir, exist_ok=True)

with open(report_file, "r", encoding="utf-8") as file:
    lines = file.readlines()[1:]

for line in lines:
    file_name = line.split('\t')[0].strip()
    if os.path.isfile(file_name):
        dest_path = os.path.join(dest_dir, os.path.basename(file_name))
        shutil.move(file_name, dest_path)
        print(f"Moved: {file_name}")
    else:
        print(f"File not found: {file_name}")

