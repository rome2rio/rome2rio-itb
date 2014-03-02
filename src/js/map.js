var r2r = (function (my, window, document)
{
    var mapContent = [];

    my.Map = function (callback)
    {
        var mapOptions = {
            center: new google.maps.LatLng(20, 10),
            zoom: 3,
            mapTypeControl: false
        };

        this.map = new google.maps.Map(document.getElementById("play-map"), mapOptions);

        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById("play-from-input"));
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById("play-to-input"));
        this.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(document.getElementById("play-summary"));
        
        this.autocompleteFrom = new google.maps.places.Autocomplete(document.getElementById("play-from-input"));
        this.autocompleteTo = new google.maps.places.Autocomplete(document.getElementById("play-to-input"));

        google.maps.event.addListener(this.autocompleteFrom, "place_changed", callback);
        google.maps.event.addListener(this.autocompleteTo, "place_changed", callback);
    }

    my.Map.prototype.clear = function ()
    {
        for (var m = 0; m < mapContent.length; m++)
        {
            mapContent[m].setMap(null);
        }

        mapContent = [];
    }

    my.Map.prototype.drawRoute = function (response, route)
    {
        this.clear();

        drawRouteMarkers(this.map, response, route);
        drawRoutePath(this.map, response, route);
        zoomToRoutePath(this.map, response, route);
    }

    function drawRouteMarkers(map, response, route)
    {
        for (var s = 0; s < route.stops.length; s++)
        {
            var stop = route.stops[s];
            var pos = getLatLng(stop.pos);
            var icon = "http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_gray.png";
            var marker = new google.maps.Marker({ position: pos, icon: icon, map: map, title: stop.name });

            mapContent.push(marker);
        }
    }

    function drawRoutePath(map, response, route)
    {
        for (var s = 0; s < route.segments.length; s++)
        {
            var segment = route.segments[s];
            var geodesic = getPathGeodesic(segment);
            var color = getPathColor(segment);

            var path = [];
            if (segment.path)
            {
                path = google.maps.geometry.encoding.decodePath(segment.path);
            }
            else if (segment.itineraries)
            {
                var itinerary = segment.itineraries[0];

                for (var l = 0; l < itinerary.legs.length; l++)
                {
                    var leg = itinerary.legs[l];

                    for (var h = 0; h < leg.hops.length; h++)
                    {
                        var hop = leg.hops[h];

                        if (!hop.sPos && hop.sCode) hop.sPos = response.airportsByCode[hop.sCode].pos;
                        if (!hop.tPos && hop.tCode) hop.tPos = response.airportsByCode[hop.tCode].pos;

                        path.push(getLatLng(hop.sPos));
                        path.push(getLatLng(hop.tPos));
                    }
                }
            }
            else
            {
                if (!segment.sPos && segment.sCode) segment.sPos = response.airportsByCode[segment.sCode].pos;
                if (!segment.tPos && segment.tCode) segment.tPos = response.airportsByCode[segment.tCode].pos;

                path.push(getLatLng(segment.sPos));
                path.push(getLatLng(segment.tPos));
            }

            var poly = new google.maps.Polyline({ strokeColor: color, strokeOpacity: 1, strokeWeight: 3, map: map, path: path, geodesic: geodesic });

            mapContent.push(poly);
        }
    }

    function zoomToRoutePath(map, response, route)
    {
        var bounds = new google.maps.LatLngBounds();

        for (var s = 0; s < route.stops.length; s++)
        {
            var stop = route.stops[s];
            var pos = getLatLng(stop.pos);

            bounds.extend(pos);
        }

        map.fitBounds(bounds);
    }

    function getPathGeodesic(segment)
    {
        return segment.kind == "flight";
    }

    function getPathColor(segment)
    {
        switch (segment.kind)
        {
            case "flight": return "#04c9a6";
            case "train": return "#734286";
            case "bus": return "#e47225";
            case "ferry": return "#2ebad3";
            case "taxi": return "#ffad00";
            case "walk": return "#e0043b";
            default: return "#909090";
        }
    }

    function getLatLng(pos)
    {
        var fields = pos.split(",");
        var lat = parseFloat(fields[0]);
        var lng = parseFloat(fields[1]);

        return new google.maps.LatLng(lat, lng);
    }

    return my;

} (r2r || {}, window, document));