"""
this is to show what pages will be facing outwards
when bookbinded with an open spine, very usefull
when wanting to apply graphics on the spine of a book

"""

signature_size = 16
section_count = 35

def generate_sequence(signature_size, section_count):
    sequence = []
    for section in range(section_count):
        if section % 2 == 0:  #
            sequence.append(1 + section * signature_size // 2)
        else: 
            sequence.append(signature_size + (section - 1) * signature_size // 2)
    return sequence

result = generate_sequence(signature_size, section_count * 2)
print(result)