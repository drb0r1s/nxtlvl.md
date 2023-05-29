import ASCII from "../data/ASCII.js";
import Escape from "./Escape.js";

const Convert = { camelToKebab, kebabToCamel, reverse, toASCII };

function camelToKebab(camel) {
    let kebab = "";

    for(let i = 0; i < camel.length; i++) {
        if(camel[i] === camel[i].toUpperCase() && camel[i] !== "-") kebab += `-${camel[i].toLowerCase()}`;
        else kebab += camel[i];
    }

    return kebab;
}

function kebabToCamel(kebab) {
    let camel = "";
    let upperCaseStatus = false;

    for(let i = 0; i < kebab.length; i++) {
        if(kebab[i] === "-") upperCaseStatus = true;
        
        else if(upperCaseStatus) {
            upperCaseStatus = false;
            camel += kebab[i].toUpperCase();
        }

        else camel += kebab[i];
    }

    return camel;
}

function reverse(string) {
    let reversedString = "";
    for(let i = string.length - 1; i >= 0; i--) reversedString += string[i];
    
    return reversedString;
}

function toASCII(string) {
    const ascii = {
        row: 6,
        string: ""
    };
    
    const characters = {
        string: [...string],
        ascii: []
    };

    for(let i = 0; i < characters.string.length; i++) Object.keys(ASCII).forEach((key, index) => { if(key === characters.string[i]) characters.ascii.push(Object.values(ASCII)[index]) });

    for(let i = 0; i < ascii.row; i++) {
        for(let j = 0; j < characters.ascii.length; j++) {
            const rows = characters.ascii[j].split("\n");
            
            rows.shift();
            rows.pop();

            const targetRow = rows[i];
            ascii.string += Escape.nxtlvl(targetRow);
        }

        ascii.string += "\n";
    }
    
    return ascii.string;
}

export default Convert;