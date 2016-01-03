#!/usr/bin/env python3

import collections
import csv
import json
import sys

indices = [
    "Indicativo-Presente",
    "Indicativo-Futuro",
    "Indicativo-Imperfecto",
    "Indicativo-Pretérito",
    "Indicativo-Condicional",
    "Indicativo-Presente perfecto",
    "Indicativo-Futuro perfecto",
    "Indicativo-Pluscuamperfecto",
    "Indicativo-Pretérito anterior",
    "Indicativo-Condicional perfecto",
    "Subjuntivo-Presente",
    "Subjuntivo-Imperfecto",
    "Subjuntivo-Futuro",
    "Subjuntivo-Presente perfecto",
    "Subjuntivo-Futuro perfecto",
    "Subjuntivo-Pluscuamperfecto",
    "Imperativo Afirmativo-Presente",
    "Imperativo Negativo-Presente",
]

with open(sys.argv[1], 'r') as csv_file:
    reader = csv.reader(csv_file)
    words = collections.defaultdict(lambda: [""] * ((len(indices) * 6) + 1))

    next(reader) # Skip the header.
    for row in reader:
        offset = indices.index(row[2] + "-" + row[4]) * 6
        for index in range(0, 6):
            # The imperative forms are in a very strange order. Correct
            # that here.
            if (offset == 16*6 or offset == 17*6) and index == 2:
               target = 7 + 4
            elif (offset == 16*6 or offset == 17*6) and index == 4:
               target = 7 + 2
            else:
               target = 7 + index
            words[row[0]][offset + index + 1] = row[target]

        # Add the definition as the first member of the data array.
        words[row[0]][0] = row[1]

print("__WORDS__ = " + json.dumps(words, ensure_ascii=False, indent=True, sort_keys=True))
