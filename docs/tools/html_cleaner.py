from pathlib import Path
import re

html_file = Path(__file__).parent.parent/'index.html'

text = ''
with open(html_file, 'r') as f:
  text = f.readlines()

out = [];
write_line = True
in_type = False
for line in text:
  write_line = True

  if re.search('<section class=\'p2 mb2 clearfix bg-white minishadow\'>', line):
    in_type = False
  if re.search('<h3 class=\'fl m0\' id=\'eqn_', line):
    in_type = True
  if re.search('<h3 class=\'fl m0\' id=\'obj_', line):
    in_type = True
  if re.search('<div class=\'pre p1 fill-light mt0\'>', line):
    write_line = False
  if re.search('^ *Type:', line) and re.search('<p>', out[-1]):
    out[-1] = f'{out[-1][0: -2]} style="display: none;">'

  if write_line:
    out.append(line)

with open(html_file.parent/'index.html', 'w') as f:
  f.writelines(out)
