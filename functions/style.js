import Log from "../Log.js";
import Convert from "./Convert.js";

export default function style(element, rules) {
    Object.keys(rules).forEach((selector, index) => {
        const block = Object.values(rules)[index];
        const targets = element.querySelectorAll(selector);

        if(targets.length === 0) Log.warn("noStyleTargets", selector);
        
        targets.forEach(target => Object.keys(block).forEach((property, index) => {
            const value = Object.values(block)[index];
            target.style.setProperty(Convert.camelToKebab(property), value);
        }));
    });
}