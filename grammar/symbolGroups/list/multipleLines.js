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
            console.log(newMatches)
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
            let counter = 1;
            let stop = false;

            const olEndings = { positions: [], addingDifference: 0, current: 0 };
            let currentOlEnding = olEndings.positions[olEndings.current];

            const allOlEndings = [...parsedContent.matchAll("</ol>")];
            allOlEndings.forEach(olEnding => olEndings.positions.push(olEnding.index));

            if(olEndings.positions.length === 0) return;
            
            matches.forEach(match => {
                const lines = [...parsedContent.matchAll(match.md)];
                const liList = [];

                for(let i = 0; i < lines.length; i++) {
                    const line = { content: lines[i][0].substring(0, lines[i][0].length - 4), position: lines[i].index };
                    let status = true;

                    for(let i = 0; i < liList.length; i++) if(line.content === liList[i].content) status = false;
                    if(status) liList.push(line)
                }

                liList.forEach(li => {
                    if(stop) return;

                    const br = 4;
                    
                    if(li.position > currentOlEnding) {
                        counter = 1;
                        
                        const nextOlEnding = olEndings.positions[olEndings.current + 1];
                        if(nextOlEnding === undefined) return stop = true;
                        
                        olEndings.current++;
                        currentOlEnding = olEndings.positions[olEndings.current] + addingDifference;
                    }
                    
                    const liTags = generateTags(symbol, { tag: "li", md: counter.toString() });
                    
                    let validContent = `${counter}.`;
                    let dotPassed = false;

                    for(let i = 0; i < li.content.length; i++) {
                        if(li.content[i] === ".") dotPassed = true;
                        else if(dotPassed) validContent += li.content[i];
                    }

                    parsedContent = parsedContent.substring(0, li.position) + `${liTags.opened}${validContent}${liTags.closed}` + parsedContent.substring(li.position + li.content.length + br);
                    
                    counter++;

                    olEndings.addingDifference += liTags.opened.length + liTags.closed.length;
                    currentOlEnding = olEndings.positions[olEndings.current] + olEndings.addingDifference;
                });
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
                if(symbol.tag === "ol" && parsedContent[pairTemplate.start] !== "1") return;
                
                pairs.classic.push(pairTemplate);
                pairTemplate = {};
            }
            
            else if(eol + 1 === nextMatch.position) pairTemplate = {...pairTemplate, end: nextMatch.position + nextMatch.md.length};
        });
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