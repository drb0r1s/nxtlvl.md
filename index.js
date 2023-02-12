import Log from "./Log.js";
import parser from "./grammar/parser.js";
import style from "./functions/style.js";

export default class NXTLVL {
    constructor(content = "", settings = {}) {
        this.content = content;
        
        this.defaultSettings = {};
        this.settings = {...this.defaultSettings, ...settings};

        this.md = this.md.bind(this);
        this.config = this.config.bind(this);
    }
    
    md(content = "") {
        if(!this.#check("content", content)) return;
        return this.#parse();
    }

    injectMd(element, content = "", rules) {
        if(!this.#check("content", content)) return;
        if(!this.#check("element", element)) return;
        if(rules && !this.#check("rules", rules)) return;
        
        element.innerHTML = this.#parse();

        if(rules) style(element, rules);
    }

    style(element, rules) {
        if(!this.#check("element", element)) return;
        if(!this.#check("rules", rules)) return;

        style(element, rules);
    }
    
    config(settings = {}) {
        this.settings = {...this.settings, ...settings};
    }

    #parse() {
        if(typeof this.content !== "string") return Log.error("invalidContentType", typeof this.content);
        return parser(this.content);
    }

    #check(type, param) {
        let result = true;

        switch(type) {
            case "content":
                if(!this.content && !param) {
                    Log.error("noContent");
                    result = false;
                }
                
                if(param) this.content = param;
                
                break;
            case "element":
                if(param === undefined) {
                    Log.error("undefinedParam", "Element");
                    result = false;
                }

                else if(param instanceof HTMLElement === false) {
                    Log.error("invalidElementType", typeof param);
                    result = false;
                }

                break;
            case "rules":
                if(param === undefined) {
                    Log.error("undefinedParam", "Rules");
                    result = false;
                }

                else if(typeof param !== "object") {
                    Log.error("invalidRulesType", typeof param);
                    result = false;
                }

                break;
            default: ;
        }

        return result;
    }
}