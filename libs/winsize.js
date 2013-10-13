// Cross-platform window state preservation. from https://github.com/rogerwang/node-webkit/wiki/Preserve-window-state-between-sessions
// Yes this code is quite complicated, but this is the best I came up with for
// current state of node-webkit Window API (v0.7.3).
// Known issues:
// - unmaximization not always sets the window (x, y) in the lastly used coordinates
// - unmaximization animation sometimes looks wierd

var gui = require('nw.gui');
var win = gui.Window.get();
var winState;
var currWinMode;
var resizeTimeout;
var isMaximizationEvent = false;

function initWindowState() {
	winState = JSON.parse(localStorage.windowState || 'null');

	if (winState) {
		currWinMode = winState.mode;
		if (currWinMode === 'maximized') {
			win.maximize();
		} else {
			restoreWindowState();
		}
	} else {
		currWinMode = 'normal';
		dumpWindowState();
	}

	win.show();
}

function dumpWindowState() {
	if (!winState) {
		winState = {};
	}

	// we don't want to save minimized state, only maximized or normal
	if (currWinMode === 'maximized') {
		winState.mode = 'maximized';
	} else {
		winState.mode = 'normal';
	}

	// when window is maximized you want to preserve normal
	// window dimensions to restore them later (even between sessions)
	if (currWinMode === 'normal') {
		winState.x = win.x;
		winState.y = win.y;
		winState.width = win.width;
		winState.height = win.height;
	}
}

function restoreWindowState() {
	win.resizeTo(winState.width, winState.height);
	win.moveTo(winState.x, winState.y);
}

function saveWindowState() {
	dumpWindowState();
	localStorage.windowState = JSON.stringify(winState);
}

initWindowState();

win.on('maximize', function () {
	isMaximizationEvent = true;
	currWinMode = 'maximized';
});

win.on('unmaximize', function () {
	currWinMode = 'normal';
	restoreWindowState();
});

win.on('minimize', function () {
	currWinMode = 'minimized';
});

win.on('restore', function () {
	currWinMode = 'normal';
});

win.window.addEventListener('resize', function () {
	// resize event is fired many times on one resize action,
	// this hack with setTiemout forces it to fire only once
	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(function () {

		// on MacOS you can resize maximized window, so it's no longer maximized
		if (isMaximizationEvent) {
			// first resize after maximization event should be ignored
			isMaximizationEvent = false;
		} else {
			if (currWinMode === 'maximized') {
				currWinMode = 'normal';
			}
		}

		dumpWindowState();

	}, 250);
}, false);
