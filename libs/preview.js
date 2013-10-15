var core = require('./core.js')
	, marked = require('marked')
	, hljs = require('highlight.js')
	, preview = $('#preview > .content')
	, processing = false
;


preview.on('click', ':checkbox', function(){
	return false;
});
marked.setOptions({
	gfm: true
	, highlight: function (code, lang) {
		if( code && lang ){
			return hljs.highlight(lang, code ).value;
		} else {
			return hljs.highlightAuto(code).value;
		}
	}
	, tables: true
	, breaks: true
	, pedantic: false
	, sanitize: false
	, smartLists: true
	, smartypants: false
	, langPrefix: 'lang-'
});


core.on('preview.update', function(md){
	if( processing){
		return;
	}
	if( ! md ){
		preview.html('');
		return;
	}
	processing = true;
	try{
		marked(md, {}, function (err, content) {
			if (err){
				console.log(err);
			}
			preview.html(
				content.replace(/<a /g,'<a target="_blank" ')
					.replace(/^<li>\[ \]/mg,'<li><input type="checkbox"/>')
					.replace(/^<li>\[-\]/img,'<li><input type="checkbox" checked="checked" disabled/>')
					.replace(/^<li>\[x\]/img,'<li><input type="checkbox" checked="checked"/>')
			);
			processing = false;
		});
	} catch (e){
		window.alert('Error while comiling markdown:\n'+e);
		processing = false;
	}
})
