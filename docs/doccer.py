import json

tree = {}

with open('docs/index.json', 'r') as file:
  tree = json.loads(file.read())

print(tree[0].keys())

