import Log from "./Log.js";
import parser from "./grammar/parser.js";
import Style from "./functions/Style/index.js";
import defaultStyleRules from "./data/defaultStyleRules.js";

export default class NXTLVL {
    constructor(content = "", settings) {
        this.content = content;
        
        this.defaultSettings = {
            styleRules: defaultStyleRules
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

    render(element, rules) {
        this.#setDefaultStyleRules();

        if(!this.#check("element", element)) return;
        if(rules && !this.#check("rules", rules)) return;

        this.content = element.textContent;
        element.innerHTML = this.#parse();

        this.#scanStyles(element, rules);
    }

    injectMd(element, content = "", rules) {
        this.#setDefaultStyleRules();
        
        if(!this.#check("content", content)) return;
        if(!this.#check("element", element)) return;
        if(rules && !this.#check("rules", rules)) return;
        
        element.innerHTML = this.#parse();
        this.#scanStyles(element, rules);
    }

    style(element, rules) {
        if(!this.#check("element", element)) return;
        if(!this.#check("rules", rules)) return;

        Style.apply(element, rules);
    }
    
    config(settings) {
        if(!this.#check("settings", settings)) return this.defaultSettings;

        let newSettings = {};

        Object.keys(settings).forEach((key, index) => {
            const value = Object.values(settings)[index];

            if(typeof value !== "object") newSettings = {...newSettings, [key]: value};
            else newSettings = {...newSettings, [key]: parseObject(this.settings, key, value)};
        });
        
        this.settings = {...this.settings, ...newSettings};
        return {...this.settings, ...newSettings};

        function parseObject(settings, setting, object, path = "") {
            let parsedObject = object;
            
            const objectKeys = Object.keys(object);

            objectKeys.forEach((key, index) => {
                const value = Object.values(object)[index];
                if(typeof value !== "object") return;

                parsedObject = {...parsedObject, [key]: parseObject(settings, key, value, path ? `${path}.${key}` : `${setting}.${key}`)};
            });

            const inherit = { status: false, index: -1, setting: {} };

            if(objectKeys.indexOf("inherit") > -1) {
                inherit.index = objectKeys.indexOf("inherit");

                const inheritValue = Object.values(object)[inherit.index];

                if(typeof inheritValue !== "boolean") Log.error("INVALID_TYPE.INHERIT", typeof inheritValue);
                else if(inheritValue) inherit.status = true;

                const parsedObjectCopy = parsedObject;
                parsedObject = {};

                Object.keys(parsedObjectCopy).forEach((key, index) => {
                    const value = Object.values(parsedObjectCopy)[index];
                    if(key !== "inherit") parsedObject = {...parsedObject, [key]: value};
                });
            }

            if(!inherit.status) return parsedObject;

            inherit.setting = getSetting();
            parsedObject = {...inherit.setting, ...parsedObject};

            return parsedObject;

            function getSetting() {
                let result = null;
                
                if(path) {
                    let pathValue = settings;
                    const arrayPath = path.split(".");

                    arrayPath.forEach(p => { pathValue = search(pathValue, p) });
                    result = pathValue;
                }

                else result = search(settings, setting);

                return result;

                function search(object, targetKey) {
                    let result = null;

                    Object.keys(object).forEach((key, index) => {
                        if(targetKey === key) result = Object.values(object)[index];
                    });

                    return result;
                }
            }
        }
    }

    #parse() {
        if(typeof this.content !== "string") return Log.error("INVALID_TYPE.CONTENT", typeof this.content);
        return parser(this.content);
    }

    #setDefaultStyleRules() {
        const existence = document.querySelector("style[id='nxtlvl-md-default-style-rules']") !== null;
        const newStyleRules = Style.convert.toString(this.settings.styleRules);

        if(existence) {
            const styleElement = document.querySelector("style[id='nxtlvl-md-default-style-rules']");    
            if(styleElement.innerText !== newStyleRules) styleElement.innerText = newStyleRules;
        }

        else {
            const head = document.querySelector("head");

            const styleElement = document.createElement("style");
            styleElement.setAttribute("id", "nxtlvl-md-default-style-rules");
            styleElement.innerText = newStyleRules;

            head.appendChild(styleElement);
        }
    }

    #scanStyles(element, rules) {
        if(rules) Style.apply(element, rules);
        
        else {
            const dataset = {...element.dataset};
            if(Object.keys(dataset).length === 0) return;

            const { nxtlvlStyle } = dataset;
            if(!nxtlvlStyle) return;

            const datasetRules = Style.convert.toObject(nxtlvlStyle);
            Style.apply(element, datasetRules);
        }
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

                else if(typeof param !== "object" || Array.isArray(param)) {
                    Log.error("INVALID_TYPE.RULES", Array.isArray(param) ? "array" : typeof param);
                    result = false;
                }

                break;
            case "settings":
                if(param === undefined) {
                    Log.error("UNDEFINED.PARAM", "Settings object");
                    result = false;
                }

                else if(typeof param !== "object" || Array.isArray(param)) {
                    Log.error("INVALID_TYPE.SETTINGS", Array.isArray(param) ? "array" : typeof param);
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

    static autoMd() {
        const { injectMd } = new NXTLVL();

        const autoMdElements = {
            class: document.querySelectorAll(".nxtlvl-md"),
            data: document.querySelectorAll("[data-nxtlvl-md='true']")
        };
        
        Object.values(autoMdElements).forEach(elements => elements.forEach(element => {
            const { nxtlvlStyle } = element.dataset;
            if(!nxtlvlStyle) return injectMd(element, element.innerText);

            const rules = Style.convert.toObject(nxtlvlStyle);

            if(!rules) return injectMd(element, element.innerText);
            injectMd(element, element.innerText, rules);
        }));
    }
}

NXTLVL.autoMd();