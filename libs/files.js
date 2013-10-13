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

//-- restore files from previous session
core.on('application.ready', function(){
	var errors = [];
	global.settings.lastOpened && global.settings.lastOpened.forEach(function(filePath){
		try{
			editor.tabOpen(filePath,fs.readFileSync(filePath).toString());
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
		window.alert('Some files were not found:\n\t- ' + errors.join('\n\t- '));
	}
})
