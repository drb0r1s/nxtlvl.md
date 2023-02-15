import Log from "./Log.js";
import parser from "./grammar/parser.js";
import Style from "./functions/Style.js";

export default class NXTLVL {
    constructor(content = "", settings) {
        this.content = content;
        
        this.defaultSettings = {
            styleRules: {
                ">": {
                    borderLeft: "3px solid grey",
                    marginLeft: "5px",
                    paddingLeft: "10px"
                }
            }
        };

        this.settings = settings !== undefined ? this.config(settings) : this.defaultSettings;

        this.md = this.md.bind(this);
        this.injectMd = this.injectMd.bind(this);
        this.style = this.style.bind(this);
        this.config = this.config.bind(this);
    }
    
    md(content = "") {
        this.#setDefaultStyleRules();
        
        if(!this.#check("content", content)) return;
        return this.#parse();
    }

    injectMd(element, content = "", rules) {
        this.#setDefaultStyleRules();
        
        if(!this.#check("content", content)) return;
        if(!this.#check("element", element)) return;
        if(rules && !this.#check("rules", rules)) return;
        
        element.innerHTML = this.#parse();

        if(rules) Style.apply(element, rules);
    }

    style(element, rules) {
        if(!this.#check("element", element)) return;
        if(!this.#check("rules", rules)) return;

        Style.apply(element, rules);
    }
    
    config(settings) {
        if(!this.#check("settings", settings)) return this.defaultSettings;

        let newSettings = settings;

        
        this.settings = {...this.settings, ...settings};
    }

    #parse() {
        if(typeof this.content !== "string") return Log.error("INVALID_TYPE.CONTENT", typeof this.content);
        return parser(this.content);
    }

    #setDefaultStyleRules() {
        const existence = document.querySelector("style[id='nxtlvl-md-default-style-rules']") !== null;
        if(existence) return;

        const head = document.querySelector("head");

        const styleElement = document.createElement("style");
        styleElement.setAttribute("id", "nxtlvl-md-default-style-rules");
        styleElement.innerText = Style.convert(this.settings.styleRules);

        head.appendChild(styleElement);
    }

    #check(type, param) {
        let result = true;

        switch(type) {
            case "content":
                if(!this.content && !param) {
                    Log.error("UNDEFINED.CONTENT");
                    result = false;
                }
                
                if(param) this.content = param;
                
                break;
            case "element":
                if(param === undefined) {
                    Log.error("UNDEFINED.PARAM", "Element");
                    result = false;
                }

                else if(Array.isArray(param) || param instanceof NodeList) {
                    const array = param instanceof NodeList ? [...param] : param;

                    if(array.length === 0) {
                        Log.warn("EMPTY.STYLE_ARRAY");
                        result = false;
                    }
                    
                    let onlyElements = true;
                    array.forEach(element => { if(element instanceof HTMLElement === false) onlyElements = false });

                    if(!onlyElements) {
                        Log.error("INVALID_TYPE.ELEMENT", typeof param);
                        result = false;
                    }
                }

                else if(param instanceof HTMLElement === false) {
                    Log.error("INVALID_TYPE.ELEMENT", typeof param);
                    result = false;
                }

                break;
            case "rules":
                if(param === undefined) {
                    Log.error("UNDEFINED.PARAM", "Rules");
                    result = false;
                }

                else if(typeof param !== "object") {
                    Log.error("INVALID_TYPE.RULES", typeof param);
                    result = false;
                }

                break;
            case "settings":
                if(param === undefined) {
                    Log.error("UNDEFINED.PARAM", "Settings object");
                    result = false;
                }

                else if(typeof param !== "object") {
                    Log.error("INVALID_TYPE.SETTINGS", typeof param);
                    result = false;
                }
            
                else if(Object.keys(param).length === 0) {
                    Log.warn("EMPTY.SETTINGS");
                    result = false;
                }
            
                else {
                    const defaultSettings = Object.keys(this.defaultSettings);
                    const newSettings = Object.keys(param);

                    newSettings.forEach(newSetting => {
                        if(defaultSettings.indexOf(newSetting) > -1) return;

                        Log.error("UNKNOWN.SETTING", newSetting);
                        result = false;
                    });
                }
            default: ;
        }

        return result;
    }
}