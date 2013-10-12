var core = require('./core.js')
	, editorNextId = 0
	, fileNameExp = /^(?:.*?[\/\\])?([^\/\\]+)$/
	, listCaptureExp = /^(\s*)((?:[-*+]|\d+\.) )(.*)$/
	, activeEditor
;

function Editor(filePath, content){
	var self = this;
	self.editorId = editorNextId++;
	setFilePath(this, filePath);
	self.content = content;
	self.active = false;
	self.el = undefined;
	self.editor = undefined;
	self.initialized = false;
	core.emit('editor.ready', self);
}

function initEditor(self, domElmt){
	self.el = $(domElmt).prop('id', 'content-' + self.editorId);
	self.editor = CodeMirror(self.el[0], {
		value: self.content || 'Enter your content here\n```\nfunction test(a, b, c){\n\treturn a + b * c / 100;\n]\n```'
		, mode: "markdown"
		, indentWithTabs: true
		, lineNumbers: true
		, lineWrapping: !!global.settings.wrapmode
		, extraKeys:{
			'Tab':function(cm){ CodeMirror.commands["indentMore"](cm); }
			, 'Shift-Tab':function(cm){ CodeMirror.commands["indentLess"](cm); }
			, 'Enter':function(cm){
				if( cm.somethingSelected() ){
					cm.replaceSelection('\n');
					cm.setCursor(cm.getCursor("end"));
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
	self.initialized = true;
	core.emit('editor.initialized', self, self.editor.getValue());
}
Editor.prototype.init = function(domElmt){
	if( this.initialized ){
		throw "Editor already initialized";
	}
	initEditor(this,domElmt);
}


function setFilePath(self, filePath){
	self.filePath = filePath || '';
	self.fileName = filePath ? self.filePath.replace(fileNameExp, '$1') : 'New File';
}
Editor.prototype.changePath = function(newPath){
	setFilePath(this, newPath);
	core.emit('editor.filepath.changed', this, newPath);
	return this;
}

Editor.prototype.isDirty = function(){ return !! this.editor.isClean(); }
Editor.prototype.markClean = function(){ ! this.editor.markClean(); return this;}

//-- activeEditor tracking
core.on('activeEditor.set', function(editor){
	activeEditor = editor;
	core.emit('preview.update', editor ? editor.editor.getValue() : '');
});

core.on('activeEditor.get', function(cb){
	cb( activeEditor );
});

//-- edit menu binding
function replaceActiveSelection(replaceCb){
	if(! activeEditor ){
		return;
	}
	var sel = activeEditor.editor.getSelection();
	sel && activeEditor.editor.replaceSelection(replaceCb(sel));
}
core.on('editor.toggleBold', function(){
	replaceActiveSelection(function(sel){
		if( sel.match(/^(__|\*\*)[\s\S]+(\1)$/) ){ // remove
			return sel.replace(/^(__|\*\*)([\s\S]+)(\1)$/g,'$2');
		}
		return '**' + sel + '**';
	});
});
core.on('editor.toggleItalic', function(){
	replaceActiveSelection(function(sel){
		if( sel.match(/^(_|\*)[\s\S]+(\1)$/) ){
			return sel.replace(/^(_|\*)([\s\S]+)(\1)$/g,'$2');
		}
		return '_' + sel + '_';
	});
});
core.on('editor.indent',function(){
	activeEditor && CodeMirror.commands.indentMore(activeEditor.editor);
});
core.on('editor.outdent',function(){
	activeEditor && CodeMirror.commands.indentLess(activeEditor.editor);
});
core.on('editor.setTheme',function(theme){
   editor.setEditorsOption('theme', theme);
	core.emit('settings.set','theme-editor', theme);
});

//-- module exposure
module.exports = {
	tabNew: function(){
		return new Editor();
	}
	, tabOpen: function(filePath, content){
		return new Editor(filePath, content);
	}
	, cmApplyAll: function(cb){
		$('#editors .CodeMirror').each(function(){
			cb(this.CodeMirror);
		});
	}
	, getActive: function(){ return activeEditor; }
	, setEditorsOption: function(option, value){
		CodeMirror.defaults[option] = value;
		$('.CodeMirror').each(function(){
			this.CodeMirror && this.CodeMirror.setOption(option, value);
		});
	}
};