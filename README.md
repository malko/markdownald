# <img src="https://raw.github.com/malko/markdownald/master/markdownald.png" valign="middle"/> Markdownald
This is another node-webkit application for markdown editing.
It's really targeted for github flavored markdown and try to be a real desktop app, not a web app ported to node-webkit.

# Installation
First you will need to install node-webkit for your platform see [node-webkit](https://github.com/rogerwang/node-webkit) repository for details

then clone this repository:
```
$ git clone git@github.com:malko/markdownald.git
```

go to the application directory and launch node-webkit:
```
$ cd markdownald
$ nm ./
```
or under linux if nw is in your path you can launch directly 
```
$ ./markdownald/markdownald.sh
```

## Todo
- [x] better editor bindings on return and indent/outdent
- [x] check for dirty file before closing tab / window
- [ ] add editor bindings for common style opération (bold, underline, add link, images...)
- [ ] add recent list file management to the file menu
- [x] add mode wrap to user settings
- [x] better css for markdown rendering
- [ ] allow users to change theme settings
- [ ] integrate with github api to read and save directly from github
- [ ] export generated output to html / pdf ...

### Built thanks to others open source projects
- [node-webkit](https://github.com/rogerwang/node-webkit) as the foundation of the application
- [stylus](http://learnboost.github.io/stylus/) to ease css creation
- [marked](https://github.com/chjj/marked) for the preview of the markdown generated
- [highlightjs](https://github.com/isagalaev/highlight.js) for highlighting source code in preview
- [CodeMirror](http://codemirror.net/) for the editor part
