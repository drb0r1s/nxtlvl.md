import Log from "../Log.js";
import Convert from "./Convert.js";

export default function style(element, rules) {
    Object.keys(rules).forEach((selector, index) => {
        const parsedSelector = parseSelector(selector);
        if(parsedSelector.length === 0) return Log.error("noStyleSelector");

        const block = Object.values(rules)[index];
        const targets = element.querySelectorAll(parsedSelector);

        if(targets.length === 0) Log.warn("noStyleTargets", selector);
        
        targets.forEach(target => Object.keys(block).forEach((property, index) => {
            const value = Object.values(block)[index];
            target.style.setProperty(Convert.camelToKebab(property), value);
        }));
    });
}

function parseSelector(selector) {
    let parsedSelector = selector;

    if(parsedSelector.length === 0) return parsedSelector;
    if(parsedSelector[0] !== "." || (parsedSelector[0] === "." && parsedSelector.length === 1)) parsedSelector = "." + parsedSelector;

    const specialSymbols = /!|@|#|\$|%|\^|&|\*|\(|\)|_|\+|\/|\\|\<|\>|\?|,|(?<=\.)\.(?=\.|$)|;|'|"|\||:|-/gm;
    const matches = [...parsedSelector.matchAll(specialSymbols)];

    matches.forEach(match => {
        parsedSelector = parsedSelector.substring(0, match.index) + "\\" + parsedSelector.substring(match.index);
    });

    return parsedSelector;
}