var r2r = (function (my, window, document)
{
    var scores = [];
    var maxScores = 100;

    my.Scores = function ()
    {
        scores = JSON.parse(localStorage.getItem("r2r.scores")) || [];
    }

    my.Scores.prototype.calculatePoints = function (response, route)
    {
        var points = 0;

        // one point per 1000km
        points += route.distance / 1000;

        // one point per 10 hours
        points += route.duration / (10 * 60);

        // one point per hop
        var points_per_hop = 1;
        for (var s = 0; s < route.segments.length; s++)
        {
            var segment = route.segments[s];

            if (segment.itineraries)
            {
                var itinerary = segment.itineraries[0];

                for (var l = 0; l < itinerary.legs.length; l++)
                {
                    var leg = itinerary.legs[l];

                    points += leg.hops.length;
                }
            }
            else
            {
                points += 1;
            }
        }

        // round points
        return Math.round(points * 10);
    }

    my.Scores.prototype.calculateIndex = function (points)
    {
        // find location of points
        var index = scores.length - 1;
        for (; index >= 0; index--)
        {
            if (scores[index].points >= points) break;
        }

        // done
        return index + 1;
    }

    my.Scores.prototype.getScore = function (index)
    {
        return (index >= 0 || index < scores.length) ? scores[index] : null;
    }

    my.Scores.prototype.addScore = function (user, fromPlace, toPlace, points)
    {
        // strip html
        user = user.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 30); // 30 chars max


        // create score object
        var from = { name: fromPlace.name, lat: fromPlace.geometry.location.lat(), lng: fromPlace.geometry.location.lng(), kind: fromPlace.types[0] };
        var to = { name: toPlace.name, lat: toPlace.geometry.location.lat(), lng: toPlace.geometry.location.lng(), kind: toPlace.types[0] };
        var score = { user: user, from: from, to: to, points: points };

        // insert into high score list
        var index = this.calculateIndex(points);
        if (index < maxScores)
        {
            scores.splice(index, 0, score);
            scores.splice(maxScores, 1);
        }

        // persist to local storage
        localStorage.setItem("r2r.scores", JSON.stringify(scores));

        // return our score index
        return index;
    }

    return my;

} (r2r || {}, window, document));