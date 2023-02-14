import Log from "../Log.js";
import Convert from "./Convert.js";

const Style = { apply, convert };
export default Style;

function apply(element, rules) {
    Object.keys(rules).forEach((selector, index) => {
        const parsedSelector = parseSelector(selector);
        if(parsedSelector.length === 0) return Log.error("noStyleSelector");

        const block = Object.values(rules)[index];

        if(typeof block !== "object") return Log.error("invalidStyleBlockType", typeof block);
        if(Object.keys(block).length === 0) return Log.warn("emptyStyleBlock", selector);

        if(Array.isArray(element) || element instanceof NodeList) {
            const array = element instanceof NodeList ? [...element] : element;
            array.forEach(e => setStyleRules(e, parsedSelector, block));
        }

        else setStyleRules(element, parsedSelector, block);
    });

    function setStyleRules(element, parsedSelector, block) {
        const targets = element.querySelectorAll(parsedSelector);

        if(targets.length === 0) Log.warn("noStyleTargets", selector);
        
        targets.forEach(target => Object.keys(block).forEach((property, index) => {
            const value = Object.values(block)[index];
            target.style.setProperty(Convert.camelToKebab(property), value);
        }));
    }
}

function convert(rules) {
    let convertedRules = "";

    Object.keys(rules).forEach((selector, index) => {
        const parsedSelector = parseSelector(selector);
        if(parsedSelector.length === 0) return Log.error("noStyleSelector");

        const block = Object.values(rules)[index];
        
        if(typeof block !== "object") return Log.error("invalidStyleBlockType", typeof block);
        if(Object.keys(block).length === 0) return Log.warn("emptyStyleBlock", selector);

        const parsedBlock = parseBlock(block);

        convertedRules += `${parsedSelector} {${parsedBlock}}`;
    });

    return convertedRules;
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

function parseBlock(block) {
    let parsedBlock = "";

    if(Object.keys(block).length === 0) return parsedBlock;

    Object.keys(block).forEach((property, index) => {
        const value = Object.values(block)[index];
        parsedBlock += `${Convert.camelToKebab(property)}: ${value};`;
    });

    return parsedBlock;
}