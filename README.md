bulbs-cms
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

`grunt test` will jshint and unit test your code as you make changes

`grunt travis` will run unit tests once

Deploying
---------

1. git checkout release
2. git merge master
3. grunt build
4. git commit
5. git push
6. make a [release](https://github.com/theonion/bulbs-cms/releases)
7. update [bower.json](https://github.com/theonion/bulbs-cms/blob/master/bower.json) with the new version number
8. update bower versions elsewhere to deploy the new version
