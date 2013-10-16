var core = require('./core.js')
	, fs = require('fs')
	, editor = require('./editor.js')
	, $ = global.$
	, settings = global.settings
	, inputOpen = $('<input type="file" id="fileopen" style="display:none" accept=".markdown,.md,.txt" multiple />').appendTo('body')
	, inputSaveAs = $('<input type="file" id="filesaveas" style="display:none" nwsaveas />').appendTo('body')
	, inputSaveAsHTML = $('<input type="file" id="exportAsHTML" style="display:none" nwsaveas="" />').appendTo('body')
;

function resetInputFile(elmt){
	var f = new window.File('','')
		, files = new window.FileList()
	;
	files.append(f);
	elmt.files = files;
}
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
inputSaveAsHTML.on('change', function(){
	this.files.length && core.emit('file.html-exported', this.files[0].path);
})

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


core.on('file.saveas', function(){
	inputSaveAs.click();
	resetInputFile(inputSaveAs[0]);
});

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
core.on('file.html-export', function(){
	inputSaveAsHTML.attr('nwsaveas', editor.getActive().fileName.replace(/\.[^.]+$/,'') + '.html').click();
	resetInputFile(inputSaveAsHTML[0]);
});
core.on('file.html-exported', function(exportPath){
	if (! exportPath) {
		return;
	}
	try{
		var html = [
				'<!DOCTYPE html>\n<html>\n<head>\n\t'
				,'<!-- generated using https://github.com/malko/markdownald -->\n\t'
				,'<meta charset="utf-8">\n\t'
			]
			, title = $('#tabs .active').text().replace(/\.[^\.]+$/,'')
			, content = $('#preview').html()
			, previewTheme = $('link#previewTheme').attr('href')
			, previewCodeTheme = $('link#previewCodeTheme').attr('href')
			, hasCode = content.match(/<pre|code/)
		;
		html.push('<title>' + title + '</title>\n\t<style>\n');
		html.push('#preview{ margin:0 auto; max-width:780px; box-shadow: 0 0 250px #000;}\n');
		html.push('#preview, #preview>article{border-radius: 1em;}\n');
		html.push(fs.readFileSync(previewTheme));
		hasCode && html.push(fs.readFileSync(previewCodeTheme));
		html.push('\n\t</style>\n</head>\n<body><div id="preview">');
		html.push(content + '\n</div>\n<body>\n</html>');
		fs.writeFileSync(exportPath, html.join(''), 'utf8');
	} catch (e) {
		window.alert('Error while exporting to html:\n' + e);
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
