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

export {popupTemplate, textSectionTemplate};