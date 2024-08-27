//contains the code for the entity of the affordance
import Entity from "./Entity";
import DerefInfoCollector from "./DerefInfoCollector";
import {
  generateInfoCardTemplate,
  generateEventCardTemplate,
  generateDatasetCardTemplate,
  generateMapCardTemplate,
  generatePersonCardTemplate,
  generateBibliographicResourceCardTemplate,
  generateOrganizationCardTemplate,
} from "./Templates";
import "./css/mia.css";
import "./css/styles.css";

export default class AffordanceEntity {
  private element: any;
  private link: string;
  private collected_info: Entity;
  private derefinfocollector: DerefInfoCollector;
  private initial_updated: boolean = false;

  constructor(affordance: any, derefinfocollector: DerefInfoCollector) {
    console.log(typeof affordance);
    console.log("Affordance Entity initialised");
    this.element = affordance;
    this.link = affordance.href;
    this.collected_info = new Entity();
    this.derefinfocollector = derefinfocollector;
    this._update_dom_uri();
  }

  async onHover() {
    this.element.addEventListener("mouseover", (event: MouseEvent) => {
      if (this.incardview(event)) {
        console.log("card already in view");
        return;
      }
      //remove all other cards
      this._remove_card();
      console.log(this.collected_info);
      console.log(this.collected_info.content);
      this.produce_HTML_loader();
      if (
        this.collected_info.content === undefined ||
        Object.keys(this.collected_info.content).length === 0
      ) {
        console.log("no info collected yet");

        this.collectInfo()
          .then(() => {
            this.collected_info.content =
              this.derefinfocollector.cashedInfo[this.link];
            this.produce_HTML_view(event);
          })
          .catch((error) => {
            console.log(error);
            this.removeLoader();
          });
        return;
      }
      this.produce_HTML_view(event);

      return;
    });
  }

  incardview(event: MouseEvent): boolean {
    //check if the card is already in view
    let link_id = this.link.replace(/\//g, "-");

    let x = event.clientX;
    let y = event.clientY;

    let card_bbox = document.querySelector(".card")?.getBoundingClientRect();
    if (card_bbox !== undefined && card_bbox !== null) {
      if (
        x >= card_bbox.left &&
        x <= card_bbox.right &&
        y >= card_bbox.top &&
        y <= card_bbox.bottom
      ) {
        return true;
      }
    }

    if (
      document.querySelector(".card") !== null &&
      document.getElementById(link_id) !== null
    ) {
      return true;
    }
    return false;
  }

  removeLoader() {
    // remove the confleunce_box_loading class from the element
    this.element.classList.remove("confluence_box_loading");
    this.element.classList.add("confluence_box");
  }

  async collectInfo() {
    //function to collect info
    console.log("collecting info for " + this.link);
    //this one is also needed since there are 2 ways to trigger this
    // via the hover effect or via the scheduler
    if (
      this.derefinfocollector.cashedInfo[this.link] === undefined ||
      Object.keys(this.derefinfocollector.cashedInfo[this.link]).length === 0
    ) {
      await this.derefinfocollector.collectInfo(this.link);
      this.collected_info.content =
        this.derefinfocollector.cashedInfo[this.link];
      return;
    }
    if (Object.keys(this.collected_info.content).length !== 0) {
      console.log("info already collected");
      return;
    }
  }

  // if special keys are needed to display the info, they can be added here
  private type_to_keys: any = {
    person: ["name", "family"],
  };

  private _update_dom_uri() {
    // self element
    let element = this.element;
    console.info("element: ", element);

    //if the element href contains marineinfo or marineregions in it
    //add class confluence_box to elemnt if not already there
    if (
      this.link.includes("marineinfo") ||
      this.link.includes("marineregions")
    ) {
      // check if the parent element is an <a> tag
      // if yes then check if there is a element tag nochange
      // eg: <a nochange>text</a>
      // if not add the class confluence_box
      if (element.getAttribute("nochange") === null) {
        element.classList.add("confluence_box");
        element.addEventListener("contextmenu", (event: any) => {
          event.preventDefault();
          navigator.clipboard.writeText(this.link);
        });
      }
      this.onHover();
    }

    if (!this.initial_updated) {
      if (element.getAttribute("noupdate") !== null) {
        this.initial_updated = true;
        return;
      }

      if (element.getAttribute("nochange") !== null) {
        this.initial_updated = true;
        return;
      }
      // check every 1 second if there is any cashed info
      const intervalId = setInterval(() => {
        // if the cashed info is not empty, update the dom
        if (
          this.derefinfocollector.cashedInfo[this.link] !== undefined &&
          Object.keys(this.derefinfocollector.cashedInfo[this.link]).length !==
            0
        ) {
          console.log("updating dom");
          let collected_info = this.derefinfocollector.cashedInfo[this.link];
          //change the inner html of the element
          //this should be either the title or name key of the collected info
          let content = collected_info[Object.keys(collected_info)[0]];
          console.info("content: ", collected_info);
          //first check if there are special keys for the type
          if (this.type_to_keys[Object.keys(collected_info)[0]] !== undefined) {
            //get all the keys and map them on the content
            let to_display_content = [];
            for (let key in this.type_to_keys[Object.keys(collected_info)[0]]) {
              try {
                to_display_content.push(
                  content[
                    this.type_to_keys[Object.keys(collected_info)[0]][key]
                  ]
                );
              } catch (error) {
                console.log("key not found");
                continue;
              }
            }

            //update inner html
            element.innerHTML = to_display_content.join(" ");
          } else if (content.name !== undefined) {
            element.innerHTML = content.name;
          } else if (content.title !== undefined) {
            element.innerHTML = content.title;
          }
          this.initial_updated = true;

          /*
          // Add a rightclick event listener to the element
          // that will copy the link to the clipboard
          element.addEventListener("contextmenu", (event: any) => {
            event.preventDefault();
            navigator.clipboard.writeText(this.link);
          });
          */

          clearInterval(intervalId); // Stop the interval
        }
      }, 1000);
    }
  }

  private _get_template_name(name: string) {
    const mapping: any = {
      map: generateMapCardTemplate,
      event: generateEventCardTemplate,
      person: generatePersonCardTemplate,
      bibresource: generateBibliographicResourceCardTemplate,
      organization: generateOrganizationCardTemplate,
      dataset: generateDatasetCardTemplate,
      default: generateInfoCardTemplate,
    };
    let toreturn = mapping[name];
    if (toreturn === undefined) {
      console.log("template not found");
      return generateInfoCardTemplate;
    }
    return mapping[name];
  }

  private _generate_card_placement(
    card: HTMLDivElement,
    event: MouseEvent
  ): HTMLDivElement {
    // generate the placement of the popup based in the position of the link,
    // the popup should be placed under or above the link depending on the position of the mouse
    let affordance_position = this.element.getBoundingClientRect();
    let current_window_height = window.innerHeight;
    let affordance_position_top = affordance_position.top;
    let scrolled_height = document.documentElement.scrollTop;
    let scrolled_width = document.documentElement.scrollLeft;

    let current_window_width = window.innerWidth;

    // some log statements to check the values
    console.debug("affordance_position_top", affordance_position_top);
    console.debug("current_window_height", current_window_height);
    console.debug("current_window_width", current_window_width);
    console.debug("scrolled_height", scrolled_height);
    console.debug("scrolled_width", scrolled_width);
    console.debug("affordance_position", affordance_position);
    console.debug("card_clientHeight", card.clientHeight);

    // logic to place the card above or below the link
    // the card should be placed above the link if the affordance is closer to the bottom of the window
    if (affordance_position_top > current_window_height / 2) {
      // when card is placed above the link, the top of the card should be the same height as the total height of the card -25px
      card.style.top =
        affordance_position.top +
        scrolled_height -
        card.clientHeight -
        5 +
        "px";
    } else {
      // the top of the card should be 25px below the bottom of the link
      card.style.top = affordance_position.bottom + scrolled_height + 1 + "px";
    }

    // logic here to decide if the card should be placed to the left or right of the link
    // if the mouse curser is closer to the right side of the window, the card should be placed to the left of the link
    if (event.x > current_window_width / 2) {
      //make the left of the card the same as the left of the link
      card.style.left = event.x + scrolled_width - card.clientWidth + "px";
      return card;
    }

    //make the left of the card the same as the left of the link
    card.style.left = event.x + scrolled_width - 20 + "px";
    return card;
  }

  produce_HTML_view(event: MouseEvent) {
    console.log("producing HTML view");
    this.removeLoader();
    console.log(this.collected_info);

    let affordance_link = this.link;

    //make id for modal based on the link
    let card_id = this.link.replace(/\//g, "-");
    //check if modal already exists
    if (document.getElementById(card_id) !== null) {
      console.log("card already exists");
      return;
    }

    //get card type for right template
    let template_name = Object.keys(this.collected_info.content)[0];
    console.log(template_name);

    //create card
    let card = document.createElement("div");
    card.className = "card fade-in";
    //based in the size of the window and the position of the affordance, the card will be placed in a different position
    //the card must always be placed in the same position as the affordance
    //get position of affordance and mouse

    card = this._generate_card_placement(card, event);
    //set position of card
    card.style.position = "absolute";
    //set id of card
    card.id = card_id;
    card.classList.add("card");
    //
    //add template to card
    card = this._get_template_name(template_name)(
      this.collected_info.content[template_name],
      card,
      affordance_link
    );
    card = this._generate_card_placement(card, event);

    document.body.addEventListener("mousemove", (event) => {
      //check if mouse is on triangle
      let rect = card.getBoundingClientRect();
    });

    card.addEventListener("mouseleave", () => {
      //wait 1 second before removing the card
      setTimeout(() => {
        // check if the mouse is not over the card
        // and the mouse is not over the element that triggered the card
        // and the link is not the current page
        if (
          document.querySelector(".card:hover") === null &&
          this.link !== window.location.href
        ) {
          this._remove_card();
        }
      }, 1000);
    });

    document.addEventListener("click", (event) => {
      //if the click is not in the card, remove the card
      if (document.querySelector(".card:hover") === null) {
        this._remove_card();
      }
    });

    //add card to body
    card.addEventListener("click", function (e) {
      var rect = card.getBoundingClientRect();
      var isInTriangle =
        e.clientX > rect.right - 20 && e.clientY < rect.top + 20; // Adjust the 30px based on the triangle size
    });
  }

  private _remove_card() {
    let card = document.querySelectorAll(".card");
    for (let i = 0; i < card.length; i++) {
      card[i].classList.add("fade-out");
      card[i].addEventListener("animationend", () => {
        card[i].remove();
      });
    }
  }

  produce_HTML_loader() {
    console.log("producing HTML loader");
    /*
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        */
    //check if the link already has a loader
    // by checking for the confluence_box_loading class
    let loader = document.querySelector(".confluence_box_loading");
    if (loader !== null) {
      return;
    }
    //create loader by adding confluence_box_loading class to this.element
    this.element.classList.remove("confluence_box");
    this.element.classList.add("confluence_box_loading");
  }
}
