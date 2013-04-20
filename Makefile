test:
	@npm install
	@./node_modules/.bin/mocha \
		--require should \
		--check-leaks \
		--reporter dot

.PHONY: test