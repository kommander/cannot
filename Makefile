usage:
	@echo ''
	
	@echo ''
	
	@echo 'Core tasks                       : Description'
	@echo '--------------------             : -----------'
	@echo 'make dev                         : Setup repository for development (install, hooks)'
	@echo 'make test                        : Run tests'
	@echo 'make coverage                    : Create test coverage report to ./coverage'
	@echo 'make release                     : Publish version-tag matching package.json'
	
	@echo ''

	@echo 'Additional tasks                 : Description'
	@echo '--------------------             : -----------'
	@echo 'make hooks                       : Creates git hooks to run tests before a push (done by make dev)'
	@echo 'make setup                       : Install all necessary dependencies'
	@echo 'make release-patch               : Increment package version 0.0.1 -> 0.0.2 then release'
	@echo 'make release-minor               : Increment package version 0.1.0 -> 0.2.0 then release'
	@echo 'make release-major               : Increment package version 1.0.0 -> 2.0.0 then release'
	@echo '                                   (should use ´make npm-config´ before)'
	
	@echo ''
# - 

test:
	@./node_modules/.bin/mocha \
		--require should \
		--check-leaks \
		--reporter dot
.PHONY: test

coverage:
	@node ./node_modules/istanbul/lib/cli.js cover \
	./node_modules/.bin/_mocha -- $(TEST_FOLDERS) --require should --recursive --compilers coffee:coffee-script/register --reporter dot
.PHONY: coverage

setup:
	npm install
.PHONY: setup

hooks:
	cp ./dev/module.pre-push.sh ./.git/hooks/pre-push
	chmod +x ./.git/hooks/pre-push
.PHONY: hooks

lint:
	@node ./node_modules/eslint/bin/eslint.js --env browser,node ./**/*.js
.PHONY: lint

dev: setup hooks

VERSION = $(shell node -pe 'require("./package.json").version')
release-patch: NEXT_VERSION = $(shell node -pe 'require("semver").inc("$(VERSION)", "patch")')
release-minor: NEXT_VERSION = $(shell node -pe 'require("semver").inc("$(VERSION)", "minor")')
release-major: NEXT_VERSION = $(shell node -pe 'require("semver").inc("$(VERSION)", "major")')
release-patch: release
release-minor: release
release-major: release

release: test
ifndef $(value NEXT_VERSION)
	@ make usage
	@exit 1
endif
	@printf "Current version is $(VERSION). This will publish version $(NEXT_VERSION). Press [enter] to continue." >&2
	@read
	@node -e '\
		var j = require("./package.json");\
		j.version = "$(NEXT_VERSION)";\
		var s = JSON.stringify(j, null, 2);\
		require("fs").writeFileSync("./package.json", s);'
	@git commit package.json -m 'Version $(NEXT_VERSION)'
	@git tag -a "v$(NEXT_VERSION)" -m "Version $(NEXT_VERSION)"
	@git push --tags origin HEAD:master
	npm publish
.PHONY: release release-patch release-minor release-major
