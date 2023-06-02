import Log from "../../../Log.js";
import Syntax from "../../Syntax.js";
import Match from "../../../functions/Match.js";
import Escape from "../../../functions/Escape.js";
import generateTags from "../../../functions/generateTags.js";
import isLineEmpty from "../../../functions/isLineEmpty.js";
import StartSpaces from "../../../functions/StartSpaces.js";

export default function multipleLines({ content, symbol, matches, tags }) {
    let parsedContent = content;

    const pairs = { classic: [], special: [], formatted: [] };
    let specialMd = [];
    
    const mdCombinations = getMdCombinations();
    let addingDifference = 0;

    if(symbol.tag === "blockquote" || symbol.tag === "details") {
        const { multipleLines } = Syntax.patterns.get({ group: "multipleLines", md: symbol.md });
        const [pattern] = multipleLines;

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

        removeMd(true);

        function getMatches() {
            if(i === 0) return matches;
            
            const noSpecialMdPattern = pattern.split("|^\\(");
            const newMatches = Syntax.match(parsedContent, symbol, noSpecialMdPattern[0]);

            return newMatches;
        }
    }

    else {
        getPairs(matches);
        formatPairs();

        addPairs();

        removeMd(true);
    }

    function getPairs(matches) {
        let pairTemplate = {};
        const inner = { pairTemplates: [], starts: [] };
        const unparsedClassicPairs = [];

        matches.forEach((match, index) => {
            if(specialMdSearch(match)) return;
            classicSearch(match, matches[index + 1]);
        });

        checkUnparsedClassicPairs();

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
                specialMd.push({ type: match.md[0] === "(" ? "opened" : "closed", position: match.positions.start });
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

            checkEmptyPairs();
            
            function checkEmptyPairs() {
                if(symbol.tag !== "blockquote" && symbol.tag !== "details") {
                    const replacePairsClassic = [];
                    
                    pairs.classic.forEach(pair => {
                        const pairContent = parsedContent.substring(pair.start, pair.end);

                        const lines = pairContent.split("\n");

                        if(!lines[0]) lines.shift();
                        if(!lines[lines.length - 1]) lines.pop();

                        let emptyStatus = false;
                        
                        const newPairs = [];
                        let pairTemplate = "";
                        let splitPair = false;

                        const getNoMdLine = line => line.replace(new RegExp(symbol.md), "");

                        lines.forEach((line, index) => { 
                            if(!line) return;

                            const lineEmptyStatus = isLineEmpty(getNoMdLine(line));

                            if((!splitPair && lineEmptyStatus)) {
                                emptyStatus = true;
                                splitPair = true;

                                if(pairTemplate) newPairs.push(pairTemplate);
                                pairTemplate = "";
                            }

                            if(splitPair && !lineEmptyStatus) splitPair = false;
                            
                            if(!splitPair) pairTemplate += line + (index === lines.length - 1 ? "" : "\n");
                            if(emptyStatus && (index === lines.length - 1) && pairTemplate) newPairs.push(pairTemplate);
                        });

                        if(!emptyStatus) return;

                        const replaceWith = [];
                        
                        newPairs.forEach(newPair => {
                            const closestPairMatch = Match.closest(parsedContent, newPair, pair.start);
                            replaceWith.push(closestPairMatch.positions);
                        });

                        replacePairsClassic.push({ replace: pair, replaceWith });
                    });

                    if(replacePairsClassic.length > 0) {
                        const newPairsClassic = [];
                        
                        pairs.classic.forEach(pair => {
                            let status = true;
                            replacePairsClassic.forEach(p => { if(pair.start === p.replace.start && pair.end === p.replace.end) status = false });

                            if(status) newPairsClassic.push(pair);
                        });

                        replacePairsClassic.forEach(p => newPairsClassic.push(...p.replaceWith));

                        let swap;

                        for(let i = 0; i < newPairsClassic.length; i++) for(let j = i + 1; j < newPairsClassic.length; j++) if(newPairsClassic[i].start > newPairsClassic[j].start) {
                            swap = newPairsClassic[i];
                            newPairsClassic[i] = newPairsClassic[j];
                            newPairsClassic[j] = swap;
                        }

                        pairs.classic = newPairsClassic;
                    }
                }
                
                pairs.special.forEach(pair => {
                    const pairContent = parsedContent.substring(pair.start, pair.end);
                    
                    const lines = pairContent.split("\n");
                    lines.shift();

                    const fix = [
                        "\\((>|\\s*[0-9]+\\.(\\s|(?=\\)?<br>))|\\s*[*+-])\\s*<br>(?=<(blockquote|ol|ul).+\">)?|(?<=(<\\/(blockquote|ol|ul)>|^))(>|\\s*[0-9]+\\.(\\s|(?=\\)?<br>))|\\s*[*+-])\\)\\s*<br>",
                        "<br>"
                    ];

                    let status = false;

                    lines.forEach(line => {
                        let fixedLine = line;
                        
                        fix.forEach(f => {
                            const regex = new RegExp(f, "gm");
                            fixedLine = fixedLine.replace(regex, "");
                        });

                        for(let i = 0; i < fixedLine.length; i++) if(fixedLine[i] !== " ") status = true;
                    });

                    if(!status) {
                        const newPairsSpecial = [];

                        pairs.special.forEach(p => {
                            if(pair.start === p.start && pair.end === p.end) return;
                            newPairsSpecial.push(p);
                        });

                        pairs.special = newPairsSpecial;
                        
                        const specialStatus = isPairSpecial(pairContent.split("\n")[0]);
                        Log.warn("EMPTY.SPECIAL_BLOCK", !isNaN(specialStatus) ? `${specialStatus}.` : specialStatus);
                    }
                });
            }
        }

        function classicSearch(match, nextMatch) {
            const eol = match.positions.end;
            const allowedEmptyContent = checkAllowedEmptyContent(match.md);
            
            if(Object.keys(pairTemplate).length === 0) pairTemplate = match.positions;
            if(allowedEmptyContent && (pairTemplate.start === match.positions.start)) return pairTemplate = {};

            if(!nextMatch || (eol + 1 !== nextMatch.positions.start)) {
                unparsedClassicPairs.push(pairTemplate)
                if(inner.pairTemplates.length > 0) resetInnerPairTemplate();

                pairTemplate = {};
            }

            else if(eol + 1 === nextMatch.positions.start) {
                if(parsedContent[nextMatch.positions.start] === " ") formatInnerPairTemplate(nextMatch);
                else if(inner.pairTemplates.length > 0) resetInnerPairTemplate();

                pairTemplate = {...pairTemplate, end: nextMatch.positions.end};
            }
        }
        
        function checkAllowedEmptyContent(content) {
            if(content === undefined) return false;

            let status = true;

            const md = symbol.tag === "blockquote" ? ">" : "<";
            const brLength = content.substring(content.length - 4) === "<br>" ? 4 : 0;

            for(let i = 0; i < content.length - brLength; i++) if(content[i] !== " " && content[i] !== md) status = false;
            
            return status;
        }

        function checkUnparsedClassicPairs() {
            unparsedClassicPairs.forEach(pair => {
                const pairContent = parsedContent.substring(pair.start, pair.end);
                let newPairContent = "";

                const lines = pairContent.split("\n");
                const newLines = [];

                let stop = false;
                
                for(let i = lines.length - 1; i >= 0; i--) {
                    const current = lines[i];
                    const next = lines[i - 1];
                    
                    const allowedEmptyContent = {
                        current: checkAllowedEmptyContent(current),
                        next: checkAllowedEmptyContent(next)
                    };
                    
                    if(!allowedEmptyContent.current) stop = true;
                    
                    if(!stop && (allowedEmptyContent.current && !allowedEmptyContent.next)) newLines.push(current);
                    if(stop) newLines.push(current)
                }

                newLines.reverse();
                newLines.forEach(line => { newPairContent += `${line}\n` });

                const closestPairMatch = Match.closest(parsedContent, newPairContent, pair.start);
                pairs.classic.push(closestPairMatch.positions);
            });
        }

        function formatInnerPairTemplate(nextMatch, addNew) {            
            if(inner.pairTemplates.length === 0 || addNew) {
                inner.pairTemplates.push(nextMatch.positions);
                if(!addNew) return;
            }
            
            if(inner.starts.length === 0 || addNew) inner.starts.push(addNew || inner.pairTemplates[inner.pairTemplates.length - 1].start);
            
            const prevLine = StartSpaces.count(parsedContent.substring(inner.pairTemplates[inner.pairTemplates.length - 1].start, inner.pairTemplates[inner.pairTemplates.length - 1].end));
            const line = StartSpaces.count(parsedContent.substring(nextMatch.positions.start, nextMatch.positions.end));
            
            if(prevLine === line) appendPairs();
            
            else {
                if(prevLine < line) formatInnerPairTemplate(nextMatch, nextMatch.positions.start);

                if(prevLine > line) {
                    while(inner.starts.length !== line) inner.starts.pop();
                    appendPairs();
                }
            }

            function updateInnerPairTemplate(start, value) {
                let newInnerPairTemplates = [];

                for(let i = 0; i < inner.pairTemplates.length; i++) {
                    if(start === inner.pairTemplates[i].start) newInnerPairTemplates.push({...inner.pairTemplates[i], ...value});
                    else newInnerPairTemplates.push(inner.pairTemplates[i]);
                }

                inner.pairTemplates = newInnerPairTemplates;
            }

            function appendPairs() {
                inner.starts.forEach(start => updateInnerPairTemplate(start, { end: nextMatch.positions.end }));
            }
        }

        function resetInnerPairTemplate() {
            pairs.classic.push(...inner.pairTemplates);
            
            inner.pairTemplates = [];
            inner.starts = [];
        }
    }

    function addPairs() {
        const doubleParsing = { collapsible: [], lists: [] };

        pairs.formatted.forEach(pair => addPair(pair));

        if(symbol.tag === "details") parseCollapsible();
        if(symbol.tag === "ol" || symbol.tag === "ul") parseList();

        function addPair(pair) {
            const { realPositions, innerContent, validTags, specialStatus } = initializePair();
            const parsedInnerContent = removeAllowedEmptyClassicMd();
            
            if(symbol.tag === "details") {
                let exists = false;
                if(doubleParsing.collapsible.indexOf(parsedInnerContent) > -1) exists = true;

                if(!exists) doubleParsing.collapsible.push(parsedInnerContent);
            }

            if(symbol.tag === "ol" || symbol.tag === "ul") {
                const tagsMd = specialStatus ? specialStatus: getClassicMd(innerContent);
                doubleParsing.lists.push({ content: innerContent, positions: realPositions, md: tagsMd, isSpecial: specialStatus });
            }

            const innerContentDifference = Math.abs(innerContent.length - parsedInnerContent.length);
            
            parsedContent = parsedContent.substring(0, realPositions.start) + validTags.opened + parsedInnerContent + parsedContent.substring(realPositions.end);
            addingDifference += validTags.opened.length - innerContentDifference;

            if(pair.inner) pair.inner.forEach(innerPair => addPair(innerPair));

            parsedContent = parsedContent.substring(0, pair.end + addingDifference) + validTags.closed + parsedContent.substring(pair.end + addingDifference);
            addingDifference += validTags.closed.length;
        
            function initializePair() {                
                const specialStatus = isPairSpecial(parsedContent.substring(pair.start + addingDifference));
                const skipSpecialMd = getSpecialMdLength();
                const realPositions = { start: pair.start + addingDifference + skipSpecialMd, end: pair.end + addingDifference };
                const innerContent = parsedContent.substring(realPositions.start, realPositions.end);
                const validTags = getValidTags();

                return { specialStatus, realPositions, innerContent, validTags };

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

                function getValidTags() {
                    if(symbol.tag !== "details" && symbol.tag !== "ol" && symbol.tag !== "ul") return tags;
        
                    let tagsMd = specialStatus ? specialStatus : getClassicMd(innerContent);
                    const startValue = !isNaN(parseInt(tagsMd)) ? { start: tagsMd } : {};
        
                    if(!isNaN(parseInt(tagsMd))) {
                        const lines = innerContent.split("\n");
                        let counter = parseInt(tagsMd);
                        
                        if(!specialStatus) {
                            const requiredSpaces = StartSpaces.count(lines[0]);
                            for(let i = 0; i < lines.length; i++) if(lines[i] && StartSpaces.count(lines[i]) === requiredSpaces) counter++;
                        }
                        
                        else {
                            let skip = 0;
                            const regex = { opened: /\([0-9]+\.<br>/gm, closed: /[0-9]+\.\)<br>/gm };
                            
                            for(let i = 0; i < lines.length; i++) {
                                if(lines[i].match(regex.opened)) skip++;
                                else if(lines[i].match(regex.closed)) skip--;
                                else if(lines[i] && !skip) counter++;
                            }
                        }
        
                        if(parseInt(tagsMd) !== counter - 1) tagsMd = `${tagsMd}-${counter - 1}`;
                    }
        
                    const listTags = generateTags(symbol, { md: tagsMd }, startValue);
                    return listTags;
                }
            }

            function removeAllowedEmptyClassicMd() {
                if(symbol.tag !== "blockquote" && symbol.tag !== "details") return innerContent;
                
                let newInnerContent = "";
                
                const lines = innerContent.split("\n");
                const emptyLine = /^[<>\s]+$/g
    
                lines.forEach((line, index) => {
                    const noBrLine = line.substring(line.length - 4) === "<br>" ? line.substring(0, line.length - 4) : line;
                    
                    if(noBrLine.match(emptyLine)) newInnerContent += `<br>${index === lines.length - 1 ? "" : "\n"}`;
                    else newInnerContent += `${line}${index === lines.length - 1 ? "" : "\n"}`;
                });
    
                return newInnerContent;
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

        function parseCollapsible() {
            doubleParsing.collapsible.forEach(collapsibleContent => {
                const noMdContent = removeCollapsibleMd(collapsibleContent);
                
                const summaryContent = setSummary(noMdContent);
                const lines = summaryContent.split("\n");

                let newCollapsibleContent = "";

                lines.forEach((line, index) => {
                    if(!line) return;
                    newCollapsibleContent += `${line}${index === lines.length - 1 ? "" : "\n"}`
                });

                parsedContent = parsedContent.replaceAll(collapsibleContent, newCollapsibleContent);
            });

            function setSummary(content) {
                let result = content;
                const tags = generateTags(symbol, { tag: "summary", md: "<" });

                const asciiCaseRegex = { start: /^<pre class=".+>/g, end: "</pre>" };
                const asciiCase = Match.all(content, asciiCaseRegex.start)[0];

                if(asciiCase) {
                    const positions = { start: asciiCase.positions.start, end: -1 };
                    const asciiCaseEnd = Match.closest(content, asciiCaseRegex.end, positions.start);

                    positions.end = asciiCaseEnd.positions.end;

                    result = result.substring(0, positions.start) + tags.opened + result.substring(positions.start, positions.end) + tags.closed + result.substring(positions.end);
                }

                else {
                    const firstBr = content.indexOf("<br>") + 4;
                    result = tags.opened + result.substring(0, firstBr) + tags.closed + result.substring(firstBr);
                }

                return result;
            }

            function removeCollapsibleMd(content) {
                let result = "";
                
                const lines = content.split("\n");
                
                const noMdLines = [];
                const noMdRegex = /<\s+/

                lines.forEach(line => noMdLines.push(line.replace(noMdRegex, "")));
                noMdLines.forEach((line, index) => { if(line) result += `${line}${index === noMdLines.length - 1 ? "" : "\n"}` });
                
                return result;
            }
        }
        
        function parseList() {
            doubleParsing.lists.forEach(list => {
                if(list.isSpecial) parseSpecialList(list);
                else parseClassicList(list);
            });

            function parseClassicList(list) {
                let newLiContent = "";
                const topLiContent = [];
                    
                const lines = list.content.split("\n");
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

                addLi(list, topLiContent);
            }

            function parseSpecialList(list) {
                let boundaries = [];
                const specialSymbol = !isNaN(parseInt(list.isSpecial)) ? `${list.isSpecial}.` : list.isSpecial;

                const innerSymbolsSearch = Match.all(list.content, `${Escape.regex("(" + specialSymbol)}<br>|${Escape.regex(specialSymbol + ")")}<br>`);
                let i = 0;
                
                while(innerSymbolsSearch.length !== 0) {
                    if(i === innerSymbolsSearch.length - 1) return i = 0;

                    const current = { content: innerSymbolsSearch[i].content, index: innerSymbolsSearch[i].positions.start };
                    const next = { content: innerSymbolsSearch[i + 1].content, index: innerSymbolsSearch[i + 1].positions.start };

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
                    
                    list.content = list.content.substring(0, realPositions.start) + list.content.substring(realPositions.end);
                    removingDifference += boundary.end - boundary.start;
                });

                const regex = /(?<!<br>)\n/;
                list.content = list.content.replace(regex, "");

                let newLiContent = "";
                const topLiContent = [];

                const lines = list.content.split("\n");

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

                addLi(list, topLiContent);

                function checkSymbolType(symbol) {
                    if(symbol[0] === "(") return "opened";
                    return "closed";
                }
            }

            function addLi(list, rows) {
                let parsedLiContent = "";
                let lineCounter = symbol.tag === "ol" ? parseInt(list.md) : 0;
                
                rows.forEach(row => {
                    const lines = row.split("\n");

                    lines.forEach(line => {
                        if(!line) return;

                        const tagsMd = symbol.tag === "ol" ? lineCounter : list.md;
                        const liTags = generateTags(symbol, { tag: "li", md: tagsMd });

                        const brLength = line.substring(line.length - 4) === "<br>" ? 4 : 0;
                        
                        parsedLiContent += `${liTags.opened}${removeListMd(StartSpaces.cut(line.substring(0, line.length - brLength)), list.isSpecial)}${liTags.closed}`;
                        lineCounter++;
                    });

                    const liMatch = Match.closest(parsedContent, row, list.positions.start);
                    parsedContent = parsedContent.substring(0, liMatch.positions.start) + parsedLiContent + parsedContent.substring(liMatch.positions.end);

                    parsedLiContent = "";
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
            case "details":
                result.push("<");
                break;
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

    function removeMd(removeLastBrStatus) {
        // ((?<=<blockquote.+\">)>(\\s*(?![0-9]+\\.|\\*|\\+|-)?)|^>(\\s*(?![0-9]+\\.|\\*|\\+|-))?)(?!(<br>|$))
        
        const patterns = {
            fakeBlockquotes: "((?<=<blockquote.+\">)>|^>)(?=[\\s>]*<br>)",
            fakeDetails: "((?<=<details.+\">)<(?=\\s)|^<(?=\\s))(?=[\\s<]*<br>)",
            classicMd: "((?<=<blockquote.+\">)>|^>)\\s*(?!(<br>|$))",
            nxtlvlMd: `\\(${symbol.md}\\s*<br>(?=<${symbol.tag}.+">)|(?<=<\\/${symbol.tag}>)${symbol.md}\\)\\s*<br>`
        };
    
        const remove = {
            fakeBlockquotes: new RegExp(patterns.fakeBlockquotes, "gm"),
            fakeDetails: new RegExp(patterns.fakeDetails, "gm"),
            classicMd: new RegExp(patterns.classicMd, "gm"),
            nxtlvlMd: new RegExp(patterns.nxtlvlMd, "gm")
        };
        
        if(symbol.tag === "blockquote") parsedContent = parsedContent.replace(remove.fakeBlockquotes, "&gt;");
        if(symbol.tag === "details") parsedContent = parsedContent.replace(remove.fakeDetails, "&lt;");
        parsedContent = parsedContent.replace(remove.classicMd, "");
        parsedContent = parsedContent.replace(remove.nxtlvlMd, "");

        if(removeLastBrStatus) removeLastBr();
        
        function removeLastBr() {
            const targets = symbol.tag === "blockquote" ? ["blockquote"] : ["details", "summary"];
            
            targets.forEach(target => {
                const lastBrRegex = new RegExp(`(?<!\\s*<br>\\s*)<br>\\s*</${target}>`,"gm");
                const lastBrTags = Match.all(parsedContent, lastBrRegex);

                let removingDifference = 0;

                lastBrTags.forEach(lastBrTag => {
                    const realPosition = lastBrTag.positions.start - removingDifference;
                    const brLength = 4;

                    parsedContent = parsedContent.substring(0, realPosition) + parsedContent.substring(realPosition + brLength);
                    removingDifference += brLength;
                });
            });
        }
    }

    return parsedContent;
}