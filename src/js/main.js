var r2r = (function (my, window, document)
{
    var currentPoints = 0;
    var currentRank = 0;

    my.initialize = function ()
    {
        my.map = new r2r.Map(mapHandler);
        my.search = new r2r.Search();
        my.scores = new r2r.Scores();

        displayHighScores();

        document.getElementById("play-from-input").focus();
    }

    my.saveHighScore = function ()
    {
        // save high score
        var user = document.getElementById("play-congrats-name").value;
        var placeFrom = r2r.map.autocompleteFrom.getPlace();
        var placeTo = r2r.map.autocompleteTo.getPlace();
        r2r.scores.addScore(user, placeFrom, placeTo, currentPoints);

        // display scores
        hideCongrats();
        displayHighScores();
    }

    my.skipHighScore = function ()
    {
        hideCongrats();
    }

    function mapHandler()
    {
        var placeFrom = r2r.map.autocompleteFrom.getPlace();
        var placeTo = r2r.map.autocompleteTo.getPlace();

        if (placeFrom && placeFrom.geometry && placeTo && placeTo.geometry)
        {
            setSummaryText("Searching...");
            setScoreText("", "");

            r2r.search.start(placeFrom, placeTo, searchHandler);
        }
    }

    function searchHandler(response)
    {
        if (response.routes && response.routes.length > 0)
        {
            r2r.map.drawRoute(response, response.routes[0]);

            displayRouteSummary(response, response.routes[0]);
            displayRouteScore(resizeBy, response.routes[0]);
            displayHighScores();
        }
    }

    function setScoreText(rankText, pointsText)
    {
        document.getElementById("play-score").innerHTML = "<table><tr><td class='play-score-left'>" + rankText + "</td><td class='play-score-right'>" + pointsText + "</td></tr></table>";
    }

    function setSummaryText(text)
    {
        document.getElementById("play-summary").innerText = text;
    }

    function displayHighScores()
    {
        var html = "<table>";

        for (var index = 0; index < 15; index++)
        {
            var score = r2r.scores.getScore(index);
            if (score == null) break;

            html += "<tr><td class='play-score-left'>" + score.user + "</td><td class='play-score-right'>" + score.points + "pts</td></tr>";
        }

        html += "</table>";

        document.getElementById("play-leaders").innerHTML = html;
    }

    function displayRouteScore(response, route)
    {
        // calculate points (and store for later)
        currentPoints = my.scores.calculatePoints(response, route);
        currentRank = my.scores.calculateIndex(currentPoints) + 1;

        // display rank and score
        var rankText = getRankText(currentRank);
        var pointsText = getPointsText(currentPoints);
        setScoreText(rankText, pointsText);

        // store high score
        if (currentRank <= 10)
        {
            displayCongrats(response, route);
        }
    }

    function displayCongrats(response, route)
    {
        var div = document.getElementById("play-congrats");

        var p0 = div.getElementsByTagName("p")[0];
        p0.innerText = "Congratulations, you are ranked " + getRankText(currentRank) + "!";

        div.style.display = "block";

        document.getElementById("play-congrats-name").focus();
    }

    function hideCongrats()
    {
        document.getElementById("play-congrats").style.display = "none";
        document.getElementById("play-from-input").focus();
    }

    function displayRouteSummary(response, route)
    {
        var durationSummary = getDurationSummary(response, route);
        var distanceSummary = getDistanceSummary(response, route);
        var vehicleSummary = getVehicleSummary(response, route);

        var summaryText = durationSummary + " " + distanceSummary + " " + vehicleSummary;

        setSummaryText(summaryText);
    }

    function getDurationSummary(response, route)
    {
        return parseInt(route.duration / 60) + "h" + parseInt(route.duration % 60) + "m";
    }

    function getDistanceSummary(response, route)
    {
        return parseInt(route.distance) + "km";
    }

    function getVehicleSummary(response, route)
    {
        var vehicles = [];

        for (var s = 0; s < route.segments.length; s++)
        {
            var segment = route.segments[s];

            getSegmentVehicles(vehicles, segment);
        }

        return vehicles;
    }

    function getSegmentVehicles(vehicles, segment)
    {
        if (segment.itineraries)
        {
            var itinerary = segment.itineraries[0];

            for (var l = 0; l < itinerary.legs.length; l++)
            {
                var leg = itinerary.legs[l];

                for (var h = 0; h < leg.hops.length; h++)
                {
                    var hop = leg.hops[h];

                    if (hop.lines)
                    {
                        var line = hop.lines[0];
                        vehicles.push(line.vehicle);
                    }
                    else if (segment.kind == "flight")
                    {
                        vehicles.push("plane");
                    }
                }
            }
        }
        else if (segment.vehicle)
        {
            vehicles.push(segment.vehicle);
        }
        else
        {
            switch (segment.kind)
            {
                case "car": vehicles.push("car"); break;
                case "taxi": vehicle.push("taxi"); break;
                case "flight": vehicle.push("plane"); break;
            }
        }
    }

    function getRankText(rank)
    {
        if (rank % 10 == 1)
        {
            return rank + "st";
        }
        else if (rank % 10 == 2)
        {
            return rank + "nd";
        }
        else if (rank % 10 == 3)
        {
            return rank + "rd";
        }

        return rank + "th";
    }

    function getPointsText(points)
    {
        return points + "pts";
    }

    return my;

} (r2r || {}, window, document));