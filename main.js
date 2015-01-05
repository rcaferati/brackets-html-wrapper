define(function (require, exports, module) {

	"use strict";

	var CommandManager = brackets.getModule('command/CommandManager'),
		Menus = brackets.getModule('command/Menus'),
		EditorManager = brackets.getModule('editor/EditorManager'),
		DocumentManager = brackets.getModule("document/DocumentManager"),
		PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
		editor,
		codeMirror,
		HTMLWrapper = require('html-wrapper'),
		CONTEXTUAL_COMMAND_ID = "caferati.htmlwrapper",
		menu,
		contextMenu,
		command;

	function getLastLine(text) {
		var match = text.match(/([^\n\r]+)$/ig);
		if (match.length == 1) {
			return match[0];
		}
		return "";
	}

	function getLineDif(text1, text2) {
		var dif = getLastLine(text2).length - getLastLine(text1).length;
		return dif;
	}

	function reindent(codeMirror, from, to) {
		codeMirror.operation(function () {
			codeMirror.eachLine(from, to, function (line) {
				codeMirror.indentLine(line.lineNo(), "smart");
			});
		});
	}

	function wrapp() {
		var editor = EditorManager.getCurrentFullEditor(),
			selectedText = editor.getSelectedText(),
			selection = editor.getSelection(),
			doc = DocumentManager.getCurrentDocument(),
			language = doc.getLanguage(),
			fileType = language._id,
			prev = doc.getRange({
				line: 0,
				ch: 0
			}, selection.start) || "",
			opened,
			closed,
			text,
			extra,
			tag;

		if (!selectedText.length > 0 || !prev.length) return;

		prev = prev.trim();
		prev
			.replace(/(.*)<(select|ul|ol|nav|tr)([^>]*)(>$)/ig, function (a, b, c, d) {
				if (c) {
					opened = c;
				}
			})
			.replace(/(.*)<\/?([a-z]+)([^>]*)(>)$/ig, function (a, b, c) {
				if (c) {
					var reg = new RegExp("(.*)(<" + c + ")([^>]*)(>)(.*)<\/?([a-z]+)([^>]*)(>)$", "ig");
					prev.replace(reg, function (a, b, c, d) {
						extra = d || null;
					})
					closed = c;
				}
			});

		tag = ((opened && opened.match(/^(select|ul|ol|nav|tr)$/i)) || (closed && closed.match(/^(option|li|a|td|div|span|strong)$/i))) ? opened || closed : null;
		if (tag) {
			text = HTMLWrapper.wrapp(selectedText, {
				tag: tag,
				extra: extra
			});
			codeMirror = editor._codeMirror;
			codeMirror.replaceRange(text, selection.start, selection.end);
			codeMirror.setSelection(selection.start, {
				ch: selection.end.ch + getLineDif(selectedText, text),
				line: selection.end.line
			});
			reindent(codeMirror, selection.start.line, selection.end.line + 1);
		}
	}

	CommandManager.register("HTML Wrapper", CONTEXTUAL_COMMAND_ID, wrapp);
	menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
	contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);
	command = [{
		key: "Ctrl-Shift-E",
		platform: "win"
    }, {
		key: "Cmd-Shift-E",
		platform: "mac"
    }];
	menu.addMenuDivider();
	menu.addMenuItem(CONTEXTUAL_COMMAND_ID, command);
	contextMenu.addMenuItem(CONTEXTUAL_COMMAND_ID);
});
