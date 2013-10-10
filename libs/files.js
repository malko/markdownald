var core = require('./core.js')
	, fs = require('fs')
	, editor = require('./editor.js')
	, $ = global.$
	, settings = global.settings
;


core.on('file.open', function(){
	$('input#fileopen').click();
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

core.on('file.saveas', function(){ $('#filesaveas').click(); });

core.on('file.new', function(){ editor.tabNew(); });
core.on('file.save', function(){
	var activeEditor = editor.getActive();
	if (! (activeEditor && activeEditor.filePath)) {
		core.emit('file.saveas');
	} else {
		fs.writeFileSync(activeEditor.filePath, activeEditor.editor.getValue());
		$('#tab-' + activeEditor.editorId).removeClass('dirty');
	}
});
core.on('file.close', function(){
	core.emit('editor.close', editor.getActive());
});