define(function(require, exports, module) {

    var space = {
        first:"",
        all:""
    };

    function setSlug(str){
        var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;",
            to   = "aaaaaeeeeeiiiiooooouuuunc------";
        str = str.replace(/^\s+|\s+$/g, '').toLowerCase();
        for (var i=0, l=from.length ; i<l ; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }
        return str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    }

    function replaceSlug(tag, url){
        if(tag.match(/href/)){
            tag = tag.replace(/(.*)?(href)([\s]+)?(\=)(["']{1})?([^"'\s]+)?(.*)/,"$1$2$3$4$5$6/" + setSlug(url) + "$7");
        }
        return tag;
    }

    function outerTag(text, tag){
        var x = "<"+tag+">\n"+text+"\n</"+tag+">";
        return x;
    }

    function innerTags(text, tag, extra){
        var lines = text.split(/\n|\r/mig),
            close = tag;
        switch(tag){
            case "select" : 
                extra = extra || " value=''";
                tag = close = "option";
                break;
            case "ul" : 
            case "ol" :
                tag = "li";
                close = tag;
                break;
            case "tr" :
                tag = "td";
                close = tag;
                break;
            case "nav":
            case "a":
                extra = extra || " href=''";
                tag = close = "a";
                break;
        }
        if(extra)
            tag+=extra;

        if(lines.length>0){
            for(var i  in lines){
                lines[i] = ( i>0 ? space.all : space.first) + "<" + (tag.match(/^a\s?/i) ? replaceSlug(tag, lines[i]) : tag) + ">"+lines[i].trim()+"</"+close+">";
            }
            return lines.join("\n");
        }
        return "";
    }

    function setSpace(length){
        length = length || 0;
        var space = "",
            i;
        if(length>0){
            for(i=0; i<length%4; i++){
                space+=" ";
            }            
            for(i=0; i<Math.floor(length/4); i++){
                space+="\t";
            }
        }
        return space;
    }

    function wrapp(text, params){
        params = params || {};
        if(text.length>0){
            space.first = setSpace(params.space.first);
            space.all = setSpace(params.space.all);
            var r = innerTags(text, params.tag, params.extra);
            if(!params.tag){
                r = outerTag(r, "ul");
            }
            return r;
        }
    }

    return {
        wrapp: wrapp
    };    
});