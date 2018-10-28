// Initialize Firebase
var config = {
  apiKey: 'l3TcldnNmr3Yrm6VIEIx7Dc8aE3DB0NCZf4kNC7r',
  databaseURL: 'https://simple-policy.firebaseio.com',
  storageBucket: 'simple-policy.appspot.com'
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
    document.getElementById("loaded-privacy-policy").style.display = "None";

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
            if (document.getElementById("loaded-privacy-policy").style.display != "block") {
                document.getElementById("loaded-standard-site").style.display = "None";
                document.getElementById("loading-site").style.display = "Block";
                document.getElementById("loaded-privacy-policy").style.display = "None";
                display_news_html(dbRefObject);
            }
        } else {
            // Otherwise, display the standard popup
            document.getElementById("loaded-standard-site").style.display = "Block";
            document.getElementById("loading-site").style.display = "None";
            document.getElementById("loaded-privacy-policy").style.display = "None";
        }
    });
}

/* DISPLAY HTML FOR NEWS SITE 
   If a section does not have the corresponding information in the 
   database, that section's display is set to "none" from here. */
function display_news_html(dbRefObject) {
    // Variables to hold database information
    var change_policy; // 1-5 RATING W/ INFO --> NUM == RATING, SUBSEQUENT STRING IS INFO
    var db_date; // DB
    var db_people; // DB
    var db_reported; // DB
    var db_source_titles; // DB
    var db_source_titles; // DBD
    var db_summary; // DB
    var info_access; // 1-5 RATING W/ INFO
    var privacy_link; // LINK/SOURCE TO MORE INFO
    var privacy_link_title; // LINK/SOURCE TITLE FOR MORE INFO
    var what_info; // PURE INFO
    var what_security; // PURE INFO
    var who_share; // 1-5 RATING W/ INFO


    // Variables to hold background colors
    var very_poor_background = "#A31621"; 
    var poor_background = "#BC555D";
    var ok_background = "#D3D3D3";
    var good_background = "#9fC957";
    var very_good_background = "#7CB518";

    // Show name 
    dbRefObject.child("Name").once("value", function (snap) {
        document.getElementById("company-name").innerHTML = snap.val();
        /* Once the first asynchronous function loads, and database is accessed,
        I can show the display of the loading news site */
        document.getElementById("loaded-standard-site").style.display = "None";
        document.getElementById("loading-site").style.display = "None";
        document.getElementById("loaded-privacy-policy").style.display = "Block";
    });

    dbRefObject.child("Info Access").once("value", function (snap) {
        info_access = snap.val();
        if (info_access.substring(0,1) == 1) {
            document.getElementById("info-access-color").style.background = very_poor_background;
        } else if (info_access.substring(0,1) == 2) {
            document.getElementById("info-access-color").style.background = poor_background;
        } else if (info_access.substring(0,1) == 3) {
            document.getElementById("info-access-color").style.background = ok_background;
        } else if (info_access.substring(0,1) == 4) {
            document.getElementById("info-access-color").style.background = good_background;
        } else if (info_access.substring(0,1) == 5) {
            document.getElementById("info-access-color").style.background = very_good_background;
        }
        document.getElementById("info-access-text").innerHTML = info_access.substring(4);
    });

    dbRefObject.child("Who Share").once("value", function (snap) {
        info_access = snap.val();
        if (info_access.substring(0,1) == 1) {
            document.getElementById("who-share-color").style.background = very_poor_background;
        } else if (info_access.substring(0,1) == 2) {
            document.getElementById("who-share-color").style.background = poor_background;
        } else if (info_access.substring(0,1) == 3) {
            document.getElementById("who-share-color").style.background = ok_background;
        } else if (info_access.substring(0,1) == 4) {
            document.getElementById("who-share-color").style.background = good_background;
        } else if (info_access.substring(0,1) == 5) {
            document.getElementById("who-share-color").style.background = very_good_background;
        }
        document.getElementById("who-share-text").innerHTML = info_access.substring(4);
    });

    dbRefObject.child("Change Policy").once("value", function (snap) {
        info_access = snap.val();
        if (info_access.substring(0,1) == 1) {
            document.getElementById("change-policy-color").style.background = very_poor_background;
        } else if (info_access.substring(0,1) == 2) {
            document.getElementById("change-policy-color").style.background = poor_background;
        } else if (info_access.substring(0,1) == 3) {
            document.getElementById("change-policy-color").style.background = ok_background;
        } else if (info_access.substring(0,1) == 4) {
            document.getElementById("change-policy-color").style.background = good_background;
        } else if (info_access.substring(0,1) == 5) {
            document.getElementById("change-policy-color").style.background = very_good_background;
        }
        document.getElementById("change-policy-text").innerHTML = info_access.substring(4);
    });

    // DB SECTION -- SKIPPED IF DATE == NONE (THEN NO BREACH WAS FOUND)

    // DB Date
    dbRefObject.child("DB Date").once("value", function (snap) {
        db_date = snap.val();
        if (db_date == "None") {
            document.getElementById("db-breach").style.display = "None";
            document.getElementById("db-date-header").style.display = "None";
            document.getElementById("db-date").style.display = "None";
        } else {
            document.getElementById("db-date").innerHTML = db_date;
        }
    });

    // DB Reported
    dbRefObject.child("DB Reported").once("value", function (snap) {
        db_reported = snap.val();
        if (db_reported == "None") {
            document.getElementById("db-reported-header").style.display = "None";
            document.getElementById("db-reported").style.display = "None";
        } else {
            document.getElementById("db-reported").innerHTML = db_reported;
        }
    });
    
    // DB People
    dbRefObject.child("DB People").once("value", function (snap) {
        db_people = snap.val();
        if (db_people == "None") {
            document.getElementById("db-people-header").style.display = "None";
            document.getElementById("db-people").style.display = "None";
        } else {
            document.getElementById("db-people").innerHTML = db_people;
        }
    });

    // DB Summary
    dbRefObject.child("DB Summary").once("value", function (snap) {
        db_summary = snap.val();
        if (db_summary == "None") {
            document.getElementById("db-summary-header").style.display = "None";
            document.getElementById("db-summary-text").style.display = "None";
        } else {
            document.getElementById("db-summary-text").innerHTML = db_summary;
        }
    });

    /* Add sources in sequentially after separating by semicolon and adding
       a links from JavaScript into #db-sources span tags from HTML */
    dbRefObject.child("DB Sources").once("value", function (snap) {
        db_source_links = snap.val() + "";
        if (db_source_links == "None") {
            document.getElementById("db-sources-header").style.display = "None";

        // Check if #db-sources has child elements (as sources might have already been added)
        } else if (!document.getElementById("db-sources").hasChildNodes()) {
            // The source titles I'll need for the newly created elements
            dbRefObject.child("DB Source Titles").once("value", function (snap) {
                db_source_titles = snap.val();

                // Split the sources based on semicolon placement
                var new_source_link = db_source_links.split(" ; "); // Separate the different source links
                var new_source_title = db_source_titles.split(" ; "); // Same, with source titles

                // Cycle through sources until all gone
                for (var i = 0; i < new_source_link.length; i++) {
                    var source_element = document.createElement("a"); // The actual HTML "a" element

                    source_element.appendChild(document.createTextNode(new_source_title[i])); //adding title/text_node to source_element
                    source_element.href = new_source_link[i];
                    source_element.setAttribute("target", "_blank");

                    // Add source_element to HTML doc
                    document.getElementById("db-sources").appendChild(source_element);

                    // If not the last element, add a comma to separate links
                    if (i != new_source_link.length - 1) {
                        var comma_element = document.createElement("span");
                        comma_element.appendChild(document.createTextNode(", "));
                        comma_element.style.color = "black";
                        document.getElementById("db-sources").appendChild(comma_element);
                    }
                }

            });
        }
    });

    /* ADDING IN ACCOUNT INFO & SECURITY TOOLTIPS */
    // Account Info Collected
    dbRefObject.child("What Info").once("value", function (snap) {
        what_info = snap.val();
        if (what_info == "None") {
            document.getElementById("what-info-tooltip").style.display = "None";
            document.getElementById("what-info-text").style.display = "None";
        } else {
            document.getElementById("what-info-text").innerHTML = what_info;
        }
    });
    // Security in Place
    dbRefObject.child("What Security").once("value", function (snap) {
        what_security = snap.val();
        if (what_security == "None") {
            document.getElementById("what-security-tooltip").style.display = "None";
            document.getElementById("what-security-text").style.display = "None";
        } else {
            document.getElementById("what-security-text").innerHTML = what_security;
        }
    });
    
    /* Add sources in sequentially after separating by semicolon and adding
    a links from JavaScript into #privacy-link span tags from HTML */
    dbRefObject.child("Privacy Link").once("value", function (snap) {
        privacy_link = snap.val() + "";
        if (privacy_link == "None") {
            document.getElementById("privacy-link-header").style.display = "None";

            // Check if #privacy-link has child elements (as sources might have already been added)
        } else if (!document.getElementById("privacy-link").hasChildNodes()) {
            // The source titles I'll need for the newly created elements
            dbRefObject.child("Privacy Link Title").once("value", function (snap) {
                privacy_link_title = snap.val();

                // Split the sources based on semicolon placement
                var new_source_link = privacy_link.split(" ; "); // Separate the different source links
                var new_source_title = privacy_link_title.split(" ; "); // Same, with source titles

                // Cycle through sources until all gone
                for (var i = 0; i < new_source_link.length; i++) {
                    var source_element = document.createElement("a"); // The actual HTML "a" element

                    source_element.appendChild(document.createTextNode(new_source_title[i])); //adding title/text_node to source_element
                    source_element.href = new_source_link[i];
                    source_element.setAttribute("target", "_blank");

                    // Add source_element to HTML doc
                    document.getElementById("privacy-link").appendChild(source_element);

                    // If not the last element, add a comma to separate links
                    if (i != new_source_link.length - 1) {
                        var comma_element = document.createElement("span");
                        comma_element.appendChild(document.createTextNode(", "));
                        comma_element.style.color = "black";
                        document.getElementById("privacy-link").appendChild(comma_element);
                    }
                }

            });
        }
    });
}