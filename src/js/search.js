var r2r = (function (my, window, document)
{

    my.Search = function ()
    {
    }

    my.Search.prototype.start = function (from, to, callback)
    {
        var request = new XMLHttpRequest();

        request.onreadystatechange = function ()
        {
            if (request.readyState == 4 && request.status == 200)
            {
                var json = JSON.parse(request.responseText);
                indexJson(json);

                callback(json);
            }
        }

        var oName = encodeURIComponent(from.name);
        var oPos = from.geometry.location.lat() + "," + from.geometry.location.lng();
        var dName = encodeURIComponent(to.name);
        var oKind = from.types[0];
        var dPos = to.geometry.location.lat() + "," + to.geometry.location.lng();
        var dKind = to.types[0];
        var url = "http://free.rome2rio.com/api/1.2/json/Search?key=a0MLD1JD" +
            "&oName=" + oName +
            "&oPos=" + oPos +
            "&oKind=" + oKind +
            "&dName=" + dName +
            "&dPos=" + dPos +
            "&dKind=" + dKind;

        request.open("get", url);
        request.send();
    }

    function indexJson(json)
    {
        json.airportsByCode = [];
        for (var a = 0; a < json.airports.length; a++)
        {
            var airport = json.airports[a];
            json.airportsByCode[airport.code] = airport;
        }
    }

    return my;

} (r2r || {}, window, document));