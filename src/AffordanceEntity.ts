//contains the code for the entity of the affordance
import Entity from "./Entity";
import DerefInfoCollector from "./DerefInfoCollector";
import { ICollectingScheduler } from "./SchedulerFactory";
import link from "./css/link.svg";
import {
  generateInfoCardTemplate,
  generateEventCardTemplate,
  generateDatasetCardTemplate,
  generateMapCardTemplate,
  generatePersonCardTemplate,
  generateBibliographicResourceCardTemplate,
  generateOrganizationCardTemplate,
  generateAphiaCardTemplate,
  generateProjectCardTemplate,
  generateCollectionCardTemplate,
} from "./Templates";
import { generateDefaultCardTemplate } from "./DefaultTemplateGenerator";
import "./css/mia.css";

// make maiproperties an interface
interface MIAProperties {
  card: boolean;
  decorator: boolean;
  update: boolean;
  ellipsis: boolean;
}

export default class AffordanceEntity {
  private static activeEntity: AffordanceEntity | null = null;
  private element: any;
  private link: string;
  private collected_info: Entity;
  private derefinfocollector: DerefInfoCollector;
  private scheduler?: ICollectingScheduler;
  private initial_updated: boolean = false;
  private isCancelled: boolean = false;
  private miaproperites: MIAProperties = {
    card: true,
    decorator: true,
    update: true,
    ellipsis: false,
  };

  constructor(affordance: any, derefinfocollector: DerefInfoCollector, scheduler?: ICollectingScheduler) {
    // console.debug(typeof affordance);
    // console.debug("Affordance Entity initialised");
    this.element = affordance;
    this.link = affordance.href;
    this.collected_info = new Entity();
    this.derefinfocollector = derefinfocollector;
    this.scheduler = scheduler;
    this.miaproperites = GetMIAOptionsHTMLElement(this.element);
    this._update_dom_uri();
  }

  async onHover() {
    this.element.addEventListener("mouseover", async (event: MouseEvent) => {
      // Cancel the previous active entity's hover effect
      if (
        AffordanceEntity.activeEntity &&
        AffordanceEntity.activeEntity !== this
      ) {
        AffordanceEntity.activeEntity.cancelHoverEffect();
      }

      // Set this entity as the active one
      AffordanceEntity.activeEntity = this;
      this.isCancelled = false;

      if (this.incardview(event)) {
        // console.debug("card already in view");
        return;
      }

      // Remove all other cards
      this._remove_card();
      
      // Show skeleton card immediately for better user experience
      this.produce_HTML_skeleton_card(event);
      
      // Also show link loader for backward compatibility
      this.produce_HTML_loader();
      
      if (
        this.collected_info.content === undefined ||
        Object.keys(this.collected_info.content).length === 0
      ) {
        // console.debug("no info collected yet");

        try {
          // Use prioritized scheduling if available, otherwise fallback to direct collection
          if (this.scheduler && this.scheduler.prioritizeAffordance) {
            await this.scheduler.prioritizeAffordance(this);
          } else {
            await this.collectInfo();
          }
          
          if (this.isCancelled) return;
          this.collected_info.content =
            this.derefinfocollector.cashedInfo[this.link];
          this.replace_skeleton_with_content(event);
        } catch (error) {
          if (this.isCancelled) return;
          console.debug(error);
          this.removeLoader();
          this._remove_card(); // Remove skeleton card on error
          // on error also remove the conflunce_box class from the element
          if (this.miaproperites.decorator) {
            this.element.classList.remove("confluence_box");
            this.disableMIAfunctionality();
          }
        }
        return;
      }
      this.replace_skeleton_with_content(event);
    });
  }

  getLink(): string {
    return this.link;
  }

  disableMIAfunctionality() {
    // Remove the hover effect on the element
    this.element.removeEventListener("mouseover", () => {});
    // Remove the loader from the element
    this.element.classList.remove("confluence_box_loading");
    // Remove the confluence_box class from the element
    this.element.classList.remove("confluence_box");
    // Remove the no-decorator-loader class from the element
    this.element.classList.remove("no-decorator-loader");

    //set the miaproperites to false
    this.miaproperites.card = false;
    this.miaproperites.decorator = false;
    this.miaproperites.update = false;
    this.miaproperites.ellipsis = false;
  }

  cancelHoverEffect() {
    // Implement the logic to cancel the hover effect
    this.isCancelled = true;
    // Implement the logic to cancel the hover effect
    this._remove_card();
    this.removeLoader();
    // console.debug("Hover effect cancelled for", this.link);
  }

  incardview(event: MouseEvent): boolean {
    //check if the card is already in view
    let link_id = this.link.replace(/\//g, "-");

    let x = event.clientX;
    let y = event.clientY;

    let card_bbox = document
      .querySelector(".marine_info_affordances")
      ?.getBoundingClientRect();
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
      document.querySelector(".marine_info_affordances") !== null &&
      document.getElementById(link_id) !== null
    ) {
      return true;
    }
    return false;
  }

  removeLoader() {
    // remove the confleunce_box_loading class from the element
    this.element.classList.remove("confluence_box_loading");
    // check if the closest parent element has the mia-extra-properties attribute set to noupdate
    // if it does then don't add the confluence_box class
    if (
      this.miaproperites.update === false ||
      this.miaproperites.decorator === false
    ) {
      this.element.classList.remove("no-decorator-loader");
      return;
    }
    this.element.classList.add("confluence_box");
  }

  async collectInfo() {
    try {
      //function to collect info
      // console.debug("collecting info for " + this.link);

      // there is a special case where the this.link is a doc version of marineinfo
      if (this.link.includes("marineinfo.org/doc/")) {
        console.warn("Special case for marineinfo document version");
        //make the this.link into a id one by replaceing marineinfo.org/doc/ with marineinfo.org/id/
        this.link = this.link.replace("marineinfo.org/doc/", "marineinfo.org/id/");
        console.debug("new link: ", this.link);
      }

      //this one is also needed since there are 2 ways to trigger this
      // via the hover effect or via the scheduler
      if (
        this.derefinfocollector.cashedInfo[this.link] === undefined ||
        Object.keys(this.derefinfocollector.cashedInfo[this.link]).length === 0
      ) {
        await this.derefinfocollector.collectInfo(this.link);
        // expose the collected info to the window object for debugging
        (window as any).derefinfocollector = this.derefinfocollector;
        this.collected_info.content =
          this.derefinfocollector.cashedInfo[this.link];
        return;
      }
      if (Object.keys(this.collected_info.content).length !== 0) {
        // console.debug("info already collected");
        return;
      }
    } catch (error) {
      console.error("Error collecting info:", error);
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
    // console.info("element: ", element);
    // console.debug("miaExtraPropertiesArray: ", this.miaproperites);

    //if the element href contains marineinfo or marineregions in it
    //add class confluence_box to element if not already there

    // if the element has a class named retrieveMIA then add it
    // Special case for marinespecies.org taxdetails links
    if (
      this.element.classList.contains("retrieveMIA") ||
      this.link.includes("marineinfo.org") ||
      this.link.includes("marineregions.org") ||
      this.link.includes("aphia.org") ||
      this.link.includes("vocab.nerc") ||
      this.link.includes("zenodo.org") ||
      this.link.includes("doi.org") ||
      this.link.includes("orcid.org")
    ) {
      // console.info("starting to update dom for uri: ", this.link);
      // check if any parent element has the mia-extra-properties attribute set to nochange
      // nochange can be set on any parent element to prevent the element from being changed
      // eg: <div mia-extra-properties="nochange"><a>text</a></div>
      // eg: <a mia-extra-properties="nochange">text</a>
      // mia-properties are : card, decorator, update, ellipsis as boolean values

      // One edge case here is the vocabserver wedwidget since this does not create a child node but a sibling node
      // This prevents the nochange attribute from being set on the parent node not to have any effect
      // for this a seperate check is needed
      // the element must be checked if any of the parent elements have a tag that contain vaadin
      // eg: <vaadin-*></vaadin-*> like <a><vaadin-button></vaadin-button></a>
      // TODO: decide if this should be nochange or noupdate to still allow the element to be updated
      if (element.closest("[id^=vaadin]") !== null) {
        return;
      }

      if (this.miaproperites.decorator) {
        element.classList.add("confluence_box");
      }

      if (!this.miaproperites.card) {
        return;
      }
      this.onHover();

      if (!this.initial_updated) {
        if (!this.miaproperites.update) {
          this.initial_updated = true;
          return;
        }
        // check every 1 second if there is any cashed info
        const intervalId = setInterval(() => {
          // if the cashed info is not empty, update the dom
          if (
            this.derefinfocollector.cashedInfo[this.link] !== undefined &&
            Object.keys(this.derefinfocollector.cashedInfo[this.link])
              .length !== 0
          ) {
            // console.debug("updating dom");
            let collected_info = this.derefinfocollector.cashedInfo[this.link];
            //change the inner html of the element
            //this should be either the title or name key of the collected info
            let content = collected_info[Object.keys(collected_info)[0]];
            // console.info("content for updating uri: ", collected_info);
            //first check if there are special keys for the type
            if (
              this.type_to_keys[Object.keys(collected_info)[0]] !== undefined
            ) {
              //get all the keys and map them on the content
              let to_display_content = [];
              for (let key in this.type_to_keys[
                Object.keys(collected_info)[0]
              ]) {
                try {
                  to_display_content.push(
                    content[
                      this.type_to_keys[Object.keys(collected_info)[0]][key]
                    ]
                  );
                } catch (error) {
                  // console.debug("key not found");
                  continue;
                }
              }

              //update inner html
              this._update_inner_html(to_display_content.join(" "), element);
            } else if (content.name !== undefined && content.name !== "") {
              this._update_inner_html(content.name, element);
            } else if (content.title !== undefined && content.title !== "") {
              this._update_inner_html(content.title, element);
            }
            this.initial_updated = true;
            clearInterval(intervalId); // Stop the interval
          }
        }, 1000);
      }
    }
  }

  private _update_inner_html(content: any, element: HTMLElement) {
    //get the length of the inner html
    let inner_html_length = element.innerHTML.length;
    // console.debug("innerHTML: ", element.innerHTML);
    // console.debug("inner_html_length:", inner_html_length);
    // console.debug("content: ", content);
    // console.debug("content length: ", content.length);

    //if ellipse is true then check if the new content is longer than the inner html
    //if it is then add ellipse to the inner html
    if (this.miaproperites.ellipsis) {
      if (inner_html_length < content.length) {
        // the content length is the length of the inner html
        let content_substring = content.substring(0, inner_html_length - 1);
        // console.debug("content_substring: ", content_substring);
        element.innerHTML = content_substring + "...";
        // set the title of the element to the full content
        element.title = content;
      } else {
        element.innerHTML = content;
      }
    } else {
      element.innerHTML = content;
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
      aphia_worms: generateAphiaCardTemplate,
      project: generateProjectCardTemplate,
      collection: generateCollectionCardTemplate,
      default: generateDefaultCardTemplate,
      concept: generateInfoCardTemplate,
    };
    let toreturn = mapping[name];
    if (toreturn === undefined) {
      // console.debug("template not found");
      return generateDefaultCardTemplate;
    }
    return mapping[name];
  }

  private async _replace_urls_with_favicons_card(
    content: any,
    card: HTMLDivElement
  ) {
    // this function will check a given HTML content for URLs and replace them with favicons
    // convention rule here is that the URL that should be replaced should be an img tag with alt text "external link"
    // the URL to get is the href of the parent a tag

    // get all the img tags in the card
    let img_tags = card.querySelectorAll("img");
    // loop through all the img tags
    for (let i = 0; i < img_tags.length; i++) {
      // check if the alt text is "external link"
      if (img_tags[i].alt === "external link") {
        // get the href of the parent a tag
        let url = img_tags[i].parentElement?.getAttribute("href");
        // check if the url is not empty
        if (url !== null) {
          // get the favicon of the url
          if (url !== undefined) {
            let favicon: string = await this._get_favicon(url);
            // set the src of the img tag to the favicon
            // if favicon does not contain the string favicon then don't replace the image
            //console.debug("favicon", favicon);
            if (favicon.includes("favicon")) {
              img_tags[i].src = favicon;
            }
          }
        }
      }
    }
  }

  private async _get_favicon(url: string) {
    // This function will get the favicon of a given URL by trying multiple endpoints
    // It first tries to get a higher resolution favicon and then falls back to /favicon.ico
    // If no favicon is found, a default favicon is used
    // The function returns the favicon URL
    // If no favicon is found, return the default favicon URL
    const sizes = [512, 256, 128];
    for (const size of sizes) {
      try {
        const response = await fetch(
          `https://www.google.com/s2/favicons?sz=${size}&domain=${url}`
        );
        if (response.status === 200) {
          return `https://www.google.com/s2/favicons?sz=${size}&domain=${url}`;
        }
      } catch (error) {
        // Continue to the next size
      }
    }
    // If no favicon is found, return the default favicon URL
    return "https://www.google.com/s2/favicons?sz=128&domain=" + url;
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
    //console.debug("affordance_position_top", affordance_position_top);
    //console.debug("current_window_height", current_window_height);
    //console.debug("current_window_width", current_window_width);
    //console.debug("scrolled_height", scrolled_height);
    //console.debug("scrolled_width", scrolled_width);
    //console.debug("affordance_position", affordance_position);
    //console.debug("card_clientHeight", card.clientHeight);

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
    // console.debug("producing HTML view");
    this.removeLoader();
    // console.debug(this.collected_info);

    let affordance_link = this.link;

    //make id for modal based on the link
    let card_id = this.link.replace(/\//g, "-");
    //check if modal already exists
    if (document.getElementById(card_id) !== null) {
      // console.debug("card already exists");
      return;
    }

    //get card type for right template
    let template_name = Object.keys(this.collected_info.content)[0];
    // console.debug(template_name);

    //create card
    let card = document.createElement("div");
    card.className = "marine_info_affordances fade-in";
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

    // Add common event listeners
    this._add_card_event_listeners(card, event);

    // Add card to body
    document.body.appendChild(card);

    //check all the links in the card and replace them with favicons
    this._replace_urls_with_favicons_card(this.collected_info, card);
  }

  /**
   * Add common event listeners to popup cards
   */
  private _add_card_event_listeners(card: HTMLDivElement, event: MouseEvent) {
    // Add animation end listener
    card.addEventListener("animationend", () => {
      card.classList.remove("fade-in");
      card.classList.add("fade-in-done");
    });

    // Add mouse leave listener
    card.addEventListener("mouseleave", () => {
      setTimeout(() => {
        if (
          document.querySelector(".marine_info_affordances:hover") === null &&
          this.link !== window.location.href
        ) {
          this._remove_card();
        }
      }, 1000);
    });

    // Add click listener for triangle close
    card.addEventListener("click", function (e) {
      var rect = card.getBoundingClientRect();
      var isInTriangle =
        e.clientX > rect.right - 20 && e.clientY < rect.top + 20;
      // Could add close functionality here if needed
    });

    // Add global click listener to close card when clicking outside
    const globalClickHandler = (event: Event) => {
      if (document.querySelector(".marine_info_affordances:hover") === null) {
        this._remove_card();
        document.removeEventListener("click", globalClickHandler);
      }
    };
    document.addEventListener("click", globalClickHandler);
  }

  private _remove_card() {
    let card = document.querySelectorAll(".marine_info_affordances");
    for (let i = 0; i < card.length; i++) {
      card[i].classList.add("fade-out");
      card[i].addEventListener("animationend", () => {
        card[i].remove();
      });
    }
  }

  produce_HTML_loader() {
    // console.debug("producing HTML loader");
    //check if the link already has a loader
    // by checking for the confluence_box_loading class

    if (this.miaproperites.card === false) {
      return;
    }

    let loader = document.querySelector(".confluence_box_loading");
    if (loader !== null) {
      return;
    }
    //create loader by adding confluence_box_loading class to this.element
    this.element.classList.remove("confluence_box");

    if (this.miaproperites.decorator === false) {
      //produce a different loader
      this.element.classList.add("no-decorator-loader");
      return;
    }

    this.element.classList.add("confluence_box_loading");
  }

  /**
   * Create a skeleton popup card with loading spinner immediately on hover
   */
  produce_HTML_skeleton_card(event: MouseEvent) {
    console.debug("producing HTML skeleton card");
    
    let affordance_link = this.link;
    let card_id = this.link.replace(/\//g, "-") + "-skeleton";
    
    // Check if skeleton card already exists
    if (document.getElementById(card_id) !== null) {
      return;
    }

    // Remove any existing cards first
    this._remove_card();

    // Create skeleton card
    let card = document.createElement("div");
    card.className = "marine_info_affordances fade-in";
    card.id = card_id;
    card.classList.add("card", "skeleton-card");
    card.style.position = "absolute";

    // Create skeleton content with spinner
    let skeletonContent = `
      <div class="marine_info_affordances-skeleton">
        <div class="marine_info_affordances-spinner">
          <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
        <div class="marine_info_affordances-skeleton-header">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-subtitle"></div>
        </div>
        <div class="marine_info_affordances-skeleton-body">
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-text short"></div>
        </div>
      </div>
    `;
    
    card.innerHTML = skeletonContent;

    // Temporarily append to DOM to get dimensions, but make it invisible
    card.style.visibility = "hidden";
    card.style.opacity = "0";
    document.body.appendChild(card);

    // Now that it has content and is in DOM, we can calculate position
    card = this._generate_card_placement(card, event);

    // Make it visible with animation
    card.style.visibility = "visible";
    card.style.opacity = "1";

    // Add event listeners for card behavior
    this._add_card_event_listeners(card, event);
  }

  /**
   * Replace skeleton card with actual content
   */
  replace_skeleton_with_content(event: MouseEvent) {
    let card_id = this.link.replace(/\//g, "-") + "-skeleton";
    let skeletonCard = document.getElementById(card_id);
    
    if (skeletonCard) {
      // Remove skeleton card
      skeletonCard.remove();
    }
    
    // Create actual content card
    this.produce_HTML_view(event);
  }
}

function GetMIAOptionsHTMLElement(element: HTMLElement) {
  //set default options for the element
  let options = {
    card: true,
    decorator: true,
    update: true,
    ellipsis: true,
  };

  // get the mia-extra-properties attribute from the element
  let arrayMiaExtraProperties = element.getAttribute("mia-extra-properties");

  // get the mia-extra-properties attribute from the body element
  let bodyMiaExtraProperties = document.body.getAttribute(
    "mia-extra-properties"
  );

  // if they are not empty then push the unique values to the array and return it
  let bodyproperties: string[] = [];
  let miaExtraPropertiesArray = [];
  if (arrayMiaExtraProperties !== null) {
    miaExtraPropertiesArray.push(arrayMiaExtraProperties);
  }
  if (bodyMiaExtraProperties !== null) {
    // split the values by space
    // remove other whitespace if needed
    let bodyMiaExtraPropertiesArray = bodyMiaExtraProperties.split(" ");
    bodyMiaExtraPropertiesArray.forEach((property) => {
      if (!bodyproperties.includes(property)) {
        bodyproperties.push(property);
      }
    });
  }

  // map the values to the options
  // first set the options depending on the body properties
  // then overwrite the options by looking at the element properties
  // body elements are : nochange, nodecorator, noupdate, ellipsis

  for (let i = 0; i < bodyproperties.length; i++) {
    if (bodyproperties[i] === "nochange") {
      options.card = false;
      options.update = false;
      options.decorator = false;
    }
    if (bodyproperties[i] === "nodecorator") {
      options.decorator = false;
    }
    if (bodyproperties[i] === "noupdate") {
      options.update = false;
    }
    if (bodyproperties[i] === "ellipsis") {
      options.ellipsis = true;
    }
  }

  // then overwrite the options by looking at the element properties
  // options are: nochange, nodecorator, noupdate, ellipsis, noellipsis, update, decorate, change
  for (let i = 0; i < miaExtraPropertiesArray.length; i++) {
    if (miaExtraPropertiesArray[i] === "nochange") {
      options.card = false;
      options.update = false;
      options.decorator = false;
    }
    if (miaExtraPropertiesArray[i] === "nodecorator") {
      options.decorator = false;
    }
    if (miaExtraPropertiesArray[i] === "noupdate") {
      options.update = false;
    }
    if (miaExtraPropertiesArray[i] === "ellipsis") {
      options.ellipsis = true;
    }
    if (miaExtraPropertiesArray[i] === "noellipsis") {
      options.ellipsis = false;
    }
    if (miaExtraPropertiesArray[i] === "update") {
      options.update = true;
    }
    if (miaExtraPropertiesArray[i] === "decorator") {
      options.decorator = true;
    }
    if (miaExtraPropertiesArray[i] === "change") {
      options.card = true;
      options.update = true;
      options.decorator = true;
    }
  }

  return options;
}
