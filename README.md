# <img src="https://raw.github.com/malko/markdownald/master/markdownald.png" valign="middle"/> Markdownald

A fully-fledged Markdown desktop application that supports Github Flavored Markdown. Created using Node-Webkit.

current release: v0.0.2 hamburger

## Deprecation notice:
> This project is not maintained anymore. It was fun to make it at the time being, but there's good support for markdown edition in major editors like vscode now. 

# Installation
## prebuilt binaries

you can download prebuilt binaries for [latest release here](https://github.com/malko/markdownald/releases/latest)

## from source
First you will need to install node-webkit for your platform see [node-webkit](https://github.com/rogerwang/node-webkit) repository for details. If not already install install [nodejs](http://nodejs.org/) too.

then clone this repository:
```
$ git clone git@github.com:malko/markdownald.git
```

go to the application directory, install the dependencies and launch node-webkit:
```
$ cd markdownald
$ npm install
$ nw ./
```
or under linux if nw is in your path you can launch directly
```
$ ./markdownald/markdownald.sh
```

## Todo
- [-] add editor bindings for common style opération (bold, underline, add link, images...)
  - [ ] lists, bloquotes, titles
  - [ ] images, links
- [ ] add recent list file management to the file menu
- [-] better css for markdown rendering
  - [-] add some styles
- [ ] export generated output to pdf
- [ ] integrate with github api to read and save directly from github

### Built thanks to others open source projects
- [node-webkit](https://github.com/rogerwang/node-webkit) as the foundation of the application
- [stylus](http://learnboost.github.io/stylus/) to ease css creation
- [marked](https://github.com/chjj/marked) for the preview of the markdown generated
- [highlightjs](https://github.com/isagalaev/highlight.js) for highlighting source code in preview
- [CodeMirror](http://codemirror.net/) for the editor part
