#!/bin/bash
npx typedoc
cp -r docs/api/apiassets docs/api-typedoc/apiassets
cp -r docs/api/tutorials docs/api-typedoc/tutorials

# Create symlinks in subdirectories so relative image paths
# like ./apiassets/cube.png and ./tutorials/morph/img.gif resolve correctly
for dir in interfaces classes functions types modules documents; do
  if [ -d "docs/api-typedoc/$dir" ]; then
    ln -sfn ../apiassets "docs/api-typedoc/$dir/apiassets"
    ln -sfn ../tutorials "docs/api-typedoc/$dir/tutorials"
  fi
done
