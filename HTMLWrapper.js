define(function(require, exports, module) {
    
    var space = {
        first:"",
        all:""
    };
    
    function outerTag(text, tag){
        var x = "<"+tag+">\n"+text+"\n</"+tag+">";
        return x;
    }

    function innerTags(text, tag){
        var lines = text.split(/\n|\r/mig),
            close = tag;
        switch(tag){
            case "select" : 
            case "option" :
                tag = "option value=''";
                close = "option";
                break;
            case "ul" : 
            case "ol" :
            case "li" :                
                tag = "li";
                close = tag;
                break;
            case "nav":
            case "a":
                tag = "a href='/'";
                close = "a";
                break;
            default : 
                tag = "li";
                close = "li";
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
            var r = innerTags(text, params.tag);
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