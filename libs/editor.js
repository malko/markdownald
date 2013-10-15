var core = require('./core.js')
	, fs = require('fs')
	, editorNextId = 0
	, fileNameExp = /^(?:.*?[\/\\])?([^\/\\]+)$/
	, listCaptureExp = /^(\s*)((?:[*+-]|\d+\.) )(.*)$/
	, editors = []
	, activeEditor
;

function Editor(filePath, content){
	var self = this;
	self.editorId = editorNextId++;
	setFilePath(this, filePath);
	self.content = content;
	self.active = false;
	self.watcher = undefined;
	self.el = undefined;
	self.editor = undefined;
	self.initialized = false;
	core.emit('editor.ready', self);
	editors.push(self);
}

function initEditor(self, domElmt){
	self.el = global.$(domElmt).prop('id', 'content-' + self.editorId);
	self.editor = global.CodeMirror(self.el[0], {
		value: self.content || 'Enter your content here\n```\nfunction test(a, b, c){\n\treturn a + b * c / 100;\n]\n```'
		, mode: "gfm"
		, indentWithTabs: true
		, lineNumbers: true
		, lineWrapping: !!global.settings.wrapmode
		, theme: global.settings.editorTheme
		, extraKeys:{
			'Tab': function(cm){ CodeMirror.commands["indentMore"](cm); }
			, 'Shift-Tab': function(cm){ CodeMirror.commands["indentLess"](cm); }
			, 'F3': 'findNext'
			, 'Shift-F3': 'findPrev'
			, 'Esc': 'clearSearch'
			, 'Ctrl-G': function(cm){
				cm.openDialog('go to line <input type=number/>', function(l){
					console.log(l);
					l && cm.setCursor(+l-1,1);
				});
				//- var l = window.prompt('Go to line'); l && cm.setCursor(-1+l,0)
			}
			, 'Enter': function(cm){
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
	self.filePath && fileWatchStart(self);
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
	self.initialized && core.emit('editor.filepath.changed', self, filePath);
}
Editor.prototype.changePath = function(newPath){
	setFilePath(this, newPath);
	return this;
}

function fileWatchStop(self){
	if( self.watcher && self.watcher.close ){
		self.watcher.close();
		self.watcher = undefined;
	}
}
function fileWatchStart(self){
	fileWatchStop(self);
	if( ! self.filePath ){
		return;
	}
	self.watcher = fs.watch(self.filePath, function(event, fileName){
		// fire event in 50ms to avoid multiple call and stop watching in the while
		fileWatchStop(self);
		setTimeout(function(){ core.emit('editor.diskchange', self, event, fileName); fileWatchStart(self);}, 50);
	});
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
	activeEditor && global.CodeMirror.commands.indentMore(activeEditor.editor);
});
core.on('editor.outdent',function(){
	activeEditor && global.CodeMirror.commands.indentLess(activeEditor.editor);
});

//-- editors settings
function setEditorsOption(option, value){
	global.CodeMirror.defaults[option] = value;
	global.$('.CodeMirror').each(function(){
		this.CodeMirror && this.CodeMirror.setOption(option, value);
	});
}
core.on('editor.setTheme',function(theme){
	setEditorsOption('theme', theme);
});

core.on('editor.save', function(editor, filePath){
	fileWatchStop(editor);
	filePath && setFilePath(editor, filePath);
	fs.writeFileSync(editor.filePath, editor.editor.getValue());
	fileWatchStart(editor);
	core.emit('editor.saved', editor);
});
core.on('editor.reload', function(filePath){
	var editor = getByFilePath(filePath);
	if( editor ){
		editor.editor.setValue(fs.readFileSync(filePath).toString());
		editor.editor.markClean();
		core.emit('editor.change', editor, editor.editor.getValue());
	}
});
//-- clean up when closing editor
core.on('editor.close',function(editor){
	fileWatchStop(editor);
	~editors.indexOf(editor) && editors.splice(editors.indexOf(editor),1);
	core.emit('editor.closed', editor);
});

function getAllInstances(){
	var res = [], i=0, l=editors.length;
	for( ; i<l; i++){
		res.push(editors[i]);
	}
	return res;
}
function getByFilePath(filePath){
	var res = editors.filter(function(editor){
		return editor.filePath === filePath;
	});
	return res.length ? res[0] : undefined;
}
//-- module exposure
module.exports = {
	tabNew: function(){
		return new Editor();
	}
	, tabOpen: function(filePath, content){
		return new Editor(filePath, content);
	}
	, cmApplyAll: function(cb){
		global.$('#editors .CodeMirror').each(function(){
			cb(this.CodeMirror);
		});
	}
	, getAllInstances: getAllInstances
	, getByFilePath: getByFilePath
	, getActive: function(){ return activeEditor; }
	, setEditorsOption: setEditorsOption
};