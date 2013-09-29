var core = require('./core.js')
	, editorNextId = 0
	, fileNameExp = /^(?:.*?[\/\\])?([^\/\\]+)$/
	, listCaptureExp = /^(\s*)((?:[-*+]|\d+\.) )(.*)$/
;


function setFilePath(filePath){
	this.filePath = filePath || '';
	this.fileName = filePath ? this.filePath.replace(fileNameExp, '$1') : 'New File';
}

function Editor(filePath, content){
	var self = this;
	self.editorId = editorNextId++;
	self.el = $('<div id="content-' + self.editorId + '"></div>');
	setFilePath.call(this, filePath);
	self.content = content;
	self.active = false;
	self.editor = CodeMirror(self.el[0], {
		value: content || 'Enter your content here\n```\nfunction test(a, b, c){\n\treturn a + b * c / 100;\n]\n```',
		mode: "markdown",
		indentWithTabs: true,
		lineNumbers: true,
		theme:'ambiance',
		extraKeys:{
			'Tab':function(cm){ CodeMirror.commands["indentMore"](cm); }
			, 'Shift-Tab':function(cm){ CodeMirror.commands["indentLess"](cm); }
			, 'Enter':function(cm){
				if( cm.somethingSelected() ){
					cm.replaceSelection('\n');
				} else {
					var cursor = cm.getCursor()
						, line = cm.getLine(cursor.line)
						, listMatch = line.match(listCaptureExp)
					;
					if(! listMatch ){
						CodeMirror.commands.newlineAndIndent(cm);
					} else {
						if( ! listMatch[3] ){ // empty line remove the list marker
							cm.setLine(cursor.line, '');
							cm.replaceSelection("\n", "end", "+input");
						} else { // add list marker at start of line
							CodeMirror.commands.newlineAndIndent(cm);
							cm.replaceSelection(listMatch[2], "end");
						}
					}
				}
			}
		}
	});
	self.editor.on('change',function(editor){
		core.emit('editor.change', self, editor.getValue());
	});
	core.emit('editor.ready', self);
}

Editor.prototype.changePath = function(newPath){
	setFilePath.call(this, newPath);
	core.emit('editor.filepath.changed', this, newPath);
}

module.exports = {
	tabNew: function(){
		return new Editor();
	},
	tabOpen: function(filePath, content){
		return new Editor(filePath, content);
	}
};