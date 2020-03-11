documentation build src/index.js -f html -o ./docs --config documentation.yml

cat docs/assets/style.css docs/custom.css > docs/assets/style1.css
mv docs/assets/style1.css docs/assets/style.css

python ./docs/tools/html_cleaner.py

if [ $1 = 'html' ];
then
  exit
fi

documentation build src/index.js -f md -o ./docs/temp.md --config documentation.yml

python ./docs/tools/markdown_cleaner.py

rm ./docs/temp.md

