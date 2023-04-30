import Log from "../../Log.js";
import Convert from "../Convert.js";

export default function toObject(rules) {
    if(!rules) return Log.error("UNDEFINED.RULES");

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

    if(rulesMap.length === 0) return Log.error("UNKNOWN.STYLE_SYNTAX");

    const innerOpenedBlocks = [];

    const inner = { status: true, blocks: [] };
    let i = 0;
    
    while(inner.status) {
        const prev = rulesMap[i - 1];
        const current = rulesMap[i];
        
        if(prev && (prev.positions.end > current.positions.start)) {
            const parentSelectors = [];
            for(let j = 0; j < i; j++) if(rulesMap[j].positions.end > current.positions.start) parentSelectors.push(...rulesMap[j].selectors);
            
            inner.blocks.push({
                ...current,
                selectors: [...parentSelectors, ...current.selectors]
            });
        }

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
        
        let ruleMapContent = noBlankRules.substring(ruleMap.positions.start + 1, ruleMap.positions.end);
        const innerBlocksPositions = getInnerBlocksPositions(ruleMapContent);

        let removingDifference = 0;
        
        innerBlocksPositions.forEach(innerBlockPosition => {
            const selector = getSelector(innerBlockPosition.start + ruleMap.positions.start + 1);
            const realPositions = { start: innerBlockPosition.start - selector.length - removingDifference, end: innerBlockPosition.end + 1 - removingDifference };
            const removedString = ruleMapContent.substring(realPositions.start, realPositions.end);
            
            ruleMapContent = ruleMapContent.substring(0, realPositions.start) + ruleMapContent.substring(realPositions.end);
            removingDifference += removedString.length;
        });

        const lines = ruleMapContent.split(";");

        lines.forEach(line => {
            if(!line) return;

            const [prop, value] = line.split(":");
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

    function getInnerBlocksPositions(content) {
        const innerBlockPairs = [];
        let innerBlockPairTemplate = { start: -1, end: -1 };
        
        const innerBlocksRegex = /[{}]/gm
        const innerBlocks = [...content.matchAll(innerBlocksRegex)];

        let skip = 0;
        
        innerBlocks.forEach(innerBlock => {
            if(!skip && (innerBlockPairTemplate.start === -1) && (innerBlock[0] === "{")) return innerBlockPairTemplate.start = innerBlock.index;
            
            if((innerBlockPairTemplate.start > -1) && (innerBlock[0] === "{")) skip++;
            
            if(!skip && (innerBlockPairTemplate.end === -1) && (innerBlock[0] === "}")) {
                innerBlockPairTemplate.end = innerBlock.index;
                innerBlockPairs.push(innerBlockPairTemplate);

                innerBlockPairTemplate = { start: -1, end: -1 };
            }

            if(skip && (innerBlockPairTemplate.start > -1) && (innerBlock[0] === "}")) skip--;
        });

        return innerBlockPairs;
    }
}