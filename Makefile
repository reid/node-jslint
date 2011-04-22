install:
	npm i .

lint:
	find . -name "*.js" -print0 | xargs -0 jslint

.PHONY: install lint
