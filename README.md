# <img src="https://raw.github.com/malko/markdownald/master/markdownald.png" valign="middle"/> Markdownald

A fully-fledged Markdown desktop application that supports Github Flavored Markdown. Created using Node-Webkit.

# Installation
First you will need to install node-webkit for your platform see [node-webkit](https://github.com/rogerwang/node-webkit) repository for details

then clone this repository:
```
$ git clone git@github.com:malko/markdownald.git
```

go to the application directory, install the dependencies and launch node-webkit:
```
$ cd markdownald
$ npm install
$ nm ./
```
or under linux if nw is in your path you can launch directly 
```
$ ./markdownald/markdownald.sh
```

## Todo
- [x] better editor bindings on return and indent/outdent
- [x] navigate through tabs with keyboard navigation
- [x] check for dirty file before closing tab / window
- [x] allow drag on drop of files from file system
- [x] add some delay for the rendering to avoid flickering in certain cases
- [-] add editor bindings for common style opération (bold, underline, add link, images...)
  - [x] bold, italic
  - [ ] lists, bloquotes, titles
  - [ ] images, links
- [x] add fullscreen support
- [ ] add recent list file management to the file menu
- [x] add detection for disk file change
- [x] add mode wrap to user settings
- [-] better css for markdown rendering
  - [-] add some styles
  - [x] add a display for checkboxes as on github flavord markdown
- [x] allow users to change theme settings
  - [x] for editor
  - [x] font size
  - [x] for markdown
  - [x] for interface
  - [x] for highlighted code preview
- [x] export generated output to html
- [ ] export generated output to pdf 
- [ ] integrate with github api to read and save directly from github

### Built thanks to others open source projects
- [node-webkit](https://github.com/rogerwang/node-webkit) as the foundation of the application
- [stylus](http://learnboost.github.io/stylus/) to ease css creation
- [marked](https://github.com/chjj/marked) for the preview of the markdown generated
- [highlightjs](https://github.com/isagalaev/highlight.js) for highlighting source code in preview
- [CodeMirror](http://codemirror.net/) for the editor part
