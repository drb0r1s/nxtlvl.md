import parseSymbolGroups from "./symbolGroups/parseSymbolGroups.js";
import escapeRegex from "../functions/escapeRegex.js";

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
                    for(let i = 0; i < realInnerListMatches.length; i++) {
                        let newLi = "";
                        let ignore = true;

                        for(let j = 0; j < realInnerListMatches[i].length; j++) {
                            if(ignore && realInnerListMatches[i][j] !== " ") ignore = false;
                            if(!ignore) newLi += realInnerListMatches[i][j];
                        }

                        const regex = new RegExp(escapeRegex(newLi), "gm");
                        parsedContent = parsedContent.replace(regex, ` ${newLi}`);
                    }

                    potentialInnerListMatches = [];
                    realInnerListMatches = [];
                    
                    break;
                default: ;
            }
        });

        function checkPotentialInnerListMatches() {
            let prevReal = false;
            
            for(let i = 0; i < potentialInnerListMatches.length; i++) {
                const current = potentialInnerListMatches[i];
                const next = potentialInnerListMatches[i + 1];
                
                if(
                    next &&
                    (whitespaceCounter(current.content) < whitespaceCounter(next.content)) &&
                    (current.content.length + current.position + 1 === next.position)
                ) {
                    prevReal = true;
                    realInnerListMatches.push(next.content);
                }

                else if(
                    next &&
                    prevReal &&
                    (whitespaceCounter(current.content) === whitespaceCounter(next.content)) &&
                    (current.content.length + current.position + 1 === next.position)
                ) realInnerListMatches.push(next.content);

                else prevReal = false;
            }
            
            function whitespaceCounter(string) {
                let status = true;
                let counter = 0;

                while(status) {
                    if(string[counter] === " ") counter++;
                    else status = false;
                }

                return counter;
            }
        }
    }
}