;(function(){
	var shortcuts = require('./shortcuts.js');
	if( gui.Window && gui.Window.get() && gui.Window.get().menu ){
		return;
	}

	//-- internal subMenu methods implementations
	function _subMenuAppend(item){
		if( ! (item  instanceof gui.MenuItem) ){
			item = menuItem.apply(null,arguments);
		}
		this.submenu.append.call(this.submenu, item);
		return this;
	}

	function _subMenuAppendSeparator(){
		this.append.call(this, new gui.MenuItem({type:'separator'}));
		return this;
	}

	// return a new menuItem args can be a single function
	function menuItem(label, args, defaults){
		(args instanceof Function) && (args = {click:args});

		if( ! (args || defaults) ){
			args={};
		} else if (defaults && ! args){
			args = defaults;
		} else if (args && defaults){
			for( var i in defaults ){
				if(defaults.hasOwnProperty(i) && args[i] === undefined){
					args[i] = defaults[i];
				}
			}
		}

		label && (args.label = label);

		var item = new gui.MenuItem(args);
		if( ~label.indexOf('_') ){
			var key;
			item.label = args.label && args.label.replace(/_(.)/,function(m,k){
				key= ' (Ctrl+' + k + ')';
				shortcuts.on('Ctrl+'+k, function(){
					item.click();
				})
				return k;
			});
			item.label += key || '';
		} else {
			label.replace(/ \(([^\)]+)\)$/, function(m,k){
				shortcuts.on(k, function(){
					item.click();
				})
			})
		}
		return item;

	}

	function menuItemCheckbox(label, args){
		return menuItem(label, args, {type:'checkbox'});
	}

	function subMenuItem(label, args){
		var submenu = new gui.Menu(),
			item = menuItem(label.replace(/_/,''), args, {submenu: submenu});
			item.append = _subMenuAppend;
			item.appendSeparator = _subMenuAppendSeparator;
		/* Doesn't found a way to activate submenu programatically
		if( ~label.indexOf('_') ){
			label.replace(/_(.)/,function(m,k){
				item.label += ' (Alt+' + k + ')';
				shortcuts.on('Alt+' + k, function(){
					//item.emit('click');
					//- submenu.popup();
				})
			});
		}*/
		return item;
	}

	var core = require('./core.js')
		, fs = require('fs')
		, appMenu = new gui.Menu({type:'menubar'})
	;
	require('./filemanager.js');

	//-- FILE MENU
	appMenu.append(subMenuItem('_file')
		.append('_new', function(){ core.emit('menu.file.new') })
		.append('_open', function(){ core.emit('menu.file.open') })
		.appendSeparator()
		.append('_save', function(){ core.emit('menu.file.save') })
		.append('save as (Ctrl+Shift+s)', function(){ core.emit('menu.file.saveas') })
		.appendSeparator()
		.append('close (Ctrl+w)', function(){ core.emit('menu.file.close'); })
		.append('_quit', function(){ core.emit('application.close'); })
	);

	//-- EDIT MENU
	appMenu.append(subMenuItem('edit')
		.append('_bold',function(){ core.emit('menu.edit.bold'); })
		.append('_italic',function(){ core.emit('menu.edit.italic'); })
		//- .appendSeparator()
		//- .append('ordered list',function(){ core.emit('menu.edit.orderedlist'); })
		//- .append('unordered list',function(){ core.emit('menu.edit.unorderedlist'); })
		//- .append('indent',function(){ core.emit('menu.edit.indent'); })
		//- .append('outdent',function(){ core.emit('menu.edit.outdent');})
	);

	//-- VIEW MENU
	appMenu.append(subMenuItem('view')
		.append('toggle application fullscreen (F11)',function(){ core.emit('menu.view.fullscreen'); })
		.append('toggle editor pane _fullscreen',function(){ core.emit('menu.view.fullscreen-editor'); })
		.append('toggle _preview pane fullscreen',function(){ core.emit('menu.view.fullscreen-preview'); })
	);

	//-- SETTINGS
	var editorThemeSubMenu = subMenuItem('Editor theme');
	appMenu.append(subMenuItem('settings')
		.append('_wrap long lines',{
			type:'checkbox'
			, click:function(){
				if( this.checked ){
					core.emit('menu.settings.wrapon');
				} else {
					core.emit('menu.settings.wrapoff');
				}
			}
			, checked: !! global.settings.wrapmode
		})
		.appendSeparator()
		.append(editorThemeSubMenu)
	);

	// get and append editor themes
	fs.readdir('./node_modules/codemirror/theme', function(err, themes){
		themes.forEach(function(theme){
			editorThemeSubMenu.append(
				theme = theme.replace(/.css$/,''),
				function(){
					core.emit('menu.settings.theme-editor', theme);
				}
			)
		});
	});



	// finally add the menu to the window
	gui.Window.get().menu = appMenu;
})();