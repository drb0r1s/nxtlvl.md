import Syntax from "../../Syntax.js";
import generateTags from "../../../functions/generateTags.js";
import escapeRegex from "../../../functions/escapeRegex.js";
import StartSpaces from "../../../functions/StartSpaces.js";

export default function multipleLines({ content, symbol, matches, tags }) {
    let parsedContent = content;

    const pairs = { classic: [], special: [], formatted: [] };
    let specialMd = [];
    
    const mdCombinations = getMdCombinations();
    let addingDifference = 0;

    if(symbol.md === ">") {
        const { multipleLines: pattern } = Syntax.patterns.get({ group: "multipleLines", md: ">" });
        let i = 0;

        while(getMatches().length > 0) {
            pairs.classic = [];
            pairs.special = [];
            pairs.formatted = [];

            specialMd = [];
            
            const currentMatches = getMatches();

            getPairs(currentMatches);
            formatPairs();

            addPairs();

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
        getPairs(matches);
        formatPairs();

        addPairs();

        removeMd();
    }

    function getPairs(matches) {
        let pairTemplate = {};
        const inner = { pairTemplates: [], starts: [] };

        matches.forEach((match, index) => {
            if(specialMdSearch(match)) return;
            classicSearch(match, matches[index + 1]);
        });

        let swap;
        
        for(let i = 0; i < pairs.classic.length; i++) for(let j = i + 1; j < pairs.classic.length; j++) if(pairs.classic[i].start > pairs.classic[j].start) {
            swap = pairs.classic[i];
            pairs.classic[i] = pairs.classic[j];
            pairs.classic[j] = swap;
        }

        if(specialMd.length > 0) mergeSpecialMd();

        function specialMdSearch(match) {
            let result = false;
            const specialStatus = isPairSpecial(match.md);
            
            if(specialStatus) {
                result = true;
                specialMd.push({ type: match.md[0] === "(" ? "opened" : "closed", position: match.position });
            }

            return result;
        }

        function mergeSpecialMd() {
            const counter = { opened: 0, closed: 0 };

            specialMd.forEach(md => {
                if(md.type === "opened") counter.opened++;
                else counter.closed++;
            });

            if(counter.opened !== counter.closed) return;
            
            while(specialMd.length > 0) {
                for(let i = 0; i < specialMd.length; i++) {
                    const current = specialMd[i];
                    const next = specialMd[i + 1];
                    
                    if(current.type === "opened" && next.type === "closed") {
                        pairs.special.push({ start: current.position, end: next.position });
                        specialMd.splice(i, 2);
                    }
                }
            }
        }

        function classicSearch(match, nextMatch) {
            const eol = match.position + match.md.length;
            
            if(Object.keys(pairTemplate).length === 0) pairTemplate = { start: match.position, end: eol };

            if(!nextMatch || (eol + 1 !== nextMatch.position)) {
                pairs.classic.push(pairTemplate);
                if(inner.pairTemplates.length > 0) pairs.classic.push(...inner.pairTemplates);

                pairTemplate = {};
                inner.pairTemplates = [];
            }

            else if(eol + 1 === nextMatch.position) {
                if(parsedContent[nextMatch.position] === " ") formatInnerPairTemplate(nextMatch);

                pairTemplate = {...pairTemplate, end: nextMatch.position + nextMatch.md.length};
            }
        }

        function formatInnerPairTemplate(nextMatch, addNew) {
            if(inner.pairTemplates.length === 0) return inner.pairTemplates.push({ start: nextMatch.position, end: nextMatch.position + nextMatch.md.length });
            if(addNew) inner.pairTemplates.push({ start: nextMatch.position, end: nextMatch.position + nextMatch.md.length });
            
            if(inner.starts.length === 0 || addNew) inner.starts.push(addNew || inner.pairTemplates[inner.pairTemplates.length - 1].start);
            
            const prevLine = StartSpaces.count(parsedContent.substring(inner.pairTemplates[inner.pairTemplates.length - 1].start, inner.pairTemplates[inner.pairTemplates.length - 1].end));
            const line = StartSpaces.count(parsedContent.substring(nextMatch.position, nextMatch.position + nextMatch.md.length));

            if(prevLine === line) inner.starts.forEach(start => updateInnerPairTemplate(start, { end: nextMatch.position + nextMatch.md.length }));
            
            if(prevLine < line) formatInnerPairTemplate(nextMatch, nextMatch.position);

            function updateInnerPairTemplate(start, value) {
                let newInnerPairTemplates = [];

                for(let i = 0; i < inner.pairTemplates.length; i++) {
                    if(start === inner.pairTemplates[i].start) newInnerPairTemplates.push({...inner.pairTemplates[i], ...value});
                    else newInnerPairTemplates.push(inner.pairTemplates[i]);
                }

                inner.pairTemplates = newInnerPairTemplates;
            }
        }
    }

    function addPairs() {
        const listContents = [];
        pairs.formatted.forEach(pair => addPair(pair));

        if(symbol.tag === "ol" || symbol.tag === "ul") parseList();

        function addPair(pair) {
            const { realPositions, validTags, innerContent, specialStatus } = parsePair(pair);

            if(symbol.tag === "ol" || symbol.tag === "ul") {
                const tagsMd = specialStatus ? specialStatus: getClassicMd(innerContent);
                
                let exists = false;

                listContents.forEach(listContent => {
                    if(listContent.content === innerContent && listContent.md === tagsMd) exists = true;
                });
                
                if(!exists) listContents.push({ content: innerContent, md: tagsMd, isSpecial: specialStatus });
            }

            parsedContent = parsedContent.substring(0, realPositions.start) + validTags.opened + innerContent + parsedContent.substring(realPositions.end);
            addingDifference += validTags.opened.length;

            if(pair.inner) pair.inner.forEach(innerPair => addPair(innerPair));

            parsedContent = parsedContent.substring(0, pair.end + addingDifference) + validTags.closed + parsedContent.substring(pair.end + addingDifference);
            addingDifference += validTags.closed.length;
        }
        
        function parsePair(pair) {
            const specialStatus = isPairSpecial(parsedContent.substring(pair.start + addingDifference));
            const skipSpecialMd = getSpecialMdLength();
            
            const innerContent = parsedContent.substring(pair.start + addingDifference + skipSpecialMd, pair.end + addingDifference);

            const realPositions = { start: pair.start + addingDifference + skipSpecialMd, end: pair.end + addingDifference };
            const validTags = getValidTags(innerContent, specialStatus);

            return { realPositions, validTags, innerContent, specialStatus };

            function getSpecialMdLength() {
                if(!specialStatus) return 0;

                const elements = {
                    start: "(",
                    md: specialStatus,
                    additional: !isNaN(parseInt(specialStatus)) ? "." : "",
                    break: "<br>"
                };

                let length = 0;
                Object.values(elements).forEach(element => { length += element.length });

                return length;
            }
        }

        function parseList() {
            listContents.forEach(liContent => {
                if(liContent.isSpecial) {
                    let boundaries = [];
                    const specialSymbol = !isNaN(parseInt(liContent.isSpecial)) ? `${liContent.isSpecial}.` : liContent.isSpecial;

                    const innerSymbolsSearch = [...liContent.content.matchAll(`${escapeRegex("(" + specialSymbol)}<br>|${escapeRegex(specialSymbol + ")")}<br>`)];
                    let i = 0;
                    
                    while(innerSymbolsSearch.length !== 0) {
                        if(i === innerSymbolsSearch.length - 1) return i = 0;

                        const current = { content: innerSymbolsSearch[i][0], index: innerSymbolsSearch[i].index };
                        const next = { content: innerSymbolsSearch[i + 1][0], index: innerSymbolsSearch[i + 1].index };

                        if(checkSymbolType(current.content) === "opened" && checkSymbolType(next.content) === "closed") {
                            boundaries.push({ start: current.index, end: next.content.length + next.index  });
                            innerSymbolsSearch.splice(i, 2);
                            
                            i = 0;
                        }
                        
                        else i++;
                    }

                    let swap;
                    
                    for(let i = 0; i < boundaries.length; i++) for(let j = i + 1; j < boundaries.length; j++) if(boundaries[i].start > boundaries[j].start) {
                        swap = boundaries[i];
                        boundaries[i] = boundaries[j];
                        boundaries[j] = swap;
                    }

                    if(boundaries.length > 0) {
                        const blockedBoundaries = [];
                        let targetEnd = -1;

                        for(let i = 0; i < boundaries.length; i++) {
                            if(targetEnd > boundaries[i].start) blockedBoundaries.push(boundaries[i]);
                            else targetEnd = boundaries[i].end;
                        }

                        const topBoundaries = [];

                        for(let i = 0; i < boundaries.length; i++) {
                            let status = true;
                            
                            blockedBoundaries.forEach(blockedBoundary => {
                                if(boundaries[i].start === blockedBoundary.start && boundaries[i].end === blockedBoundary.end) status = false;
                            });

                            if(status) topBoundaries.push(boundaries[i]);
                        }

                        boundaries = topBoundaries;
                    }

                    let removingDifference = 0;

                    boundaries.forEach(boundary => {
                        const realPositions = { start: boundary.start - removingDifference, end: boundary.end - removingDifference };
                        
                        liContent.content = liContent.content.substring(0, realPositions.start) + liContent.content.substring(realPositions.end);
                        removingDifference += boundary.end - boundary.start;
                    });

                    const regex = /(?<!<br>)\n/;
                    liContent.content = liContent.content.replace(regex, "");

                    let newLiContent = "";
                    const topLiContent = [];

                    const lines = liContent.content.split("\n");

                    lines.forEach((line, index) => {
                        if(line) {
                            newLiContent += line + "\n";

                            if(index === lines.length - 1) {
                                topLiContent.push(newLiContent);
                                newLiContent = "";
                            }
                        }

                        else if(newLiContent) {
                            topLiContent.push(newLiContent);
                            newLiContent = "";
                        }
                    });

                    addLi(topLiContent);

                    function checkSymbolType(symbol) {
                        if(symbol[0] === "(") return "opened";
                        return "closed";
                    }
                }
                
                else {
                    let newLiContent = "";
                    const topLiContent = [];
                    
                    const lines = liContent.content.split("\n");
                    const requiredSpaces = StartSpaces.count(lines[0]);

                    lines.forEach((line, index) => {
                        if(requiredSpaces === StartSpaces.count(line)) {
                            newLiContent += line + "\n";

                            if(index === lines.length - 1) {
                                topLiContent.push(newLiContent.substring(0, newLiContent.length - 1));
                                newLiContent = "";
                            }
                        }
                        
                        else if(newLiContent) {
                            topLiContent.push(newLiContent.substring(0, newLiContent.length - 1));
                            newLiContent = "";
                        }
                    });

                    addLi(topLiContent);
                }
                
                function addLi(rows) {
                    let parsedLiContent = "";
                    let lineCounter = symbol.tag === "ol" ? parseInt(liContent.md) : 0;
                    
                    rows.forEach(row => {
                        const lines = row.split("\n");

                        lines.forEach(line => {
                            if(!line) return;
                        
                            const tagsMd = symbol.tag === "ol" ? lineCounter : liContent.md;
                            const liTags = generateTags(symbol, { tag: "li", md: tagsMd });
        
                            parsedLiContent += `${liTags.opened}${removeListMd(StartSpaces.cut(line), liContent.isSpecial)}${liTags.closed}`;
                            lineCounter++;
                        });

                        const liMatches = [...parsedContent.matchAll(escapeRegex(row))];
                        let liAddingDifference = 0;
        
                        liMatches.forEach(liMatch => {
                            const positions = { start: liMatch.index + liAddingDifference, end: liMatch[0].length + liMatch.index + liAddingDifference };
                            parsedContent = parsedContent.substring(0, positions.start) + parsedLiContent + parsedContent.substring(positions.end);
                            
                            const difference = Math.abs(row.length - parsedLiContent.length);
                            liAddingDifference += difference;

                            parsedLiContent = "";
                        });
                    });
                }
            });

            function removeListMd(content, isSpecial) {
                let newContent = "";
    
                let ignore = !isSpecial;
                let cancelIgnore = false;
    
                const cancelTarget = symbol.tag === "ol" ? "." : " ";
    
                for(let i = 0; i < content.length; i++) {
                    if(!ignore) newContent += content[i];
                    
                    else if(ignore && content[i] === cancelTarget) cancelIgnore = true;
                    
                    else if(cancelIgnore && content[i] !== " ") {
                        ignore = false;
                        newContent += content[i];
                    }
                }
    
                return newContent;
            }
        }

        function getValidTags(innerContent, specialStatus) {
            if(symbol.tag !== "ol" &&  symbol.tag !== "ul") return tags;

            let tagsMd = specialStatus ? specialStatus : getClassicMd(innerContent);
            const startValue = !isNaN(parseInt(tagsMd)) ? { start: tagsMd } : {};

            if(!isNaN(parseInt(tagsMd))) {
                const lines = innerContent.split("\n");

                let counter = parseInt(tagsMd);
                for(let i = 0; i < lines.length; i++) if(lines[i]) counter++;

                if(parseInt(tagsMd) !== counter - 1) tagsMd = `${tagsMd}-${counter - 1}`;
            }

            const listTags = generateTags(symbol, { md: tagsMd }, startValue);
            return listTags;
        }

        function getClassicMd(innerContent) {
            const noSpacesContent = StartSpaces.cut(innerContent);

            if(isNaN(parseInt(noSpacesContent[0]))) return noSpacesContent[0];

            let number = "";
            let i = 0;

            while(!isNaN(parseInt(noSpacesContent[i]))) {
                number += noSpacesContent[i];
                i++;
            }

            return number;
        }
    }

    function formatPairs() {
        pairs.formatted = [...pairs.classic, ...pairs.special];
        let swap;

        for(let i = 0; i < pairs.formatted.length; i++) for(let j = i + 1; j < pairs.formatted.length; j++) if(pairs.formatted[i].start > pairs.formatted[j].start) {
            swap = pairs.formatted[i];
            pairs.formatted[i] = pairs.formatted[j];
            pairs.formatted[j] = swap;
        }

        const innerFormatted = [];
        const blocked = [];

        pairs.formatted.forEach((pair, index) => {
            if(checkBlocked(pair)) return;
            innerFormatted.push({...pair, ...checkInnerPairs(index)});
        });

        pairs.formatted = innerFormatted;

        function checkInnerPairs(index) {
            let nested = { inner: [] };
            
            const currentPair = pairs.formatted[index];
            let check = 1;

            while(check !== 0) {
                const nextPair = pairs.formatted[index + check];

                if(nextPair && (currentPair.end > nextPair.start)) {
                    if(!checkBlocked(nextPair)) nested.inner.push({...nextPair, ...checkInnerPairs(index + check)});
                    check++;
                }

                else check = 0;
            }

            blocked.push(...nested.inner);
            
            if(nested.inner.length === 0) return {};
            return nested;
        }

        function checkBlocked(pair) {
            let result = false;
            
            blocked.forEach(block => {
                if(pair.start === block.start && pair.end === block.end) result = true;
            });

            return result;
        }
    }

    function isPairSpecial(content) {
        let result = false;
        
        mdCombinations.forEach(combination => {
            if(combination === "number") {                
                let i = content[0] === "(" ? 1 : 0;
                let number = "";
                
                while(!isNaN(parseInt(content[i]))) {
                    number += content[i];
                    i++;
                }

                if(content.startsWith(`(${number}.<br>`) || content.startsWith(`${number}.)<br>`)) result = number;
            }
            
            else if(content.startsWith(`(${combination}<br>`) || content.startsWith(`${combination})<br>`)) result = combination;
        });

        return result;
    }

    function getMdCombinations() {
        let result = [];
        
        switch(symbol.tag) {
            case "ol": 
                result.push("number");
                break;
            case "ul":
                result.push("*", "+", "-");
                break;
            default: result.push(symbol.md.replace(/\\+/g, ""));
        }

        return result;
    }

    function removeMd() {
        const patterns = {
            classicMd: "((?<=<blockquote.+\">)>|^>)(\\s+)?(?!<br>)",
            nxtlvlMd: `\\(${symbol.md}(\\s+)?<br>(?=<${symbol.tag}.+">)|(?<=<\\/${symbol.tag}>)${symbol.md}\\)(\\s+)?<br>`
        };
    
        const remove = {
            classicMd: new RegExp(patterns.classicMd, "gm"),
            nxtlvlMd: new RegExp(patterns.nxtlvlMd, "gm")
        };
    
        parsedContent = parsedContent.replace(remove.classicMd, "");
        parsedContent = parsedContent.replace(remove.nxtlvlMd, "");
    }

    return parsedContent;
}