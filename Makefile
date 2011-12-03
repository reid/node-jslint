install:
	npm i .

lint:
	find . -name "*.js" -print0 | xargs -0 node ./bin/jslint.js

.PHONY: install lint
