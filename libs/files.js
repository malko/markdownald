var core = require('./core.js')
	, fs = require('fs')
	, editor = require('./editor.js')
	, $ = global.$
	, settings = global.settings
	, inputOpen = $('<input type="file" id="fileopen" style="display:none" accept=".markdown,.md,.txt" multiple />').appendTo('body')
	, inputSaveAs = $('<input type="file" id="filesaveas" style="display:none" nwsaveas />').appendTo('body')
;

//-- bind hidden file input elements
inputOpen.on('change',function(){
	var i=0, l=this.files.length;
	if( !this.files.length ){
		return;
	}
	for(; i<l; i++){
		core.emit('file.opened',this.files[i].path);
	}
});
inputSaveAs.on('change', function(){
	this.files.length && core.emit('file.save', this.files[0].path);
});

core.on('file.open', function(){
	inputOpen.click();
});

core.on('file.opened', function(filePath){
	if( ~settings.lastOpened.indexOf(filePath) ){ // todo check for opened file already in the list of opened file (+ remove it when closed)
		return ; // avoid listing twice the same file
	}
	settings.lastOpened.push(filePath);

	editor.tabOpen(filePath,fs.readFileSync(filePath).toString());
	if( ~settings.recentFiles.indexOf(filePath)){
		settings.recentFiles.push(filePath);
		if( settings.recentFiles.length > settings.maxRecentFileSize ){
			settings.recentFiles.splice(0, settings.recentFiles.length - settings.maxRecentFileSize);
		}
	}
	core.emit('storage.set','settings',settings)
});


core.on('file.saveas', function(){ inputSaveAs.click(); });

core.on('file.new', function(){ editor.tabNew(); });
core.on('file.save', function(filePath){
	var activeEditor = editor.getActive();
	if (! (filePath || (activeEditor && activeEditor.filePath) )) {
		core.emit('file.saveas');
	} else {
		core.emit('editor.save', activeEditor, filePath);
		$('#tab-' + activeEditor.editorId).removeClass('dirty');
	}
});
core.on('file.close', function(){
	core.emit('editor.close', editor.getActive());
});

//-- restore files from previous session
core.on('application.ready', function(){
	var errors = [];
	global.settings.lastOpened && global.settings.lastOpened.forEach(function(filePath){
		try{
			editor.tabOpen(filePath, fs.readFileSync(filePath).toString());
		} catch(e) {
			console.log(e, e.stack);
			errors.push(filePath);
		}
	});
	if (errors.length) {
		global.settings.lastOpened = global.settings.lastOpened.filter(function(filePath){
			return !~errors.indexOf(filePath);
		});
		core.emit('settings.save');
		window.alert('Error while trying to open some files:\n\t- ' + errors.join('\n\t- '));
	}
})
