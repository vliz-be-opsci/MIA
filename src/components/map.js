//this file will contain a class that will be used to create a leaflet map

class Map {
    constructor(mia_entity){
        this.mia_entity = mia_entity;
        this.map = this.createDefaultMap();
        
    }

    createDefaultMap(){
        //create default leaflet map and set it as this.map
        return `<div id="map"></div>`;
    }

    //function that will set view of the map
    setView(lat, long, zoom, map){
        //set the view
        map.setView([lat, long], zoom);
    }

    async initMap(lat, long, zoom){
        let map = L.map('map');
        //add the tile layer
        this.addTileLayer(map);
        //set the view
        this.setView(lat, long, zoom, map);
        //add the points to the map
        this.addPointsToMap(map);
        // add polygons to the map
        this.addGeometryToMap(map);
    }

    addTileLayer(map){
        //add the tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
        }).addTo(map);
    }

    //function that will add a marker to the map if any can be found in the linked data
    //TODO: put all the possible predicates in a seperate mapping and put the cleanup of the string in a seperate function
    addPointsToMap(map){
        //first make an array that will contain all the points info
        let points = [];
        //get the triples and loop over the triples and see if any of them have the predicate https://schema.org#geo or https://schema.org#location or https://www.w3.org/ns/dcat#centroid
        let triples = this.mia_entity.linked_data.triples;
        for (let i = 0; i < triples.length; i++) {
            const triple = triples[i];
            //check if the subject of the triple is the entity
            //make another constant that is the other version being https or http
            if (triple.subject === this.mia_entity.entity || triple.subject === this.mia_entity.entity.replace('http', 'https') || triple.subject === this.mia_entity.entity.replace('https', 'http')) {
                //check if the predicate is rdf:type
                console.log(triple.predicate);
                if (
                    triple.predicate === "https://schema.org#geo" || 
                    triple.predicate === "https://schema.org#location" || 
                    triple.predicate === "https://www.w3.org/ns/dcat#centroid" ||
                    triple.predicate === "http://schema.org#geo" || 
                    triple.predicate === "http://schema.org#location" || 
                    triple.predicate === "http://www.w3.org/ns/dcat#centroid"
                    ) {
                    //add the object to the array
                    points.push(triple.object);
                }
            }
        }
        console.log(points);
        //go over the points array and check if lat and lon can be extracted from the point
        let points_with_lat_lon = [];
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            // the point should look like <http://www.opengis.net/def/crs/OGC/1.3/CRS84> POINT (1.82138 50.465)
            //split the string on POINT
            const point_split = point.split('POINT ');
            console.log(point_split);
            //if the length of the array is 2 then there is a lat and lon
            if(point_split.length === 2){
                //get the lat and lon
                const lat_lon = point_split[1];
                //split the lat_lon string on a space
                const lat_lon_split = lat_lon.split(' ');
                console.log(lat_lon_split);
                //if the length of the array is 2 then there is a lat and lon
                if(lat_lon_split.length === 2){
                    //get the lat and lon
                    let lat = lat_lon_split[1];
                    let lon = lat_lon_split[0];
                    //clean up the lat and lon from (,) and space
                    lat = lat.replace('(','');
                    lat = lat.replace(')','');
                    lat = lat.replace(',','');
                    lon = lon.replace('(','');
                    lon = lon.replace(')','');
                    lon = lon.replace(',','');
                    //add the lat and lon to the points_with_lat_lon array
                    points_with_lat_lon.push([lat, lon]);
                }
            }
        }
        console.log(points_with_lat_lon);

        //go over the points_with_lat_lon array and add a marker to the map for each point
        for (let i = 0; i < points_with_lat_lon.length; i++) {
            const point = points_with_lat_lon[i];
            //create a marker
            const marker = L.marker(point).addTo(map);
            //add a popup to the marker
            marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
        }
    }

    addGeometryToMap(map){
        let geoms = [];
        //check if any of the triples predicates are http://www.w3.org/ns/dcat#bbox and if so get the object
        let triples = this.mia_entity.linked_data.triples;
        for (let i = 0; i < triples.length; i++) {
            const triple = triples[i];
            //check if the subject of the triple is the entity
            //make another constant that is the other version being https or http
            if (triple.subject === this.mia_entity.entity || triple.subject === this.mia_entity.entity.replace('http', 'https') || triple.subject === this.mia_entity.entity.replace('https', 'http')) {
                //check if the predicate is rdf:type
                console.log(triple.predicate);
                if (
                    triple.predicate === "https://www.w3.org/ns/dcat#bbox" ||
                    triple.predicate === "http://www.w3.org/ns/dcat#bbox"
                    ) {
                    //add the object to the array
                    geoms.push(triple.object);
                }
            }
        }

        //go over the geoms array and check if lat and lon can be extracted from the geom
        let geoms_with_lats_lons = [];
        //the string per GEAM should look like <http://XXX> POLYGON ((1.84531 50.47689,1.79745 50.47689,1.79745 50.45311,1.84531 50.45311,1.84531 50.47689))
        //split the string on POLYGON and get the lats lons into > [[lat1,lon1],[lat2,lon2],[lat3,lon3],[lat4,lon4],...] 
        for (let i = 0; i < geoms.length; i++) {
            let to_add_to_geoms_with_lats_lons = [];
            const geom = geoms[i];
            //split the string on POLYGON
            const geom_split = geom.split('POLYGON ');
            //if the length of the array is 2 then there is a lat and lon
            if(geom_split.length === 2){
                //get the lat and lon
                const polygon_string = geom_split[1];
                //split polygon_string on a comma
                const polygon_string_split = polygon_string.split(',');
                //go over the polygon_string_split array and split each string on a space
                for (let i = 0; i < polygon_string_split.length; i++) {
                    const polygon_string = polygon_string_split[i];
                    //split the string on a space
                    const latlon_string_split = polygon_string.split(' ');
                    //if the length of the array is 2 then there is a lat and lon
                    if(latlon_string_split.length === 2){
                        //get the lat and lon
                        let lat = latlon_string_split[1];
                        let lon = latlon_string_split[0];
                        //clean up the lat and lon from (,) and space
                        lat = lat.replaceAll('(','');
                        lat = lat.replaceAll(')','');
                        lat = lat.replaceAll(',','');
                        lon = lon.replaceAll('(','');
                        lon = lon.replaceAll(')','');
                        lon = lon.replaceAll(',','');
                        console.log(lat, lon);
                        //add the lat and lon to the points_with_lat_lon array
                        to_add_to_geoms_with_lats_lons.push([lat, lon]);
                    }
                }
                geoms_with_lats_lons.push(to_add_to_geoms_with_lats_lons);
            }
        }
        console.log(geoms_with_lats_lons);
        //go over the geoms_with_lats_lons array and add a polygon to the map for each geom
        for (let i = 0; i < geoms_with_lats_lons.length; i++) {
            const geom = geoms_with_lats_lons[i];
            //create a polygon
            const polygon = L.polygon(geom).addTo(map);
            //add a popup to the polygon
            polygon.bindPopup("<b>GEOM HERE</b><br>");
        }
    }

}

export default Map;