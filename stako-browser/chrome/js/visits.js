window.addEventListener("load", init_visits);
const STAKO_API_USER_LOG = STAKO_API_URL + 'user/{}/activity/'

function init_visits() {
    getValidToken(true).then(token => {
        if (!token) {
            alert("You are currently not logged into STAKO or provided incorrect credentials!");
        } else {
            let url = STAKO_API_USER_LOG.replace('{}', token.uuid);
            let headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token.access_token
            });
            let request = new Request(url, {method: 'GET', headers: headers});
            fetch(request)
            .then(response => response.text())
            .then(data => {
                //console.log(data);
                fill_up_data(data);
            })
        }
    });
}

function fill_up_data(activity_data) {
    chrome.storage.local.get({'STAKO_USER': null}, function (user) {
        if(user){
            $('#user_name').text('USER: ' + user['STAKO_USER']['nickname']);
        }
    });
    let acts = JSON.parse(activity_data)['activities'];
    if (acts.length > 0) {
        let current_date = timestampToDate(acts[0].timestamp).toDateString();
        console.log(current_date);
        let dateHTML = ""
        let count = 0;
        var currDay = new Date();
        const milliInDay = 1000*3600*24;
        var slide = document.createElement("div");
        acts.forEach(element => {
            console.log(element);
            console.log(currDay);
            console.log(current_date);
            let date = timestampToDate(element.timestamp);
            if((currDay - new Date(current_date))/milliInDay >= 6.9 ) {
                addWeekToCarousel(slide);
                dateHTML = ""
                slide = document.createElement("div");
                currDay = new Date(current_date);
            }
            if(date.toDateString() == current_date) {
                dateHTML += getEntryHTML(date, element.url);
            } else {
                var accord = document.createElement("div");
                accord.innerHTML = getAccordionCard(dateHTML, ++count, current_date);
                slide.appendChild(accord);
                //addToAccordion(dateHTML, ++count, current_date);
                current_date = date.toDateString();
                dateHTML = getEntryHTML(date, element.url);
            }
        });
        if(dateHTML !== "") {
            var accord = document.createElement("div");
            accord.innerHTML = getAccordionCard(dateHTML, ++count, current_date);
            slide.appendChild(accord);
            addWeekToCarousel(slide);
        }
        //addToAccordion(dateHTML, ++count, current_date);
    } else {
        $('#visits_data').html('<b>There is no logged activity for this week.</b>')
    }
}

function addWeekToCarousel(accordian) {
    var carouselContainer = document.querySelector("#carouselContent > .carousel-inner");
    var slide = document.createElement("div");
    if(carouselContainer.firstElementChild === null) {
        slide.classList.add("active");
    }
    slide.classList.add("carousel-item", "text-center", "p-4");
    slide.append(accordian);
    carouselContainer.append(slide);
}


function getEntryHTML(visit_date, visit_url) {
    return '<li>(' + getFullTime(visit_date) + ') ' + visit_url + '</li>'
}

function timestampToDate(stakoTimestamp) {
    return new Date(parseInt(stakoTimestamp+'000'));
}

function getFullTime(date) {
    return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
}

function addToAccordion(dateHTML, count, current_date){
    let newAccordionCard = getAccordionCard(dateHTML, count, current_date);
    $('#visits_data').html($('#visits_data').html() + newAccordionCard);
    console.log(newAccordionCard);
}

function getAccordionCard(innerHTML, count, dateStr){
    let toReturn = '<div class="card">';
    toReturn += '<div class="card-header" id="heading{}">'.replace('{}', count);
    toReturn += '<h5 class="mb-0">';
    toReturn += '<button class="btn btn-link" data-toggle="collapse" data-target="#collapse{}"'.replace('{}', count) +
        'aria-expanded="false" aria-controls="collapse{}">'.replace('{}', count);
    toReturn += dateStr
    toReturn += '</button>'
    toReturn += '</h5>'
    toReturn += '</div>'
    toReturn += '<div id="collapse{}" class="collapse" aria-labelledby="heading{}" data-parent="#accordion">'
        .replace('{}', count);
    toReturn += '<div class="card-body">';
    toReturn += innerHTML;
    toReturn += '</div></div></div>';
    return toReturn;
}
