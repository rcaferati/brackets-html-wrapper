define(function(require, exports, module) {
    
    "use strict";
    
    var AppInit = brackets.getModule("utils/AppInit"),
        CommandManager    = brackets.getModule('command/CommandManager'),
        KeyBindingManager = brackets.getModule('command/KeyBindingManager'),
        Menus             = brackets.getModule('command/Menus'),
        EditorManager     = brackets.getModule('editor/EditorManager'),
        Dialogs           = brackets.getModule("widgets/Dialogs"),
        DocumentManager   = brackets.getModule("document/DocumentManager"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        editor,
        codeMirror,
        HTMLWrapper = require('HTMLWrapper'),
        CONTEXTUAL_COMMAND_ID = "caferati.htmlwrapper";
    
    function getSpace(selection, text){
        var ws = 0;
        text.replace(/^([\t\s]*)(.*)/ig,function(a,b,c,d){
            ws += b.length;
        });
        ws += selection.start.ch;
        return{
            first: ws - selection.start.ch,
            all: ws
        }
    }
    
    function wrapp(){
        var editor = EditorManager.getCurrentFullEditor(),
            selectedText = editor.getSelectedText(),
            selection = editor.getSelection(),
            doc = DocumentManager.getCurrentDocument(),
            language = doc.getLanguage(),
            fileType = language._id,
            prev = doc.getRange({line:0,ch:0},selection.start).trim() || "",
            opened,
            closed,
            text,
            extra,
            tag;
        
        if(!selectedText.length>0) return false;
        
        prev.replace(/(.*)<(select|ul|ol|nav|tr)([^>]*)(>$)/ig,function(a,b,c,d){
            if(c){
                opened = c;
            }
        });
        prev.replace(/(.*)<\/?([a-z]+)([^>]*)(>)$/ig,function(a,b,c){
            if(c){
                var reg = new RegExp("(.*)(<"+c+")([^>]*)(>)(.*)<\/?([a-z]+)([^>]*)(>)$","ig");
                prev.replace(reg, function(a,b,c,d){
                    extra = d || null;
                })
                closed = c;
            }
        });
        tag = ((opened && opened.match(/^(select|ul|ol|nav|tr)$/i)) || (closed && closed.match(/^(option|li|a|td|div|span|strong)$/i))) ? opened || closed : null;
        if(tag){
            text = HTMLWrapper.wrapp(selectedText,{
                tag:tag,
                space: getSpace(selection,selectedText),
                extra: extra
            });
            doc.replaceRange(text, selection.start, selection.end);
        }
        return true;
    }
    
    function check(){
        var doc = DocumentManager.getCurrentDocument(),
            language = doc.getLanguage(),
            fileType = language._id,
            contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);
        fileType.match(/html|php|aspx|xhtml/i) ? contextMenu.addMenuItem(CONTEXTUAL_COMMAND_ID) : contextMenu.removeMenuItem(CONTEXTUAL_COMMAND_ID);
    }
    
    CommandManager.register("HTML Wrapper", CONTEXTUAL_COMMAND_ID, wrapp);
    
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    var command = [{
        key: "Ctrl-Shift-E",
        platform: "win"
    }, {
        key: "Cmd-Shift-E",
        platform: "mac"
    }];
    menu.addMenuDivider();
    menu.addMenuItem(CONTEXTUAL_COMMAND_ID, command);    
    
    
    $(EditorManager).on("activeEditorChange", function(){
        check();
    });
    
});