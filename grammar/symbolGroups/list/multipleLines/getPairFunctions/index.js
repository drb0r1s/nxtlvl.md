import Parse from "./add/Parse.js";
import Search from "./get/Search.js";
import isSpecial from "../isSpecial.js";
import formatInnerPairs from "./get/formatInnerPairs.js";
import checkEmptyPairs from "./get/checkEmptyPairs.js";
import nest from "./format/nest.js";
import addPairs from "./add/addPairs.js";
import getDoubleParsing from "./add/getDoubleParsing.js";

export default function getPairFunctions({ content, symbol }) {
    return [get, format, add];
    
    function get({ pairs, matches }) {
        const newPairs = pairs;
        const templates = { classic: {}, special: [] };

        matches.forEach((match, index) => {
            if(isSpecial(match.md, symbol)) updateTemplates("special", Search.special(templates, match));
            else updateTemplates("classic", Search.classic(templates, symbol, match, matches[index + 1]));
        });

        if(symbol.tag === "ol" || symbol.tag === "ul") newPairs.classic = formatInnerPairs(newPairs.classic, content);

        let swap;

        for(let i = 0; i < newPairs.classic.length; i++) for(let j = i + 1; j < newPairs.classic.length; j++) if(newPairs.classic[i].start > newPairs.classic[j].start) {
            swap = newPairs.classic[i];
            newPairs.classic[i] = newPairs.classic[j];
            newPairs.classic[j] = swap;
        }

        if(templates.special.length > 0) merge();

        const { classic, special } = checkEmptyPairs(content, symbol, newPairs);
        
        newPairs.classic = classic;
        newPairs.special = special;

        return { newPairs };

        function updateTemplates(type, newTemplates) {
            if(type === "classic") {
                if(newTemplates.pair) newPairs.classic.push(newTemplates.pair);
                templates.classic = newTemplates.list.classic;
            }

            else templates.special = newTemplates.special;
        }

        function merge() {
            const counter = { opened: 0, closed: 0 };

            templates.special.forEach(md => {
                if(md.type === "opened") counter.opened++;
                else counter.closed++;
            });

            if(counter.opened !== counter.closed) return;
            
            while(templates.special.length > 0) {
                for(let i = 0; i < templates.special.length; i++) {
                    const current = templates.special[i];
                    const next = templates.special[i + 1];
                    
                    if(current.type === "opened" && next.type === "closed") {
                        newPairs.special.push({ start: current.position, end: next.position });
                        templates.special.splice(i, 2);
                    }
                }
            }
        }
    }
    
    function format({ pairs }) {
        const newPairs = pairs;
        newPairs.formatted = [...newPairs.classic, ...newPairs.special];

        let swap;

        for(let i = 0; i < newPairs.formatted.length; i++) for(let j = i + 1; j < newPairs.formatted.length; j++) if(newPairs.formatted[i].start > newPairs.formatted[j].start) {
            swap = newPairs.formatted[i];
            newPairs.formatted[i] = newPairs.formatted[j];
            newPairs.formatted[j] = swap;
        }

        newPairs.formatted = nest(newPairs.formatted);

        return { newPairs };
    }
    
    function add({ pairs, content, addingDifference }) {
        const newPairs = pairs;
        
        let newContent = content;
        let newAddingDifference = addingDifference;

        const { newContent: newContentValue, newAddingDifference: newAddingDifferenceValue } = addPairs(newPairs.formatted, newContent, newAddingDifference, symbol);
        
        newContent = newContentValue;
        newAddingDifference = newAddingDifferenceValue;

        const doubleParsing = getDoubleParsing(newContent, symbol);

        if(symbol.tag === "details") newContent = Parse.collapsible(doubleParsing, newContent, symbol);
        if(symbol.tag === "ol" || symbol.tag === "ul") newContent = Parse.list(doubleParsing, newContent, symbol);

        return { newPairs, newContent, newAddingDifference };
    }
}