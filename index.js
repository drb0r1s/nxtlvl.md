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
        if(!this.content && !content) return Log.warn("noContent");
        if(content) this.content = content;

        return this.#parse();
    }

    injectMd() {
        
    }

    style() {
        
    }

    #parse() {
        if(typeof this.content !== "string") return Log.error("invalidContentType", typeof this.content);
        return parser(this.content);
    }
    
    config(settings = {}) {
        this.settings = {...this.settings, ...settings};
    }
}