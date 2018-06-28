// Initialize Firebase
var config = {
  apiKey: 'AIzaSyDmCjNQb6z9kwwwKP9XqWO1le9gy2W-MD4',
  databaseURL: 'https://media-bias-exposer.firebaseio.com',
  storageBucket: 'media-bias-exposer.appspot.com'
};
firebase.initializeApp(config);

/* This is a list of subdomain cases that require the 'third' element of the 
array to be accessed to determine the correct domain for the database */
var subdomain_cases = ["go,com","co,uk"];

// When window loads, update app
window.onload = function () {
    // Set the app to standard display settings (loading symbol)
    document.getElementById("loaded-standard-site").style.display = "None";
    document.getElementById("loading-site").style.display = "Block";
    document.getElementById("loaded-news-site").style.display = "None";

    chrome.tabs.query({ "active": true, "lastFocusedWindow": true }, function (tabs) {
        var base_url = (new URL(tabs[0].url)).hostname; // stores URL hostname in base_url

        base_url = base_url.split("."); // Splits components based on '.' location
        var shortened_base_url = [base_url[base_url.length - 2], base_url[base_url.length - 1]]; // gets last two array values
        // catch exceptions such as 'co.uk' domains (dailymail.co.uk) or 'abcnews.go.com'
        if (subdomain_cases.includes(shortened_base_url.toString())) {
            shortened_base_url = [base_url[base_url.length - 3], base_url[base_url.length - 2], base_url[base_url.length - 1]];
        }
        base_url = shortened_base_url.join(","); // re-joins base_url with ',' to allow database usability

        // The URL object that holds information about the organization
        const dbRefObject = firebase.database().ref().child(base_url);
        /* Determine if need to update logo/icon or entire popup depending on
           whether popup is currently open */
        
        update_popup(dbRefObject);
    });
}

// When tab changes, update app
chrome.tabs.onActivated.addListener(function () {
    update_logo();
});
// When URL on same tab changes, update app
chrome.tabs.onUpdated.addListener(function () {
    update_logo();
});

function update_logo() {
    /* Get base URL of the current tab, get database reference using URL
       as a key */
    chrome.tabs.query({ "active": true, "lastFocusedWindow": true }, function (tabs) {
        var base_url = (new URL(tabs[0].url)).hostname; // stores URL hostname in base_url

        base_url = base_url.split("."); // Splits components based on '.' location
        var shortened_base_url = [base_url[base_url.length - 2], base_url[base_url.length - 1]]; // gets last two array values
        // catch exceptions such as 'co.uk' domains (dailymail.co.uk) or 'abcnews.go.com'
        if (subdomain_cases.includes(shortened_base_url.toString())) {
            shortened_base_url = [base_url[base_url.length - 3], base_url[base_url.length - 2], base_url[base_url.length - 1]];
        }
        base_url = shortened_base_url.join(","); // re-joins base_url with ',' to allow database usability
        
        // The URL object that holds information about the organization
        const dbRefObject = firebase.database().ref().child(base_url);

        // Add different images and sizes accordingly
        dbRefObject.child("Bias Rating").once("value", function (snap) {
            if (snap.val() == "Left") {
                chrome.browserAction.setIcon({
                    path: {
                        "16": "images/left-16.png",
                        "32": "images/left-32.png",
                        "48": "images/left-48.png",
                        "64": "images/left-64.png",
                        "128b": "images/left-128.png"
                    }
                });
            } else if (snap.val() == "Left-Center") {
                chrome.browserAction.setIcon({
                    path: {
                        "16": "images/left-center-16.png",
                        "32": "images/left-center-32.png",
                        "48": "images/left-center-48.png",
                        "64": "images/left-center-64.png",
                        "128b": "images/left-center-128.png"
                    }
                });
            } else if (snap.val() == "Center") {
                chrome.browserAction.setIcon({
                    path: {
                        "16": "images/center-16.png",
                        "32": "images/center-32.png",
                        "48": "images/center-48.png",
                        "64": "images/center-64.png",
                        "128b": "images/center-128.png"
                    }
                });
            } else if (snap.val() == "Right-Center") {
                chrome.browserAction.setIcon({
                    path: {
                        "16": "images/right-Center-16.png",
                        "32": "images/right-Center-32.png",
                        "48": "images/right-Center-48.png",
                        "64": "images/right-Center-64.png",
                        "128b": "images/right-Center-128.png"
                    }
                });
            } else if (snap.val() == "Right") {
                chrome.browserAction.setIcon({
                    path: {
                        "16": "images/right-16.png",
                        "32": "images/right-32.png",
                        "48": "images/right-48.png",
                        "64": "images/right-64.png",
                        "128b": "images/right-128.png"
                    }
                });
            } else {
                // Base logo if URL not in database (not on indexed news site)
                chrome.browserAction.setIcon({
                    path: {
                        "16": "images/no-bias-news-16.png",
                        "32": "images/no-bias-news-32.png",
                        "48": "images/no-bias-news-48.png",
                        "64": "images/no-bias-news-64.png",
                        "128b": "images/no-bias-news-128.png"
                    }
                });
            }
        });
    });
}

// Access database and return corresponding URL value
function update_popup(dbRefObject) {
    // Changes logo based on bias rating
    dbRefObject.once("value").then(function (snap) {
        // If snap.exists(), URL in database and should display news info
        if (snap.exists()) {
            /* Check if news site isn't already loaded before changing display.
               This also prevents the sources from being added twice, but I added
               a catch in the display_news_html method anyway */
            if (document.getElementById("loaded-news-site").style.display != "block") {
                document.getElementById("loaded-standard-site").style.display = "None";
                document.getElementById("loading-site").style.display = "Block";
                document.getElementById("loaded-news-site").style.display = "None";
                display_news_html(dbRefObject);
            }
        } else {
            // Otherwise, display the standard popup
            document.getElementById("loaded-standard-site").style.display = "Block";
            document.getElementById("loading-site").style.display = "None";
            document.getElementById("loaded-news-site").style.display = "None";
        }
    });
}

/* DISPLAY HTML FOR NEWS SITE 
   If a section does not have the corresponding information in the 
   database, that section's display is set to "none" from here. */
function display_news_html(dbRefObject) {
    // Variables to hold database information
    var bias_rating;
    var bias_example;
    var factual_reporting;
    var notable_awards;
    var parent_company;
    var source_links;
    var source_titles;

    // Show name 
    dbRefObject.child("Name").once("value", function (snap) {
        document.getElementById("company-name").innerHTML = snap.val();
        /* Once the first asynchronous function loads, and database is accessed,
        I can show the display of the loading news site */
        document.getElementById("loaded-standard-site").style.display = "None";
        document.getElementById("loading-site").style.display = "None";
        document.getElementById("loaded-news-site").style.display = "Block";
    });

    // Change background color of #bias-button based on the bias rating
    dbRefObject.child("Bias Rating").once("value", function (snap) {
        bias_rating = snap.val();
        document.getElementById("bias-rating").innerHTML = bias_rating + " Bias";
        if (bias_rating == "Right" || bias_rating == "Right-Center") {
            document.getElementById("bias-button").style.border = "3px solid #f16f65";
            document.getElementById("bias-button").style.color = "#f16f65";
            document.getElementById("bias-rating").style.background = "linear-gradient(135deg, #f6afaa 0%,#f7665b 100%)";
        } else if (bias_rating == "Center") {
            document.getElementById("bias-button").style.border = "3px solid #fca371";
            document.getElementById("bias-button").style.color = "#fca371";
            document.getElementById("bias-rating").style.background = "linear-gradient(135deg, #fad961 0%,#fc8949 100%)";
        } else if (bias_rating == "Left" || bias_rating == "Left-Center") {
            document.getElementById("bias-button").style.border = "3px solid #369bfe";
            document.getElementById("bias-button").style.color = "#369bfe";
            document.getElementById("bias-rating").style.background = "linear-gradient(135deg, #99dfff 0%,#2f95f9 100%)";
        }

    });

    // Set button equal to Bias Example URL, if "None" then change text and link to pre-filled email
    dbRefObject.child("Bias Example").once("value", function (snap) {
        bias_example = snap.val();
        if (bias_example == "None") {
            document.getElementById("bias-example").innerHTML = "Send an Example";
            document.getElementById("bias-button").setAttribute("href", "mailto:research@openlens.net?subject=New Bias Example&body=Please add the URL here: ");
        } else {
            document.getElementById("bias-button").setAttribute("href", bias_example);
        }
    });

    // Factual reporting - change color based on value
    dbRefObject.child("Factual Reporting").once("value", function (snap) {
        factual_reporting = snap.val();
        document.getElementById("factual-reporting").innerHTML = factual_reporting;
        if (factual_reporting == "Very Low") {
            document.getElementById("factual-reporting").style.color = "#A31621";
        } else if (factual_reporting == "Low") {
            document.getElementById("factual-reporting").style.color = "#BC555D";
        } else if (factual_reporting == "Mixed") {
            document.getElementById("factual-reporting").style.color = "#FFA500";
        } else if (factual_reporting == "High") {
            document.getElementById("factual-reporting").style.color = "#9FC957";
        } else if (factual_reporting == "Very High") {
            document.getElementById("factual-reporting").style.color = "#7CB518";
        }
    });

    // Notable awards
    dbRefObject.child("Notable Awards").once("value", function (snap) {
        notable_awards = snap.val();
        if (notable_awards == "None") {
            document.getElementById("notable-awards-header").style.display = "None";
            document.getElementById("notable-awards").style.display = "None";
        } else {
            document.getElementById("notable-awards").innerHTML = notable_awards;
        }
    });

    // Parent company
    dbRefObject.child("Parent Company").once("value", function (snap) {
        parent_company = snap.val();
        if (parent_company == "None") {
            document.getElementById("parent-company-header").style.display = "None";
            document.getElementById("parent-company").style.display = "None";
        } else {
            document.getElementById("parent-company").innerHTML = parent_company;
        }
    });

    /* Add sources in sequentially after separating by semicolon and adding
       a links from JavaScript into #sources span tags from HTML */
    dbRefObject.child("Sources").once("value", function (snap) {
        source_links = snap.val() + "";
        if (source_links == "None") {
            document.getElementById("sources-header").style.display = "None";

        // Check if #sources has child elements (as sources might have already been added)
        } else if (!document.getElementById("sources").hasChildNodes()) {
            // The source titles I'll need for the newly created elements
            dbRefObject.child("Source Titles").once("value", function (snap) {
                source_titles = snap.val();

                // Split the sources based on semicolon placement
                var new_source_link = source_links.split(" ; "); // Separate the different source links
                var new_source_title = source_titles.split(" ; "); // Same, with source titles

                // Cycle through sources until all gone
                for (var i = 0; i < new_source_link.length; i++) {
                    var source_element = document.createElement("a"); // The actual HTML "a" element

                    source_element.appendChild(document.createTextNode(new_source_title[i])); //adding title/text_node to source_element
                    source_element.href = new_source_link[i];
                    source_element.setAttribute("target", "_blank");

                    // Add source_element to HTML doc
                    document.getElementById("sources").appendChild(source_element);

                    // If not the last element, add a comma to separate links
                    if (i != new_source_link.length - 1) {
                        var comma_element = document.createElement("span");
                        comma_element.appendChild(document.createTextNode(", "));
                        comma_element.style.color = "black";
                        document.getElementById("sources").appendChild(comma_element);
                    }
                }

            });
        }
    });
}