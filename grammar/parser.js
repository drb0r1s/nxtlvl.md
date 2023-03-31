import parseSymbolGroups from "./symbolGroups/parseSymbolGroups.js";
import escapeRegex from "../functions/escapeRegex.js";
import whitespaceCounter from "../functions/whitespaceCounter.js";

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
            innerList: /(\s+|\t)(?=[0-9]+\.\s+.+<br>).+/gm
        };

        let potentialInnerListMatches = [];
        let realInnerListMatches = [];

        let removingDifference = 0;

        Object.values(regex).forEach((r, index) => {
            const key = Object.keys(regex)[index];
            
            switch(key) {
                case "firstLine":
                    parsedContent = parsedContent.replace(r, "");
                    break;
                case "whitespaces":
                    const potentialInnerListRegex = new RegExp("^(\\s+|\\t).+", "gm");
                    const matches = { all: [...parsedContent.matchAll(r)], potentialInnerList: [...parsedContent.matchAll(potentialInnerListRegex)] };
                    
                    matches.potentialInnerList.forEach(match => {
                        if(match[0].match(regex.innerList)) potentialInnerListMatches.push({ content: match[0], position: match.index });
                    });

                    checkPotentialInnerListMatches();
                    
                    matches.all.forEach(match => {
                        const realPositions = { start: match.index - removingDifference, end: match[0].length + match.index - removingDifference };
        
                        parsedContent = parsedContent.substring(0, realPositions.start) + parsedContent.substring(realPositions.end);
                        removingDifference += realPositions.end - realPositions.start;
                    });

                    break;
                case "innerList":
                    const innerMatches = formatInnerMatches(realInnerListMatches);

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
                    realMatchBlock.push(next.content);
                    if(parentSpaces === -1) parentSpaces = whitespaceCounter(current.content);
                }

                else if(realMatchBlock.length > 0 && parentSpaces > -1) {
                    realMatches.push({ matches: realMatchBlock, spaces: parentSpaces });
                    realMatchBlock = [];

                    parentSpaces = -1;
                }
            }

            realMatches.forEach(realMatch => {
                const childrenBlock = [];
                
                realMatch.matches.forEach(match => {
                    if(realMatch.spaces < whitespaceCounter(match)) childrenBlock.push(match)
                });

                if(childrenBlock.length > 0) realInnerListMatches.push(childrenBlock);
            });
        }

        function formatInnerMatches(matches) {
            console.log(matches)
            const formattedMatches = [];

            matches.forEach(match => {
                let coreSpace = -1;

                
            });
        }

        function getListOrder(li) {
            let order = -1;
            for(let i = 0; i < li.length; i++) if(order === -1 && li[i] !== " ") order = li[i];

            return order;
        }
    }
}