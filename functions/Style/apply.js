import Convert from "../Convert.js";
import parseSelector from "./parseSelector.js";

export default function apply(element, rules) {
    Object.keys(rules).forEach((selector, index) => {
        const parsedSelector = parseSelector(selector);
        if(parsedSelector.length === 0) return Log.error("UNDEFINED.STYLE_SELECTOR");

        const block = Object.values(rules)[index];

        if(typeof block !== "object") return Log.error("INVALID_TYPE.STYLE_BLOCK", typeof block);
        if(Object.keys(block).length === 0) return Log.warn("EMPTY.STYLE_BLOCK", selector);

        if(Array.isArray(element) || element instanceof NodeList) {
            const array = element instanceof NodeList ? [...element] : element;
            array.forEach(e => setStyleRules(e, selector, parsedSelector, block));
        }

        else setStyleRules(element, selector, parsedSelector, block);
    });

    function setStyleRules(element, selector, parsedSelector, block) {
        const targets = element.querySelectorAll(parsedSelector);

        if(targets.length === 0) Log.warn("UNDEFINED.STYLE_TARGETS", selector);
        
        targets.forEach(target => Object.keys(block).forEach((property, index) => {
            const value = Object.values(block)[index];
            target.style.setProperty(Convert.camelToKebab(property), value);
        }));
    }
}