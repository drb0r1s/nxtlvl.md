import Log from "./Log.js";
import parser from "./grammar/parser.js";

export default class NXTLVL {
    constructor(content = "", settings = {}) {
        this.content = content;
        
        this.defaultSettings = {};
        this.settings = {...this.defaultSettings, ...settings};

        this.md = this.md.bind(this);
        this.config = this.config.bind(this);
    }
    
    md(content = "") {
        if(!this.#contentCheck(content)) return;

        return this.#parse();
    }

    injectMd(element, content = "") {
        if(!this.#contentCheck(content)) return;

        if(element === undefined) return Log.error("undefinedParam", "Element");
        if(element instanceof HTMLElement === false) return Log.error("invalidElementType", typeof element);

        element.innerHTML = this.#parse();
    }

    style() {
        
    }
    
    config(settings = {}) {
        this.settings = {...this.settings, ...settings};
    }

    #parse() {
        if(typeof this.content !== "string") return Log.error("invalidContentType", typeof this.content);
        return parser(this.content);
    }

    #contentCheck(content) {
        let result = true;
        
        if(!this.content && !content) {
            Log.error("noContent");
            result = false;
        }
        
        if(content) this.content = content;

        return result;
    }
}