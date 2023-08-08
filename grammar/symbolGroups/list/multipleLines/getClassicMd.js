import StartSpaces from "../../../../functions/StartSpaces.js";

export default function getClassicMd(innerContent) {
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