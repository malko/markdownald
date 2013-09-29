var util = require("util")
	, events = require("events")
;
function Core(){events.EventEmitter.call(this);};

util.inherits(Core, events.EventEmitter);
module.exports = new Core();