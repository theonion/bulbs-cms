bulbs-cms [![Build Status](https://travis-ci.org/theonion/bulbs-cms.svg?branch=master)](https://travis-ci.org/theonion/bulbs-cms) [![Coverage Status](https://img.shields.io/coveralls/theonion/bulbs-cms.svg)](https://coveralls.io/r/theonion/bulbs-cms?branch=master)
=========

`grunt build` to compile

Development
-----------

Install [node.js](http://nodejs.org/download/)

Install dependencies:

    npm install
    npm install -g bower
    bower install

`grunt serve` to run the dev server

`grunt karma` will unit test your code as you make changes

Deploying
---------

1. git checkout release
2. git merge master
3. grunt publish
4. update bower versions on your site's bower.json

In order to use `grunt publish`, you'll have to get a [GitHub access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use), and do:

```
$ export GITHUB_USERNAME=your-username-here
$ export GITHUB_TOKEN=your-access-token-here
```

You'll probably want to put those export commands in your `.bash_profile`
