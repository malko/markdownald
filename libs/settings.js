var core = require('./core.js')
	, initialized = false
;

//-- global settings events
core.on('settings.save', function(){
	initialized && core.emit('storage.set', 'settings', global.settings);
});
core.on('settings.set', function(key, val){
	global.settings[key] = val;
	core.emit('settings.save');
});
core.on('settings.get', function(cb){
	core.emit('storage.get', 'settings', function(settings){
		global.settings = settings;
		cb && cb(settings);
	});
});



core.on('settings.font-increment', function(){
	if ( global.settings.fontSize < 51) {
		global.settings.fontSize++;
		core.emit('settings.save');
		core.emit('font-size.change', global.settings.fontSize);
	}
});
core.on('settings.font-decrement', function(){
	if (global.settings.fontSize > 6) {
		global.settings.fontSize--;
		core.emit('settings.save');
		core.emit('font-size.change', global.settings.fontSize);
	}
});




function restoreSettings(){
	if( initialized ){
		return;
	}
	initialized = true;
	// restore settings
	core.emit('editor.setTheme', global.settings.editorTheme);
	core.emit('font-size.change', global.settings.fontSize);
}

core.on('application.ready', restoreSettings);