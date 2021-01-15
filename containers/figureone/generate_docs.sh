documentation build src/index.js -f html -o ./docs/api --config documentation.yml

cat docs/api/assets/style.css docs/api/custom.css > docs/api/assets/style1.css
mv docs/api/assets/style1.css docs/api/assets/style.css

python ./docs/api/tools/html_cleaner.py

if [ "$1" = "html" ];
then
  exit
fi

# documentation build src/index.js -f md -o ./docs/temp.md --config documentation.yml

# python ./docs/tools/markdown_cleaner.py

# rm ./docs/temp.md

