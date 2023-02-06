const Convert = { camelToKebab, kebabToCamel };

function camelToKebab(camel) {
    let kebab = "";

    for(let i = 0; i < camel.length; i++) {
        if(camel[i] === camel[i].toUpperCase()) kebab += `-${camel[i].toLowerCase()}`;
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

export default Convert;