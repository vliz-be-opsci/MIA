//this file will contain the template for the popup

let popupTemplate = `
<template id="popup-template">
    <div class="mia-popup">
        <div class="mia-popup-content">
            <div class="text-section"></div>
            <div class="img-map-section portrait"></div>
            <div class="img-map-section landscape"></div>
        </div>
    </div>
</template>
`;

let textSectionTemplate = `
<template id="text-section-template">
    <div class="text-section-content">
        <h4 class="text-section-title">
        </h4>
        <div class="text-section-body"></div>
    </div>
</template>
`;

let basicTemplate = `
<template id="basic-template">
    <div class="popup-content">
        <h4 class="popup-content-title" id="title">
        </h4>
        <div class="popup-content-affordances" id="affordances"></div>
        <div class="popup-content-text" id="description"></div>
        <div class="popup-content-image" id="image"></div>
        <div class="popup-content-other" id="other"></div>
    </div>
</template>
`;

let templateIDmap = {
    'popup-template': popupTemplate,
    'text-section-template': textSectionTemplate,
    'basic-template': basicTemplate
};

export {popupTemplate, textSectionTemplate, templateIDmap, basicTemplate};