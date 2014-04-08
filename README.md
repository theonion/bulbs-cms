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

`grunt test` to test

Deploying
---------

1. git checkout release
2. git merge master
3. grunt build
4. git commit
5. git push
6. make a release
7. update bower versions accordingly
