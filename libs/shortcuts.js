var core = require('./core.js')
	, util = require("util")
	, events = require("events")
	, keyCodes = {
		BACK_SPACE:8
		, TAB:9
		, ENTER:13
		, CAPS_LOCK:20
		, ESCAPE:27
		, SPACE:32
		, PAGE_UP:33
		, PAGE_DOWN:34
		, END:35
		, HOME:36
		, LEFT:37
		, "←":37
		, UP:38
		, "↑":38
		, RIGHT:39
		, "→":39
		, DOWN:40
		, "↓":40
		, INSERT:45
		, DELETE:46
		, 0:48
		, 1:49
		, 2:50
		, 3:51
		, 4:52
		, 5:53
		, 6:54
		, 7:55
		, 8:56
		, 9:57
		, A:65
		, B:66
		, C:67
		, D:68
		, E:69
		, F:70
		, G:71
		, H:72
		, I:73
		, J:74
		, K:75
		, L:76
		, M:77
		, N:78
		, O:79
		, P:80
		, Q:81
		, R:82
		, S:83
		, T:84
		, U:85
		, V:86
		, W:87
		, X:88
		, Y:89
		, Z:90
		, CONTEXT_MENU:93
		, NUMPAD_0:96
		, NUMPAD_1:97
		, NUMPAD_2:98
		, NUMPAD_3:99
		, NUMPAD_4:100
		, NUMPAD_5:101
		, NUMPAD_6:102
		, NUMPAD_7:103
		, NUMPAD_8:104
		, NUMPAD_9:105
		, NUMPAD_MULTIPLY:106
		, NUMPAD_ADD:107
		, NUMPAD_ENTER:108
		, NUMPAD_SUBTRACT:109
		, NUMPAD_DECIMAL:110
		, NUMPAD_DIVIDE:111
		, F1:112
		, F2:113
		, F3:114
		, F4:115
		, F5:116
		, F6:117
		, F7:118
		, F8:119
		, F9:120
		, F10:121
		, F11:122
		, F12:123
		, ADD:187
		, PLUS:187
		, EQUAL:187
		, '+':187
		, '=':187
		, COMMA:188
		, ',':188
		, MINUS:189
		, SUBSTRACT:189
		, UNDERSCORE:189
		, '-':189
		, '_':189
		, PERIOD:190
		, '.':190
	}
	, keyExp = new RegExp("^.*?\\b([a-zA-Z0-9-]+|" + Object.keys(keyCodes).map(function(a){ return a.replace(/([+?|.\\$^*])/g,"\\$1")}).join('|') + ")$",'i')
	, shortcut
;


function standardize(shortcut){
	//- console.log(shortcut)
	var keys;
	if( typeof shortcut === 'string' ){
		keys = { Alt: !!shortcut.match(/\bAlt\b/)
			, Ctrl: !!shortcut.match(/\bCtrl\b/)
			, Shift: !!shortcut.match(/\bShift\b/)
			, key: shortcut.replace(keyExp, '$1').toUpperCase()
		};
		keys.keyCode=( typeof keyCodes[keys.key] === 'undefined')?keys.key:keyCodes[keys.key];
	} else {// consider to work on an event
		keys = {
			Alt: !!shortcut.altKey
			,Ctrl: !!(shortcut.ctrlKey || shortcut.metaKey)
			,Shift: !!shortcut.shiftKey
			,key: shortcut.which
			,keyCode: shortcut.keyCode
		};
		for( var i in keyCodes ){
			if( keys.key === keyCodes[i] ){
				keys.key=i;
			}
		}
	}
	return 'shortcut.' + (keys.Alt?'A':'') + (keys.Ctrl?'C':'') + (keys.Shift?'S':'') + '.' + keys.keyCode;
}


function Shortcut(){events.EventEmitter.call(this);};
util.inherits(Shortcut, events.EventEmitter);

function standardizeArgs(args){
	args = [].slice.apply(args);
	args[0] = standardize(args[0]);
	return args;
}
Shortcut.prototype.on = function(){
	return events.EventEmitter.prototype.on.apply(this, standardizeArgs(arguments));
}
Shortcut.prototype.removeListener = function(){
	return events.EventEmitter.prototype.removeListener.apply(this, standardizeArgs(arguments));
}
Shortcut.prototype.removeAllListeners = function(){
	return events.EventEmitter.prototype.removeAllListeners.apply(this, standardizeArgs(arguments));
}
Shortcut.prototype.emit = function(){
	return events.EventEmitter.prototype.emit.apply(this, standardizeArgs(arguments));
}

shortcut = new Shortcut();
shortcut.setMaxListeners(0);
shortcut.KEYCODES = keyCodes;

module.exports = shortcut;

window.document.addEventListener('keydown',function(e){
	shortcut.emit(e);
})