var core = require('./core.js')
	, settings = global.settings
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
	if (settings.fontSize < 51) {
		settings.fontSize++;
		core.emit('settings.save');
		core.emit('font-size.change', settings.fontSize);
	}
});
core.on('settings.font-decrement', function(){
	if (settings.fontSize > 6) {
		settings.fontSize--;
		core.emit('settings.save');
		core.emit('font-size.change', settings.fontSize);
	}
});




function restoreSettings(){
	// restore settings
	core.emit('settings.theme-editor', settings.editorTheme);
	core.emit('font-size.change', settings.fontSize);
}
module.exports = {
	initialize: function(){
		restoreSettings();
		(initialized = true);
	}
};