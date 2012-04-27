var FileEditor = (function() {

    function FileEditor() {
    	var e = this;
	    e.editor = ace.edit("editor");
	    e.editor.setTheme("ace/theme/textmate");
	    e.editor.getSession().setMode("ace/mode/javascript");
	    return e;
    }

    FileEditor.prototype = {


    };

    return FileEditor;

})();





