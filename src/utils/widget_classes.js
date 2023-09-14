//this file will contain all the functions that ware related to classes that are given to spans that are used in the widget

//this function will add an underline to the spans that have the class underline

async function addUnderline(entry) {
    //Add an underline to the entry
    //get entry.span
    const span = entry.span;
    // Add the underline to the span
    span.innerHTML = `<u>${entry.text}</u>`;
    span.style.color = 'red';
    // Add a click event listener to the span
    span.addEventListener('click', (event) => {
        // Get the entity
        const entity = span.getAttribute('entity');
        // onclick open a new tab with the entity
        window.open(entity, '_blank');
    }); 
    //add on hover effect to the span and color it blue
    //make sure he underline of the span is red
    span.addEventListener('mouseover', (event) => {
        span.style.color = 'blue';
    }
    );
    span.addEventListener('mouseout', (event) => {
        span.style.color = 'red';
    }
    );
}

//this function will send out an alert when a span with the class alert is found
async function alert(entry) {
    window.alert(entry.text);
}

export {addUnderline, alert};