# documentation build src/index.js -f md -o ./docs/index.md --config documentation.yml
documentation build src/index.js -f html -o ./docs --config documentation.yml

cat docs/assets/style.css docs/custom.css > docs/assets/style1.css
mv docs/assets/style1.css docs/assets/style.css

documentation build src/index.js -f md -o ./docs/README.md --config documentation.yml

# documentation build src/index.js -f html -o ./docs --config documentation.yml