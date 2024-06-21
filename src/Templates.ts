/* all generic templates here */

export function generateInfoCardTemplate(data: { [key: string]: any }): string {

    console.log(data);

    //for each undefined value, replace with a default value
    let title = data.title || 'No title available';
    let description = data.description || 'No description available';
    return `
        <img src="..." class="card-img-top" alt="...">
        <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${description}</p>
            <a href="#" class="btn btn-primary">Go somewhere</a>
        </div>
    `;
  }

export function generateEventCardTemplate(data: { [key: string]: any }): string {

    console.log(data);
    //for each undefined value, replace with a default value
    let title = data.name || 'No title available';
    let description = data.location || 'No description available';

    return `
        <img src="..." class="card-img-top" alt="...">
        <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${description}</p>
            <a href="#" class="btn btn-primary">Go somewhere</a>
        </div>
    `;
  }
