from pathlib import Path
import re

markdown_file = Path(__file__).parent.parent/'temp.md'

text = ''
with open(markdown_file, 'r') as f:
  text = f.readlines()

out = [];
write_line = True
in_type = False
for line in text:
  write_line = True
  if re.search('^ *- *\[Properties\]', line):
    write_line = False
  if re.search('^ *- *\[Examples\]', line):
    write_line = False
  if re.search('^ *- *\[Parameters\]', line):
    write_line = False
  if line.startswith('#'):
    if re.search('^#* Type', line) or re.search('^#* EQN', line):
      in_type = True
    else:
      in_type = False
  if in_type and line.startswith('Type:'):
    write_line = False

  if write_line:
    out.append(line)

with open(markdown_file.parent/'README.md', 'w') as f:
  f.writelines(out)
