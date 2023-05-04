import Log from "../../Log.js";
import Convert from "../Convert.js";
import parseSelector from "./parseSelector.js";

export default function apply(element, rules) {
    Object.keys(rules).forEach((selector, index) => {
        console.log(selector)
        const parsedSelector = parseSelector(selector);
        if(parsedSelector.length === 0) return Log.error("UNDEFINED.STYLE_SELECTOR");

        const block = Object.values(rules)[index];

        if(typeof block !== "object" || Array.isArray(block)) return Log.error("INVALID_TYPE.STYLE_BLOCK", Array.isArray(block) ? "array" : typeof block);
        if(Object.keys(block).length === 0) return Log.warn("EMPTY.STYLE_BLOCK", selector);

        if(Array.isArray(element) || element instanceof NodeList) {
            const array = element instanceof NodeList ? [...element] : element;
            array.forEach(e => setStyleRules(e, selector, parsedSelector, block));
        }

        else setStyleRules(element, selector, parsedSelector, block);
    });

    function setStyleRules(element, selector, parsedSelector, block) {
        parsedSelector.forEach(s => {
            const targets = element.querySelectorAll(s);

            if(targets.length === 0) Log.warn("UNDEFINED.STYLE_TARGETS", selector);
            
            targets.forEach(target => Object.keys(block).forEach((property, index) => {
                if(!property) return Log.error("UNDEFINED.STYLE_PROPERTY");
                
                const value = Object.values(block)[index];

                if(typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0) return apply(element, { [property]: value });
                if(typeof value !== "string") return Log.error("INVALID_TYPE.STYLE_PROPERTY_VALUE", typeof value);

                if(!checkCharacters(property, value)) return;
                target.style.setProperty(Convert.camelToKebab(property), value);
            }));

            function checkCharacters(property, value) {
                let status = true;
                const allowedCharacters = { property: /[a-zA-Z-]/g, value: /[a-zA-Z0-9-"()]/g };
                
                for(let i = 0; i < property.length; i++) if(!property[i].match(allowedCharacters.property)) {
                    status = false;
                    Log.error("UNKNOWN.CHARACTER", { character: property[i], location: "rules block property" });
                }

                for(let i = 0; i < value.length; i++) if(!value[i].match(allowedCharacters.value)) {
                    status = false;
                    Log.error("UNKNOWN.CHARACTER", { character: value[i], location: "rules block property value" });
                }

                return status;
            }
        });
    }
}