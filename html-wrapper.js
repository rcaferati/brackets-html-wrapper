define(function(require, exports, module) {
    
    var space = {
        first:"",
        all:""
    };
    
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
                close = "option";
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
                close = "a";
                break;
        }
        if(extra){
            tag+=extra;
        }
        if(lines.length>0){
            for(var i  in lines){
                lines[i] = ( i>0 ? space.all : space.first) + "<"+tag+">"+lines[i].trim()+"</"+close+">";
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