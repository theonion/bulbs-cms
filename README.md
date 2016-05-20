# bulbs-cms [![Build Status](https://travis-ci.org/theonion/bulbs-cms.svg?branch=master)](https://travis-ci.org/theonion/bulbs-cms) [![Coverage Status](https://coveralls.io/repos/theonion/bulbs-cms/badge.svg?branch=master&service=github)](https://coveralls.io/github/theonion/bulbs-cms?branch=master)

## Development

To start developing:
1. `npm run setup` will run npm install and bower install
1. `npm start` to run the dev server
1. `npm run karma` will unit test your code as you make changes

## Releasing

To create a new release: stop any running build scripts and ensure you're on the ```master``` branch, then:
```bash
$ ./scripts/tag-and-release <versioning-type>
```
where ```versioning-type``` is one of ```major```, ```minor```, or ```patch```. See [semver](http://semver.org/) for an explanation of what each of these types of versionings mean.

This will build, version up, and push the dist to a tag identified by the new version.

### Create a 'temp' release

To create a tag not associated with any particular version run:
```bash
$ ./scripts/tag-and-release temp
```

This will build and push the dist to a tag identified by `temp-<last commit hash>-<current branch name>`.

Use this in situations where you need to point someone else to a distribution for some analysis or testing.
