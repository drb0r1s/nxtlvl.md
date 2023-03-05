import Syntax from "../../Syntax.js";
import Log from "../../../Log.js";
import generateTags from "../../../functions/generateTags.js";

export default function multipleLines({ content, symbol, matches, tags }) {
    let parsedContent = content;

    const pairs = { classic: [], special: [], specialSymbols: [] };
    const clearMd = getClearMd();

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

        if(symbol.tag === "ol" || symbol.tag === "ul") parseList();

        function classic(pair) {
            const realPositions = { start: pair.start + addingDifference, end: pair.end + addingDifference };
            
            let listTags = generateListTags(realPositions.start, realPositions.end);
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
            const list = { matches: [], pairs: [], innerPairs: 0, addingDifference: 0 };

            const listTagsRegex = new RegExp(`^<${symbol.tag}\\sclass=".+">|<\\/${symbol.tag}>`, "gm");
            const listTags = [...parsedContent.matchAll(listTagsRegex)];
            
            listTags.forEach(listTag => {
                const type = listTag[0][1] === "/" ? "closed" : "opened";
                list.matches.push({ type, position: type === "opened" ? listTag.index + listTag[0].length : listTag.index });
            });

            if(list.matches.length === 0) return;
            
            while(list.matches[0].type === "closed" || list.matches[list.matches.length - 1].type === "opened") {
                if(list.matches[0].type === "closed") list.matches = list.matches.slice(1);
                if(list.matches[list.matches.length - 1].type === "opened") list.matches = list.matches.slice(0, list.matches.length - 1);
            }

            const counter = { opened: 0, closed: 0 };

            list.matches.forEach(match => {
                if(match.type === "opened") counter.opened++;
                else counter.closed++;
            });

            if(counter.opened !== counter.closed) return;
            
            while(list.matches.length !== 0) list.matches.forEach((match, index) => {
                const nextMatch = list.matches[index + 1];

                if(match.type === "opened" && nextMatch.type === "closed") {
                    list.pairs.push({ start: match.position, end: nextMatch.position });
                    list.matches.splice(index, 2);
                }
            });

            let swap;
            
            for(let i = 0; i < list.pairs.length; i++) for(let j = i + 1; j < list.pairs.length; j++) if(list.pairs[i].start > list.pairs[j].start) {
                swap = list.pairs[i];
                list.pairs[i] = list.pairs[j];
                list.pairs[j] = swap;
            }

            list.pairs.forEach(pair => {
                const pairContent = parsedContent.substring(pair.start + list.addingDifference, pair.end + list.addingDifference);
                const isSpecialPair = pairContent.startsWith(`(${clearMd}<br>`);
                
                const contentLines = pairContent.split("<br>");
                if(isSpecialPair) contentLines.shift();

                for(let i = 0; i < contentLines.length; i++) contentLines[i] = contentLines[i].replaceAll("\n", "");

                let liContent = "";
                let liOrder = 1;

                contentLines.forEach(line => {
                    if(!line) return;
                    
                    const tagsMd = isSpecialPair ? clearMd : line[0];
                    const liTags = generateTags(symbol, { tag: "li", md: symbol.tag === "ol" ? liOrder.toString() : tagsMd });
                    
                    let validLine = "";
                    if(symbol.tag === "ul") validLine = line.substring(isSpecialPair ? 0 : 2);
                    
                    let dotStatus = false;

                    if(symbol.tag === "ol") for(let i = 0; i < line.length; i++) {
                        if(line[i] === ".") dotStatus = true;
                        else if(dotStatus) validLine += line[i];
                    }
                    
                    liContent += `${liTags.opened}${validLine}${liTags.closed}`;
                    liOrder++;
                });
                
                const realPositions = { start: pair.start + list.addingDifference, end: pair.end + list.addingDifference };
                parsedContent = parsedContent.substring(0, realPositions.start) + liContent + parsedContent.substring(realPositions.end);
                
                list.addingDifference += Math.abs(pairContent.length - liContent.length);
                liOrder++;
            });
        }

        function generateListTags(start, end) {
            const listContent = parsedContent.substring(start, end);
            const isSpecialPair = listContent.startsWith(`(${clearMd}<br>`);
            
            if(symbol.tag === "ol") {
                const numberOfBreaks = listContent.match(/<br>/gm);

                if(numberOfBreaks.length === 0) return null;

                if(numberOfBreaks.length > 1) return generateTags(symbol, { md: `1\-${numberOfBreaks.length}` });
                return generateTags(symbol, { md: "1" });
            }

            else if(symbol.tag === "ul") return generateTags(symbol, { md: isSpecialPair ? clearMd : listContent[0] });

            return null;
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

    function getClearMd() {
        switch(symbol.tag) {
            case "ol": return "1.";
            case "ul": return "+";

            default: return symbol.md.replace(/\\+/g, "");
        }
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