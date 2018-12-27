const jsdom = require("jsdom");
const fs = require("fs");
const { JSDOM } = jsdom;

const options = {
    pretendToBeVisual: true
};

let pages = new Array();
let i = 0;
let maxPage = 1;
async function getAllPages() {
    while (i < maxPage) {
        console.log("Fetching page " + i);
        pages[i] = await JSDOM.fromURL("https://www.amazon.com/ga/giveaways?pageId=" + (i + 1), options);
        if (i == 0) {
            const pageButtons = pages[0].window.document.querySelector(".a-pagination").children;
            maxPage = pageButtons[pageButtons.length - 2].children[0].innerHTML;
            console.log("Found " + maxPage + " pages");
        }
        i++;
    }

    let container = pages[0].window.document.querySelector("#giveaway-grid");
    for (let j = 1; j < i; j++) {
        let items = pages[j].window.document.querySelectorAll(".giveawayItemContainer");
        items.forEach(item => {
            let info = item.querySelector(".giveawayParticipationInfoContainer");
            let details = item.querySelector(".giveAwayItemDetails");
            if (info && info.innerHTML.indexOf("Follow") === -1 && details.innerHTML.indexOf("(Kindle Edition)") === -1) {
                container.appendChild(item);
            }
        });
    }

    pages[0].window.document.querySelector("#giveaway-result-info-bar-content").innerHTML = "Merged " + i + " pages for " + container.children.length + " items";

    fs.writeFileSync("./super.html", pages[0].serialize());
}

getAllPages();