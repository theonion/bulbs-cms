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

git checkout release
git merge master
grunt build
git commit
git push
make a release
update bower versions accordingly
