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
	function menuItem(label, args, defaults, additionalShortcuts){
		(args instanceof Function) && (args = {click:args});
		var i;

		if( ! (args || defaults) ){
			args={};
		} else if (defaults && ! args){
			args = defaults;
		} else if (args && defaults){
			for( i in defaults ){
				if(defaults.hasOwnProperty(i) && args[i] === undefined){
					args[i] = defaults[i];
				}
			}
		}

		label && (args.label = label);

		var item = new gui.MenuItem(args)
			, click = function(){ item.click(); }
		;
		additionalShortcuts || (additionalShortcuts = []);
		if( ~label.indexOf('_') && !~label.indexOf('(') ){
			var key;
			item.label = args.label && args.label.replace(/_(.)/,function(m,k){
				key= ' (Ctrl+' + k + ')';
				shortcuts.on('Ctrl+'+k, click)
				return k;
			});
			item.label += key || '';
		} else {
			label.replace(/ \(([^\)]+)\)$/, function(m,k){
				additionalShortcuts = additionalShortcuts.concat(k.split(/\s*,\s*/));
			})
		}
		additionalShortcuts.forEach(function(k){ shortcuts.on(k, click); });
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
	
	//-- FILE MENU
	appMenu.append(subMenuItem('_file')
		.append('_new', function(){ core.emit('file.new') })
		.append('_open', function(){ core.emit('file.open') })
		.appendSeparator()
		.append('_save', function(){ core.emit('file.save') })
		.append('save as (Ctrl+Shift+s)', function(){ core.emit('file.saveas') })
		.appendSeparator()
		.append('export html', function(){ core.emit('file.html-export'); })
		.appendSeparator()
		.append('close (Ctrl+w)', function(){ core.emit('file.close'); })
		.append('_quit', function(){ core.emit('application.close'); })
	);

	//-- EDIT MENU
	appMenu.append(subMenuItem('edit')
		.append('_bold',function(){ core.emit('editor.toggleBold'); })
		.append('_italic',function(){ core.emit('editor.toggleItalic'); })
		.appendSeparator()
		//- .append('ordered list',function(){ core.emit('edit.orderedlist'); })
		//- .append('unordered list',function(){ core.emit('edit.unorderedlist'); })
		.append('indent',function(){ core.emit('editor.indent'); })
		.append('outdent',function(){ core.emit('editor.outdent');})
	);

	//-- VIEW MENU
	appMenu.append(subMenuItem('view')
		.append('refresh preview (Ctrl+r, F5)', function(){ core.emit('view.refresh-preview'); })
		.appendSeparator()
		.append('next tab (Ctrl+PAGE_DOWN)', function(){ core.emit('view.tab-next');})
		.append('previous tab (Ctrl+PAGE_UP)', function(){ core.emit('view.tab-prev');})
		.appendSeparator()
		.append('toggle application fullscreen (F11)',function(){ core.emit('view.fullscreen'); })
		.append('(un)maximize editor pane (Ctrl+Shift+f)',function(){ core.emit('view.fullscreen-editor'); })
		.append('(un)maximize preview pane (Ctrl+p)',function(){ core.emit('view.fullscreen-preview'); })
	);

	//-- SETTINGS
	var editorThemeSubMenu = subMenuItem('Editor theme')
		, windowThemeSubMenu = subMenuItem('Application theme')
		, previewThemeSubMenu = subMenuItem('Preview theme')
		, previewCodeThemeSubMenu = subMenuItem('highlighted code theme')
	;
	appMenu.append(subMenuItem('settings')
		.append('wrap long lines', {
			type:'checkbox'
			, click:function(){
				if( this.checked ){
					core.emit('settings.wrapon');
				} else {
					core.emit('settings.wrapoff');
				}
			}
			, checked: !! global.settings.wrapmode
		})
		.append('increase font size (Ctrl+Numpad_add)', function(){ core.emit('settings.font-increment'); })
		.append('decrease font size (Ctrl+Numpad_subtract)', function(){ core.emit('settings.font-decrement'); })
		.appendSeparator()
		.append(subMenuItem('preview rendering mode')
			.append('as you type', function(){ core.emit('settings.set', 'previewMode', 'sync')})
			.append('delayed', function(){ core.emit('settings.set', 'previewMode', 'auto')})
			.append('manually', function(){ core.emit('settings.set', 'previewMode', 'manual')})
		)
		.appendSeparator()
		.append(subMenuItem('themes')
			.append(windowThemeSubMenu)
			.append(editorThemeSubMenu)
			.append(previewThemeSubMenu)
			.append(previewCodeThemeSubMenu)
		)
	);

	// get and append themes
	function appendTheme(submenuItem, themesPath, cb, selectedTheme){
		fs.readdir(themesPath, function(err, themes){
			themes.forEach(function(theme){
				if(! theme.match(/\.css$/) ){
					return;
				}
				theme = theme.replace(/.css$/,'');
				var item = menuItem(
					theme.replace(/_/g,' ')
					, function(){
						cb(theme);
						submenuItem.submenu.items.forEach(function(sibling){
							sibling.checked && sibling !== item && (sibling.checked = false);
						})
					}
					, {type: 'checkbox', checked: theme===selectedTheme}
				);
				submenuItem.append(item);
			});
		});
	}
	appendTheme(
		windowThemeSubMenu
		, './css/'
		, function(theme){
			core.emit('application.setTheme', theme);
			core.emit('settings.set','applicationTheme',theme);
		}
		, global.settings.applicationTheme
	);
	appendTheme(
		editorThemeSubMenu
		, './node_modules/codemirror/theme'
		, function(theme){
			core.emit('editor.setTheme', theme);
			core.emit('settings.set','editorTheme',theme);
		}
		, global.settings.editorTheme
	);
	appendTheme(
		previewThemeSubMenu
		, './css/markdown'
		, function(theme){
			core.emit('preview.setTheme', theme);
			core.emit('settings.set','previewTheme',theme);
		}
		, global.settings.previewTheme
	);
	appendTheme(
		previewCodeThemeSubMenu
		, './css/highlightjs'
		, function(theme){
			core.emit('preview.setCodeTheme', theme);
			core.emit('settings.set','previewCodeTheme',theme);
		}
		, global.settings.previewCodeTheme
	);
	var helpMenu = subMenuItem('?');
	appMenu.append(helpMenu
		.append('help on github', function(){
			global.gui.Shell.openExternal('https://help.github.com/articles/github-flavored-markdown');
		})
		.append('Markdown syntax guide', function(){
			global.gui.Shell.openExternal('http://daringfireball.net/projects/markdown/syntax');
		})
		.appendSeparator()
		.append('about', function(){
			global.window.alert('Markdownald the markdown editor\nUnder MIT alike license by Jonathan Gotti');
		})
	);
	//- ~global.gui.App.argv.indexOf('--dev') &&
	helpMenu.appendSeparator().append('show devtools', function(){ global.gui.Window.get().showDevTools(); });


	// finally add the menu to the window
	gui.Window.get().menu = appMenu;
})();