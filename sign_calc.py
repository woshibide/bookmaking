"""
this is to show what pages will be facing outwards
when bookbinded with an open spine, very usefull
when wanting to apply graphics on the spine of a book

"""

def calculate_signatures(total_pages: int, signature_size: int = 16) -> list:
    """
    calculate signature ranges for book binding
    
    args:
        total_pages: total number of pages in the document
        signature_size: number of pages in each signature (default 16)
    
    returns:
        list of tuples containing start and end page numbers for each signature
    """
    signatures = []
    start_page = 1
    
    while start_page <= total_pages:
        end_page = min(start_page + signature_size - 1, total_pages)
        signatures.append([start_page, end_page])
        start_page += signature_size
    
    return signatures

def print_signatures(signatures: list) -> None:
    """
    print signature ranges in a clean format
    """
    for signature in signatures:
        print(f"[{signature[0]:>3}, {signature[1]:>3}]")

if __name__ == "__main__":
    # example usage
    total_pages = 560
    signature_size = 16
    
    signatures = calculate_signatures(total_pages, signature_size)
    print_signatures(signatures)

