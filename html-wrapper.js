define(function (require, exports, module) {

	function stripTags(str) {
		return str.replace(/(<([^>]+)>)/ig, "");
	}

	function setSlug(str) {
		var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;",
			to = "aaaaaeeeeeiiiiooooouuuunc------";
		str = str.replace(/^\s+|\s+$/g, '').toLowerCase();
		for (var i = 0, l = from.length; i < l; i++) {
			str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
		}
		return str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
	}

	function replaceSlug(tag, url) {
		if (tag.match(/href/)) {
			tag = tag.replace(/(.*)?(href)([\s]+)?(\=)(["']{1})?([^"'\s]+)?(.*)/, "$1$2$3$4$5$6/" + setSlug(url) + "$7");
		}
		return tag;
	}

	function replaceValue(tag, url) {
		if (tag.match(/value/)) {
			tag = tag.replace(/(.*)?(value)([\s]+)?(\=)(["']{1})?([^"'\s]+)?(.*)/, "$1$2$3$4$5$6" + url.trim() + "$7");
		}
		return tag;
	}

	function outerTag(text, tag) {
		var x = "<" + tag + ">\n" + text + "\n</" + tag + ">";
		return x;
	}

	function create(lines, tag, close) {
		if (lines.length > 0) {
			for (var i = 0; i < lines.length; i++) {
				lines[i] = "<" + (tag.match(/^a\s?/i) ? replaceSlug(tag, lines[i]) : tag.match(/^option\s?/i) ? replaceValue(tag, lines[i]) : tag) + ">" + lines[i].trim() + "</" + close + ">";
			}
			return lines.join("\n");
		}
	}

	function replace(lines, tag, close) {
		var str;
		if (lines.length > 0 && tag.match(/^(select|option|nav|a)$/ig)) {
			if (lines[0].match(/(.*)(value|href)(\=)(["']{2})(.*)/ig)) {
				for (var i = 0; i < lines.length; i++) {
					lines[i] = lines[i].replace(/(.*)(value|href)(\=)(["']{2})(.*)/ig, "$1$2$3'" + (tag.match(/^(nav|a)$/ig) ? "/" + setSlug(stripTags(lines[i])) : stripTags(lines[i])).trim() + "'$5");
				}
			} else {
				switch (tag) {
				case "select":
				case "option":
					for (var i = 0; i < lines.length; i++) {
						str = lines[i].match(/(.*)(value)(\=)(["']{1})?([0-9]+)(["']{1})?(.*)/ig) ? "" : i;
						lines[i] = lines[i].replace(/(.*)(value)(\=)(["']{1})?([^"']+)?(.*)/ig, "$1$2$3$4" + str + "$6");
					}
					break;
				case "nav":
				case "a":
					for (var i = 0; i < lines.length; i++) {
						lines[i] = lines[i].replace(/(.*)(value|href)(\=)(["']{1})?([^"'\s]+)?(.*)/ig, "$1$2$3$4$6");
					}
					break;
				}
			}
		}
		return lines.join("\n");
	}

	function innerTags(text, tag, extra) {
		var lines = text.split(/\n|\r/mig),
			close = tag;
		switch (tag) {
		case "select":
			extra = extra || " value=''";
			tag = close = "option";
			break;
		case "ul":
		case "ol":
			tag = "li";
			close = tag;
			break;
		case "tr":
			tag = "td";
			close = tag;
			break;
		case "nav":
		case "a":
			extra = extra || " href=''";
			tag = close = "a";
			break;
		}
		var has = text.match(new RegExp("^([\\s]*\<)" + tag + "(\\s|>)", "ig")) ? 1 : 0;
		if (has) {
			return replace(lines, tag, close);
		} else {
			if (extra)
				tag += extra;
			return create(lines, tag, close);
		}
		return "";
	}

	function wrapp(text, params) {
		params = params || {};
		if (text.length > 0) {
			var r = innerTags(text, params.tag, params.extra);
			if (!params.tag) {
				r = outerTag(r, "ul");
			}
			return r;
		}
	}

	return {
		wrapp: wrapp
	};
});
