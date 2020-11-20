#!/bin/bash

# build the PPT
yarn
node architecture.js
node -e "require('./drawio.js')().generate('drawio.xml')"

# get the current gh-pages branch
git clone --depth=1 --branch=gh-pages "https://${GITHUB_TOKEN}@github.com/l2fprod/myarchitecture" build

# copy over the PPT
cp mycatalog-architecture-diagram-template.pptx build
cp drawio.xml build

git config --global push.default simple
git config --global user.email "autobuild@not-a-dom.ain"
git config --global user.name "autobuild"

# commit to gh-pages
(cd build && git add . && git commit -m "new deck" && git push)
