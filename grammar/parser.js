import parseSymbolGroups from "./symbolGroups/parseSymbolGroups.js";
import StartSpaces from "../functions/StartSpaces.js";
import Match from "../functions/Match.js";

export default function parser(content) {
    let parsedContent = content;
    
    whitespacesConfig();
    parsedContent = parseSymbolGroups(parsedContent);

    parsedContent = parsedContent.replaceAll("<br>\n", "<br>");
    
    return parsedContent;

    function whitespacesConfig() {
        parsedContent = parsedContent.replaceAll("\n", "<br>\n");

        const regex = {
            firstLine: /^<br>\n/,
            whitespaces: /^(\s+|\t)/gm,
            innerList: /(>|\s+|\t)(?=([0-9]+\.|\*|\+|-)\s+.+<br>).+/gm
        };

        let potentialInnerListMatches = [];
        let realInnerListMatches = [];

        let addingDifference = 0;

        Object.values(regex).forEach((r, index) => {
            const key = Object.keys(regex)[index];
            
            switch(key) {
                case "firstLine":
                    parsedContent = parsedContent.replace(r, "");
                    break;
                case "whitespaces":
                    const potentialInnerListRegex = new RegExp("^(\\s+|\\t).+", "gm");
                    const matches = { all: Match.all(parsedContent, r), potentialInnerList: Match.all(parsedContent, potentialInnerListRegex) };
                    
                    matches.potentialInnerList.forEach(match => {
                        if(match.content.match(regex.innerList)) potentialInnerListMatches.push({ content: match.content, position: match.positions.start });
                    });

                    checkPotentialInnerListMatches();
                    
                    matches.all.forEach((match, index) => {
                        const potentialInnerListMatch = matches.potentialInnerList[index];
                        let block = false;
                        
                        for(let i = 0; i < realInnerListMatches.length; i++) for(let j = 0; j < realInnerListMatches[i].length; j++) if(potentialInnerListMatch.content === realInnerListMatches[i][j]) block = true;
                        if(block) return;

                        const realPositions = { start: match.positions.start - addingDifference, end: match.positions.end - addingDifference };
        
                        parsedContent = parsedContent.substring(0, realPositions.start) + parsedContent.substring(realPositions.end);
                        addingDifference += realPositions.end - realPositions.start;
                    });

                    break;
                case "innerList":
                    const innerMatches = formatInnerMatches(realInnerListMatches);
                    const mergedRealInnerListMatches = [];

                    for(let i = 0; i < realInnerListMatches.length; i++) mergedRealInnerListMatches.push(...realInnerListMatches[i]);
                    for(let i = 0; i < mergedRealInnerListMatches.length; i++) parsedContent = parsedContent.replaceAll(mergedRealInnerListMatches[i], innerMatches[i]);

                    const fakeInnerListRegex = /^>\s+(?=([0-9]+\.|\*|\+|-)\s+.+<br>).+<br>/gm;
                    const potentialFakeInnerList = Match.all(parsedContent, fakeInnerListRegex);
                    console.log(potentialFakeInnerList)

                    potentialInnerListMatches = [];
                    realInnerListMatches = [];
                    
                    break;
                default: ;
            }
        });

        function checkPotentialInnerListMatches() {
            const realMatches = [];
            let realMatchBlock = [];

            let parentSpaces = -1;

            for(let i = 0; i < potentialInnerListMatches.length; i++) {
                const current = potentialInnerListMatches[i];
                const next = potentialInnerListMatches[i + 1];
                
                if(next && (current.content.length + current.position + 1 === next.position)) {
                    const parsed = parseMultipleLinesCase(current, next);
                    
                    realMatchBlock.push(parsed.next);
                    if(parentSpaces === -1) parentSpaces = StartSpaces.count(parsed.current);
                }

                else if(realMatchBlock.length > 0 && parentSpaces > -1) {
                    realMatches.push({ matches: realMatchBlock, spaces: parentSpaces });
                    realMatchBlock = [];

                    parentSpaces = -1;
                }
            }

            realMatches.forEach(realMatch => {
                const childrenBlock = [];
                
                realMatch.matches.forEach(match => { if(realMatch.spaces < StartSpaces.count(match)) childrenBlock.push(match) });
                if(childrenBlock.length > 0) realInnerListMatches.push(childrenBlock);
            });

            function parseMultipleLinesCase(current, next) {                
                const defaultContent = { current: current.content, next: next.content };
                let parsed = defaultContent;
                
                const multipleLinesCaseRegex = /(>|<\s)(?!$)/g;
                let multipleLinesCase = true;
                
                Object.keys(parsed).forEach((key, index) => {
                    const value = Object.values(parsed)[index];
                    
                    const multipleLinesMatches = Match.all(value, multipleLinesCaseRegex);
                    if(multipleLinesMatches.length === 0) return multipleLinesCase = false;

                    multipleLinesMatches.forEach(multipleLinesMatch => { parsed = {...parsed, [key]: value.substring(multipleLinesMatch.positions.end)} });
                });

                if(!multipleLinesCase) return defaultContent;
                return parsed;
            }
        }

        function formatInnerMatches(matches) {
            const formattedMatches = [];
            
            matches.forEach(match => {
                const levels = [];

                match.forEach(line => {
                    const spaces = StartSpaces.count(line);
                    if(levels.length === 0 || levels[levels.length - 1] < spaces) levels.push(spaces);
                });

                match.forEach(line => {
                    const spaces = StartSpaces.count(line);
                    let level = 0;

                    for(let i = levels.length - 1; i >= 0; i--) if(spaces <= levels[i]) level = i + 1;

                    const noSpacesLine = StartSpaces.cut(line);
                    let formattedLine = "";

                    for(let i = 0; i < level; i++) formattedLine += " ";
                    formattedLine += noSpacesLine;
                    
                    formattedMatches.push(formattedLine);
                });
            });

            return formattedMatches;
        }
    }
}