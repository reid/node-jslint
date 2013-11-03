install:
	npm i .

lint:
	find test bin lib -name "*.js" ! -name "jslint-*.js" -print0 | xargs -0 node ./bin/jslint.js

test:
	find test -name "*.js" -print0 | xargs -0 node test/*.js

doc:	man/jslint.1 doc/jslint.html

man/jslint.1: doc/jslint.md
	mkdir -p man
	./node_modules/.bin/ronn -r $< > $@

doc/jslint.html: doc/jslint.md
	./node_modules/.bin/ronn -5 $< > $@

.PHONY: install lint test doc
