import Log from "../../Log.js";
import Convert from "../Convert.js";
import parseSelector from "./parseSelector.js";

export default function toString(rules) {
    let convertedRules = "";

    Object.keys(rules).forEach((selector, index) => {
        const parsedSelector = parseSelector(selector);
        if(parsedSelector.length === 0) return Log.error("UNDEFINED.STYLE_SELECTOR");

        const block = Object.values(rules)[index];
        
        if(typeof block !== "object" || Array.isArray(block)) return Log.error("INVALID_TYPE.STYLE_BLOCK", Array.isArray(block) ? "array" : typeof block);
        if(Object.keys(block).length === 0) return Log.warn("EMPTY.STYLE_BLOCK", selector);

        const [parsedBlock, innerBlocks] = parseBlock(selector, block);

        parsedSelector.forEach(s => convertedRules += `${s} {${parsedBlock}}`);
        innerBlocks.forEach(innerBlock => { convertedRules += innerBlock });
    });

    return convertedRules;
}

function parseBlock(selector, block) {
    let parsedBlock = "";
    const innerBlocks = [];

    if(Object.keys(block).length === 0) return parsedBlock;

    Object.keys(block).forEach((property, index) => {
        const value = Object.values(block)[index];
        
        if(typeof value === "object") {
            const multipleSelectors = property.split(", ");
            multipleSelectors.forEach(multipleSelector => innerBlocks.push(toString({ [`${selector} ${multipleSelector}`]: value })));
        }
        
        else parsedBlock += `${Convert.camelToKebab(property)}: ${value};`;
    });

    return [parsedBlock, innerBlocks];
}