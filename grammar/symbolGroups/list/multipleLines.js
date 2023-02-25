import Syntax from "../../Syntax.js";
import Log from "../../../Log.js";
import generateTags from "../../../functions/generateTags.js";

export default function multipleLines({ content, symbol, matches, tags }) {
    let parsedContent = content;

    const pairs = { classic: [], special: [], specialSymbols: [] };
    const clearMd = symbol.md.replace(/\\+/g, "");

    let addingDifference = 0;

    if(symbol.md === ">") {
        const { multipleLines: pattern } = Syntax.patterns.get({ group: "multipleLines", md: ">" });
        let i = 0;

        while(getMatches().length > 0) {
            pairs.classic = [];
            pairs.special = [];
            pairs.specialSymbols = [];
            
            const currentMatches = getMatches();

            if(i === 0) {
                checkPairs(currentMatches);
                checkSpecialPairs();

                addPairs();
            }

            else {
                checkPairs(currentMatches);
                addPairs();
            }

            removeMd();
            
            i++;
            addingDifference = 0;
        }

        function getMatches() {
            if(i === 0) return matches;

            const newMatches = Syntax.match(parsedContent, symbol, pattern);
            return newMatches;
        }
    }

    else {
        checkPairs(matches);
        checkSpecialPairs();

        addPairs();

        removeMd();
    }

    if(symbol.md !== ">") unnecessaryBlocksCheck();

    return parsedContent;

    function addPairs() {
        const mergedPairs = [];

        Object.keys(pairs).forEach((key, index) => {
            if(key === "specialSymbols") return;
            
            const value = Object.values(pairs)[index];
            mergedPairs.push(...value);
        });

        let swap;
        
        for(let i = 0; i < mergedPairs.length; i++) for(let j = i + 1; j < mergedPairs.length; j++) if(mergedPairs[i].start > mergedPairs[j].start) {
            swap = mergedPairs[i];
            mergedPairs[i] = mergedPairs[j];
            mergedPairs[j] = swap;
        }

        mergedPairs.forEach(pair => {
            const validMethod = pair.end ? classic : special;
            validMethod(pair);
        });

        if(symbol.tag === "ol") parseList();

        function classic(pair) {
            const realPositions = { start: pair.start + addingDifference, end: pair.end + addingDifference };
            
            let listTags = null;
            if(symbol.tag === "ol") listTags = generateListTags(realPositions.start, realPositions.end);

            const validTags = listTags ? listTags : tags;
            
            parsedContent = parsedContent.substring(0, realPositions.start) + validTags.opened + parsedContent.substring(realPositions.start, realPositions.end) + validTags.closed + parsedContent.substring(realPositions.end);
            addingDifference += validTags.opened.length + validTags.closed.length;
        }

        function special(pair) {
            const tag = pair.type === "opened" ? tags.opened : tags.closed;
            const realPosition = pair.start + addingDifference;

            parsedContent = parsedContent.substring(0, realPosition) + tag + parsedContent.substring(realPosition);
            addingDifference += tag.length;
        }

        function parseList() {
            const ol = { list: [], pairs: [], innerPairs: 0, addingDifference: 0 };

            const allOls = [...parsedContent.matchAll(/^<ol\sclass=".+">|<\/ol>/gm)];
            
            allOls.forEach(olTag => {
                const type = olTag[0][1] === "/" ? "closed" : "opened";
                ol.list.push({ type, position: type === "opened" ? olTag.index + olTag[0].length : olTag.index });
            });

            if(ol.list.length === 0) return;
            
            while(ol.list[0].type === "closed" || ol.list[ol.list.length - 1].type === "opened") {
                if(ol.list[0].type === "closed") ol.list = ol.list.slice(1);
                if(ol.list[ol.list.length - 1] === "opened") ol.list = ol.list.slice(0, ol.list.length - 1);
            }

            const counter = { opened: 0, closed: 0 };

            ol.list.forEach(olTag => {
                if(olTag.type === "opened") counter.opened++;
                else counter.closed++;
            });

            if(counter.opened !== counter.closed) return;
            
            while(ol.list.length !== 0) ol.list.forEach((olTag, index) => {
                const nextOlTag = ol.list[index + 1];

                if(olTag.type === "opened" && nextOlTag.type === "closed") {
                    ol.pairs.push({ start: olTag.position, end: nextOlTag.position });
                    ol.list.splice(index, 2);
                }
            });

            ol.pairs.forEach(pair => {
                const pairContent = parsedContent.substring(pair.start + ol.addingDifference, pair.end + ol.addingDifference);
                const contentLines = pairContent.split("<br>");

                let liContent = "";
                let liOrder = 1;

                contentLines.forEach(line => {
                    if(!line) return;
                    const liTags = generateTags(symbol, { tag: "li", md: liOrder.toString() });
                    
                    let validLine = `${liOrder}.`;
                    let dotStatus = false;

                    for(let i = 0; i < line.length; i++) {
                        if(line[i] === ".") dotStatus = true;
                        else if(dotStatus) validLine += line[i];
                    }
                    
                    liContent += `${liTags.opened}${validLine}${liTags.closed}`;
                    liOrder++;
                });
                
                const realPositions = { start: pair.start + ol.addingDifference, end: pair.end + ol.addingDifference };
                parsedContent = parsedContent.substring(0, realPositions.start) + liContent + parsedContent.substring(realPositions.end);
                
                ol.addingDifference += Math.abs(pairContent.length - liContent.length);
                liOrder++;
            });
        }

        function generateListTags(start, end) {
            const olContent = parsedContent.substring(start, end);
            const numberOfBreaks = olContent.match(/<br>/gm);

            if(numberOfBreaks.length === 0) return null;

            if(numberOfBreaks.length > 1) return generateTags(symbol, { md: `1\-${numberOfBreaks.length}` });
            return generateTags(symbol, { md: "1" });
        }
    }

    function checkPairs(matches) {
        let pairTemplate = {};
        
        matches.forEach((match, index) => {
            if(match.md === `(${clearMd}<br>` || match.md === `${clearMd})<br>`) return pairs.specialSymbols.push({ type: match.md[0] == "(" ? "opened" : "closed", start: match.position });
            
            const eol = match.position + match.md.length;
            const nextMatch = matches[index + 1];
    
            if(Object.keys(pairTemplate).length === 0) pairTemplate = { start: match.position, end: eol };
            
            if(!nextMatch || (eol + 1 !== nextMatch.position)) {
                if(symbol.tag === "ol" && !olValidation(pairTemplate.start)) return pairTemplate = {};
                
                pairs.classic.push(pairTemplate);
                pairTemplate = {};
            }
            
            else if(eol + 1 === nextMatch.position) pairTemplate = {...pairTemplate, end: nextMatch.position + nextMatch.md.length};
        });

        function olValidation(start) {
            let result = true;
            if((parsedContent[start] !== "1") || (parsedContent[start + 1] !== ".")) result = false;

            return result;
        }
    }

    function checkSpecialPairs() {
        if(pairs.specialSymbols.length === 0) return;
        
        const counter = { opened: 0, closed: 0 };
        const cut = { type: "", difference: 0 };

        if(pairs.specialSymbols[0].type === "closed") pairs.specialSymbols = pairs.specialSymbols.slice(1);
        if(pairs.specialSymbols[pairs.specialSymbols.length - 1] === "opened") pairs.specialSymbols = pairs.specialSymbols.slice(0, pairs.specialSymbols.length - 1);

        for(let i = 0; i < pairs.specialSymbols.length; i++) {
            if(pairs.specialSymbols[i].type === "opened") counter.opened++;
            else counter.closed++;
        }

        if(counter.opened !== counter.closed) {
            const larger = counter.opened > counter.closed ? "opened" : "closed";
            cut.type = larger;
        }

        cut.difference = Math.abs(counter.opened - counter.closed);

        for(let i = pairs.specialSymbols.length - 1; i >= 0; i--) {
            if(cut.type === pairs.specialSymbols[i].type && cut.difference > 0) cut.difference--;
            else pairs.special.push(pairs.specialSymbols[i]);
        }

        return pairs.special.reverse();
    }

    function removeMd() {
        const patterns = {
            classicMd: "((?<=<blockquote.+\">)>|^>)(\\s+)?(?!<br>)",
            nxtlvlMd: `(?<=(?<=<${symbol.tag}.+)">)\\(${symbol.md}(\\s+)?<br>|(?<=<\\/${symbol.tag}>)${symbol.md}\\)(\\s+)?<br>`
        };
    
        const remove = {
            classicMd: new RegExp(patterns.classicMd, "gm"),
            nxtlvlMd: new RegExp(patterns.nxtlvlMd, "gm")
        };
    
        parsedContent = parsedContent.replace(remove.classicMd, "");
        parsedContent = parsedContent.replace(remove.nxtlvlMd, "");
    }

    function unnecessaryBlocksCheck() {
        let unnecessaryBlocks = false;

        for(let i = 0; i < pairs.special.length; i++) {
            if(pairs.special[i + 1] && pairs.special[i].type === pairs.special[i + 1].type && !unnecessaryBlocks) unnecessaryBlocks = true;
        }

        if(unnecessaryBlocks) Log.warn("UNNECESSARY.BLOCKS", clearMd);
    }
}