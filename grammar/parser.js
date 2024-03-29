import parseSymbolGroups from "./symbolGroups/parseSymbolGroups.js";
import StartSpaces from "../functions/StartSpaces.js";
import Match from "../functions/Match.js";

export default function parser(content) {
    let parsedContent = content;
    
    whitespacesConfig();
    parsedContent = parseSymbolGroups(parsedContent);

    parsedContent = parsedContent.replaceAll("\n", "");
    
    return parsedContent;

    function whitespacesConfig() {
        parsedContent = parsedContent.replaceAll("\n", "<br>\n");

        const regex = {
            firstLine: /^<br>\n/,
            innerList: /^[<>\s]*\s*(?=(\s*[0-9]+\.|\s*\*|\s*\+|\s*-)\s+.+<br>).+/gm,
            whitespaces: /^\s+.+/gm
        };

        Object.values(regex).forEach((r, index) => {
            const key = Object.keys(regex)[index];
            
            switch(key) {
                case "firstLine":
                    parsedContent = parsedContent.replace(r, "");
                    break;
                case "innerList":
                    const potentialinnerLists = Match.all(parsedContent, regex.innerList);

                    const innerLists = getInnerLists(potentialinnerLists);
                    const formattedInnerLists = formatInnerLists(innerLists);

                    removeListSpaces(potentialinnerLists, formattedInnerLists);

                    break;
                case "whitespaces":
                    const matches = Match.all(parsedContent, r);
                    const listRegex = /^[<>\s]*([0-9]+\.|\*|\+|-)\s/;

                    let removingDifference = 0;
                    
                    matches.forEach(match => {
                        if(match.content.match(listRegex)) return;

                        const realPositions = { start: match.positions.start - removingDifference, end: -1 };
                        for(let i = 0; i < match.content.length; i++) if(realPositions.end === -1 && match.content[i] !== " ") realPositions.end = i + realPositions.start;

                        parsedContent = parsedContent.substring(0, realPositions.start) + parsedContent.substring(realPositions.end);
                        removingDifference += realPositions.end - realPositions.start;
                    });

                    break;
                default: ;
            }
        });

        function getInnerLists(potentialinnerLists) {
            const result = [];
            
            const matches = [];
            let matchBlock = [];

            let parentSpaces = -1;

            for(let i = 0; i < potentialinnerLists.length; i++) {
                const current = potentialinnerLists[i];
                const next = potentialinnerLists[i + 1];
                
                if(next && (current.content.length + current.positions.start + 1 === next.positions.start)) {
                    const parsed = parseMultipleLinesCase(current, next);
                    
                    matchBlock.push({ content: parsed.next, position: next.positions.start });
                    if(parentSpaces === -1) parentSpaces = StartSpaces.count(parsed.current);
                }

                else if(matchBlock.length > 0 && parentSpaces > -1) {
                    matches.push({ blocks: matchBlock, spaces: parentSpaces });
                    matchBlock = [];

                    parentSpaces = -1;
                }
            }

            matches.forEach(match => {
                const childrenBlock = [];
                
                match.blocks.forEach(block => { if(match.spaces < StartSpaces.count(block.content)) childrenBlock.push(block) });
                if(childrenBlock.length > 0) result.push(childrenBlock);
            });

            return result;

            function parseMultipleLinesCase(current, next) {                
                const defaultContent = { current: current.content, next: next.content };
                let parsed = defaultContent;
                
                let multipleLinesCase = true;
                let symbolsStatus = false;
                
                Object.keys(parsed).forEach((key, index) => {
                    const value = Object.values(parsed)[index];

                    for(let i = 0; i < value.length; i++) if(multipleLinesCase) {
                        if(value[i] === ">" || (value[i] === "<" && value[i + 1] === " ")) symbolsStatus = true;
                        else if(!symbolsStatus && value [i] !== " " && value[i] !== ">" && value[i] !== "<") multipleLinesCase = false;
                    }

                    if(!multipleLinesCase) return;

                    let realStart = 0;
                    let status = true;

                    for(let i = 0; i < value.length; i++) {
                        if(status && value[i] === ">" || (value[i] === "<" && value[i + 1] === " ")) realStart = value[i] === "<" ? i + 1 : i;
                        else if(value[i] !== " " && value[i] !== ">" && value[i] !== "<") status = false;
                    }

                    realStart++;

                    parsed = {...parsed, [key]: value.substring(realStart)};
                });

                if(!multipleLinesCase) return defaultContent;
                return parsed;
            }
        }

        function formatInnerLists(innerLists) {
            const formattedLists = [];
            
            innerLists.forEach(list => {
                const levels = [];

                list.forEach(line => {
                    const spaces = StartSpaces.count(line.content);
                    if(levels.length === 0 || levels[levels.length - 1] < spaces) levels.push(spaces);
                });

                list.forEach(line => {
                    const spaces = StartSpaces.count(line.content);
                    let level = 0;

                    for(let i = levels.length - 1; i >= 0; i--) if(spaces <= levels[i]) level = i + 1;

                    const noSpacesLine = StartSpaces.cut(line.content);
                    let formattedLine = "";

                    for(let i = 0; i < level; i++) formattedLine += " ";
                    formattedLine += noSpacesLine;

                    const fullLine = getFullLine(line);
                    
                    formattedLists.push({
                        content: fullLine,
                        formatted: formattedLine,
                        positions: { start: line.position, end: line.position + fullLine.length }
                    });
                });
            });

            return formattedLists;

            function getFullLine(line) {
                const afterLine = parsedContent.substring(line.position);
                const firstBr = afterLine.indexOf("<br>");

                const fullLine = afterLine.substring(0, firstBr + 4);
                return fullLine;
            }
        }

        function removeListSpaces(potentialInnerLists, formattedInnerLists) {
            const lists = { unformatted: [], formatted: formattedInnerLists };

            for(let i = 0; i < potentialInnerLists.length; i++) {
                let isFormatted = false;
                for(let j = 0; j < formattedInnerLists.length; j++) if(potentialInnerLists[i].positions.start === formattedInnerLists[j].positions.start) isFormatted = true;

                if(!isFormatted) lists.unformatted.push(potentialInnerLists[i]);
            }

            const mergedLists = [...lists.unformatted, ...lists.formatted];

            let swap;

            for(let i = 0; i < mergedLists.length; i++) for(let j = i + 1; j < mergedLists.length; j++) if(mergedLists[i].positions.start > mergedLists[j].positions.start) {
                swap = mergedLists[i];
                mergedLists[i] = mergedLists[j];
                mergedLists[j] = swap;
            }

            let removingDifference = 0;

            mergedLists.forEach(list => {
                const realPositions = { start: list.positions.start - removingDifference, end: list.positions.end - removingDifference };
                
                const prefixRegex = /^[<>\s]+/;
                const prefix = getPrefix(list.content);

                const newContent = prefix + (list.formatted ? list.formatted : list.content.replace(prefixRegex, ""));
                const difference = Math.abs(list.content.length - newContent.length);

                parsedContent = parsedContent.substring(0, realPositions.start) + newContent + parsedContent.substring(realPositions.end);
                removingDifference += difference;
            });

            function getPrefix(content) {
                let prefixSymbols = "";
                let stop = false;

                for(let i = 0; i < content.length; i++) {
                    if(
                        (content[i] !== " " && content[i] !== ">" && content[i] !== "<") ||
                        (content[i] === "<" && content[i + 1] !== " ")
                    ) stop = true;

                    if(!stop && (content[i] === ">" || content[i] === "<")) prefixSymbols += content[i] === ">" ? ">" : "< ";
                }

                return prefixSymbols;
            }
        }
    }
}