import Log from "../Log.js";
import Convert from "./Convert.js";

const convert = { toString, toObject };
const Style = { apply, convert };
export default Style;

function apply(element, rules) {
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

function toString(rules) {
    let convertedRules = "";

    Object.keys(rules).forEach((selector, index) => {
        const parsedSelector = parseSelector(selector);
        if(parsedSelector.length === 0) return Log.error("UNDEFINED.STYLE_SELECTOR");

        const block = Object.values(rules)[index];
        
        if(typeof block !== "object") return Log.error("INVALID_TYPE.STYLE_BLOCK", typeof block);
        if(Object.keys(block).length === 0) return Log.warn("EMPTY.STYLE_BLOCK", selector);

        const parsedBlock = parseBlock(block);

        convertedRules += `${parsedSelector} {${parsedBlock}}`;
    });

    return convertedRules;
}

function toObject(rules) {
    if(!rules) return Log.error("UNDEFINED.RULES");

    try {
        let objectRules = {};
        const noBlankRules = rules.replaceAll(/[\s\n]+/gm, "");

        let rulesMap = [];
        const openedBlocks = [...noBlankRules.matchAll("{")];

        openedBlocks.forEach(openedBlock => {
            const ruleMapTemplate = {
                positions: { start: openedBlock.index, end: getClosedBlockIndex(openedBlock.index) },
                selectors: [getSelector(openedBlock.index)]
            };

            rulesMap.push(ruleMapTemplate);
        });

        const innerOpenedBlocks = [];

        const inner = { status: true, blocks: [] };
        let i = 0;

        while(inner.status) {
            const prev = rulesMap[i - 1];
            const current = rulesMap[i];
            
            if(prev && (prev.positions.end > current.positions.start)) inner.blocks.push({
                ...current,
                selectors: [...prev.selectors, ...current.selectors]
            });

            if(i === rulesMap.length - 1) {
                if(inner.blocks.length === 0) inner.status = false;
                
                else {
                    removeInnerBlocks();
                    innerOpenedBlocks.push(...inner.blocks);

                    inner.blocks = [];
                    i = 0;
                }
            }
            
            else i++;
        }

        rulesMap.push(...innerOpenedBlocks);
        
        let swap;
        
        for(let i = 0; i < rulesMap.length; i++) for(let j = i + 1; j < rulesMap.length; j++) if(rulesMap[i].positions.start > rulesMap[j].positions.start) {
            swap = rulesMap[i];
            rulesMap[i] = rulesMap[j];
            rulesMap[j] = swap;
        }

        rulesMap.forEach(ruleMap => {
            let props = {};
            
            const ruleMapContent = noBlankRules.substring(ruleMap.positions.start + 1, ruleMap.positions.end);
            const lines = ruleMapContent.split(";");
            
            lines.forEach(line => {
                if(!line) return;

                let [prop, value] = line.split(":");
                prop = prop.replaceAll("}", "");
                console.log(prop)
                
                if(!prop || prop.indexOf("{") > -1) return;
                props = {...props, [Convert.kebabToCamel(prop)]: value};
            });

            ruleMap.props = props;
        });
        
        rulesMap.forEach(ruleMap => {
            let fullSelector = ruleMap.selectors.join(" ");
            objectRules = {...objectRules, [fullSelector]: ruleMap.props};
        });

        return objectRules;

        function getSelector(openedBlockIndex) {
            let selector = "";
            let selectorSearcher = openedBlockIndex - 1;

            const selectorEnd = ["{", "}", ";", undefined];

            while(selectorEnd.indexOf(noBlankRules[selectorSearcher]) === -1) {
                selector += noBlankRules[selectorSearcher];
                selectorSearcher--;
            }
            
            selector = Convert.reverse(selector);
            return selector;
        }
        
        function getClosedBlockIndex(openedBlockIndex) {
            let result = -1;
            let skip = 0;
            
            for(let i = openedBlockIndex + 1; i < noBlankRules.length; i++) if(result === -1) {
                if(noBlankRules[i] === "{") skip++;
                
                if(noBlankRules[i] === "}") {
                    if(!skip) result = i;
                    else skip--;
                }
            }

            return result;
        }

        function removeInnerBlocks() {
            let newRulesMap = [];

            for(let i = 0; i < rulesMap.length; i++) {
                let status = true;
                for(let j = 0; j < inner.blocks.length; j++) if(rulesMap[i].positions.start === inner.blocks[j].positions.start && rulesMap[i].positions.end === inner.blocks[j].positions.end) status = false;

                if(status) newRulesMap.push(rulesMap[i]);
            }

            rulesMap = newRulesMap;
        }
    }

    catch(e) { Log.error("UNKNOWN.STYLE_SYNTAX") }
}

function parseSelector(selector) {
    let parsedSelector = selector;

    if(parsedSelector.length === 0) return parsedSelector;
    if(parsedSelector[0] !== "." || (parsedSelector[0] === "." && parsedSelector.length === 1)) parsedSelector = "." + parsedSelector;

    const multipleSelectors = parsedSelector.split(" ");
    const parsedMultipleSelectors = [];

    if(multipleSelectors.length > 1) multipleSelectors.forEach(multipleSelector => {
        if(!multipleSelector) return;

        if(multipleSelector[0] !== "." || (multipleSelector[0] === "." && multipleSelector.length === 1)) parsedMultipleSelectors.push("." + multipleSelector);
        else parsedMultipleSelectors.push(multipleSelector);
    });

    if(parsedMultipleSelectors.legth > 0) parsedSelector = parsedMultipleSelectors.join(" ");

    const specialSymbols = /!|@|#|\$|%|\^|&|\*|\(|\)|_|\+|\/|\\|\<|\>|\?|,|(?<=\.)\.(?=\.|$)|;|'|"|\||:|-/gm;
    const matches = [...parsedSelector.matchAll(specialSymbols)];

    let addingDifference = 0;

    matches.forEach(match => {
        const realPosition = match.index + addingDifference;
        parsedSelector = parsedSelector.substring(0, realPosition) + "\\" + parsedSelector.substring(realPosition);

        addingDifference += "\\".length;
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