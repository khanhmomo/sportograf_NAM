// Migration script for 2026 events from Google Form
const events = [
  // May 2026
  { id: "EVENT-2026-001", title: "RBC BROOKLYN HALF", startDate: "2026-05-16", endDate: "2026-05-16", location: "NEW YORK, NY" },
  { id: "EVENT-2026-002", title: "SPARTAN CLEVELAND TRIFECTA", startDate: "2026-05-16", endDate: "2026-05-17", location: "WINDHAM, OH" },
  { id: "EVENT-2026-003", title: "SPARTAN AUSTIN", startDate: "2026-05-16", endDate: "2026-05-17", location: "BURNET, TX" },
  { id: "EVENT-2026-004", title: "SPARTAN BIG BEAR TRIFECTA", startDate: "2026-05-16", endDate: "2026-05-17", location: "BIG BEAR LAKE, CA" },
  { id: "EVENT-2026-005", title: "HYROX OTTAWA", startDate: "2026-05-16", endDate: "2026-05-17", location: "OTTAWA, ON" },
  { id: "EVENT-2026-006", title: "LIFETIME CHICAGO SPRING HALF", startDate: "2026-05-17", endDate: "2026-05-17", location: "CHICAGO, IL" },
  { id: "EVENT-2026-007", title: "MARINE CORPS HISTORIC HALF MARATHON", startDate: "2026-05-17", endDate: "2026-05-17", location: "WASHINGTON, DC" },
  { id: "EVENT-2026-008", title: "GFNY WORLD CHAMPS NYC", startDate: "2026-05-17", endDate: "2026-05-17", location: "NEW YORK, NY" },
  { id: "EVENT-2026-009", title: "TOUGH MUDER PHILLY", startDate: "2026-05-23", endDate: "2026-05-23", location: "COATESVILLE, PA" },
  { id: "EVENT-2026-010", title: "SPARTAN TORONTO", startDate: "2026-05-23", endDate: "2026-05-24", location: "ORONO, ON" },
  { id: "EVENT-2026-011", title: "M&T BANK VERMONT CITY MARATHON & RELAY", startDate: "2026-05-24", endDate: "2026-05-24", location: "BURLINGTON, VT" },
  { id: "EVENT-2026-012", title: "LIFETIME UNBOUND GRAVEL", startDate: "2026-05-29", endDate: "2026-05-30", location: "EMPORIA, KANSAS" },
  { id: "EVENT-2026-013", title: "SUNBURST RACES", startDate: "2026-05-30", endDate: "2026-05-30", location: "SOUTH BEND, IN" },
  { id: "EVENT-2026-014", title: "SPARTAN COLORADO SPRING TRIFECTA", startDate: "2026-05-30", endDate: "2026-05-31", location: "FORT CARSON, CO" },
  { id: "EVENT-2026-015", title: "SPARTAN MONTEREY", startDate: "2026-05-30", endDate: "2026-05-31", location: "SALINAS, CA" },
  { id: "EVENT-2026-016", title: "DENVER DEKA FIT & ULTRA", startDate: "2026-05-30", endDate: "2026-05-30", location: "AURORA, CO" },
  { id: "EVENT-2026-017", title: "HYROX NEW YORK", startDate: "2026-05-28", endDate: "2026-06-01", location: "NEW YORK, NY" },
  { id: "EVENT-2026-018", title: "HYROX NEW YORK (Session 2)", startDate: "2026-06-03", endDate: "2026-06-07", location: "NEW YORK, NY" },
  
  // June 2026
  { id: "EVENT-2026-019", title: "SPARTAN CINCINNATI TRIFECTA", startDate: "2026-06-06", endDate: "2026-06-07", location: "LAWRENCEBURG, IN" },
  { id: "EVENT-2026-020", title: "SPARTAN TRI-STATE NY", startDate: "2026-06-06", endDate: "2026-06-07", location: "BETHEL, NY" },
  { id: "EVENT-2026-021", title: "BANK OF AMERICA CHICAGO 13.1", startDate: "2026-06-07", endDate: "2026-06-07", location: "CHICAGO, IL" },
  { id: "EVENT-2026-022", title: "TOUGH MUDDER MICHIGAN", startDate: "2026-06-13", endDate: "2026-06-13", location: "OXFORD, MI" },
  { id: "EVENT-2026-023", title: "SPARTAN TREMBLANT TRIFECTA", startDate: "2026-06-13", endDate: "2026-06-14", location: "MONT TREMBLANT, QC" },
  { id: "EVENT-2026-024", title: "GRANDMAS MARATHON", startDate: "2026-06-20", endDate: "2026-06-20", location: "DULUTH, MN" },
  { id: "EVENT-2026-025", title: "WHITEWATER TRAIL CHALLENGE", startDate: "2026-06-20", endDate: "2026-06-20", location: "WHITEWATER, WI" },
  { id: "EVENT-2026-026", title: "SPARTAN NEW ENGLAND", startDate: "2026-06-27", endDate: "2026-06-28", location: "BARRE, MA" },
  { id: "EVENT-2026-027", title: "TOUGH MUDDER TWIN CITIES", startDate: "2026-06-27", endDate: "2026-06-27", location: "HUGO, MN" },
  { id: "EVENT-2026-028", title: "MISSOULA MARATHON & HALF MARATHON", startDate: "2026-06-28", endDate: "2026-06-28", location: "MISSOULA, MT" },
  
  // July 2026
  { id: "EVENT-2026-029", title: "CHICAGO DEKA FIT & ULTRA", startDate: "2026-07-10", endDate: "2026-07-12", location: "CHICAGO, IL" },
  { id: "EVENT-2026-030", title: "SPARTAN POCONOS", startDate: "2026-07-11", endDate: "2026-07-12", location: "PALMERTON, PA" },
  { id: "EVENT-2026-031", title: "SPARTAN UTAH TRIFECTA", startDate: "2026-07-11", endDate: "2026-07-12", location: "HUNTSVILLE, UT" },
  { id: "EVENT-2026-032", title: "SPARTAN MICHIGAN", startDate: "2026-07-18", endDate: "2026-07-19", location: "BELMONT, MI" },
  { id: "EVENT-2026-033", title: "BOSTON DEKA FIT & ULTRA", startDate: "2026-07-24", endDate: "2026-07-26", location: "BOSTON, MA" },
  
  // August 2026
  { id: "EVENT-2026-034", title: "SPARTAN ASHEVILLE", startDate: "2026-08-01", endDate: "2026-08-02", location: "MILL SPRING, NC" },
  { id: "EVENT-2026-035", title: "TOUGH MUDDER INDIANA", startDate: "2026-08-01", endDate: "2026-08-01", location: "COLUMBUS, IN" },
  { id: "EVENT-2026-036", title: "PHILADELPHIA DEKA FIT & ULTRA", startDate: "2026-08-07", endDate: "2026-08-09", location: "PHILADELPHIA, PA" },
  { id: "EVENT-2026-037", title: "LAKE PLACID TRAIL CHALLENGE", startDate: "2026-08-08", endDate: "2026-08-08", location: "LAKE PLACID, NY" },
  { id: "EVENT-2026-038", title: "SPARTAN BOISE", startDate: "2026-08-08", endDate: "2026-08-09", location: "PAYETTE, ID" },
  { id: "EVENT-2026-039", title: "SPARTAN RED DEER TRIFECTA", startDate: "2026-08-08", endDate: "2026-08-09", location: "RED DEER, AB" },
  { id: "EVENT-2026-040", title: "SPARTAN HAWAII TRIFECTA", startDate: "2026-08-15", endDate: "2026-08-16", location: "WAIALUA, HI" },
  { id: "EVENT-2026-041", title: "RALEIGH DEKA FIT & ULTRA", startDate: "2026-08-22", endDate: "2026-08-23", location: "RALEIGH, NC" },
  { id: "EVENT-2026-042", title: "SPARTAN OTTAWA", startDate: "2026-08-22", endDate: "2026-08-23", location: "CALABOGIE, ON" },
  { id: "EVENT-2026-043", title: "SPARTAN PHILADELPHIA STADION", startDate: "2026-08-29", endDate: "2026-08-29", location: "PHILADELPHIA, PA" },
  { id: "EVENT-2026-044", title: "SPARTAN NORCAL", startDate: "2026-08-29", endDate: "2026-08-30", location: "ELK GROVE, CA" },
  { id: "EVENT-2026-045", title: "SPARTAN WEST VIRGINIA TRIFECTA", startDate: "2026-08-29", endDate: "2026-08-30", location: "GLEN JEAN, WV" },
  { id: "EVENT-2026-046", title: "TOUGH MUDDER CHICAGO", startDate: "2026-08-29", endDate: "2026-08-29", location: "ROCKFORD, IL" },
  
  // September 2026
  { id: "EVENT-2026-047", title: "HYROX WASHINGTON D.C.", startDate: "2026-09-03", endDate: "2026-09-07", location: "WASHINGTON, DC" },
  { id: "EVENT-2026-048", title: "FT LAUDERDALE DEKA FIT & ULTRA", startDate: "2026-09-12", endDate: "2026-09-13", location: "FT LAUDERDALE, FL" },
  { id: "EVENT-2026-049", title: "SPARTAN ANGEL STADIUM STADION", startDate: "2026-09-12", endDate: "2026-09-12", location: "ANAHEIM, CA" },
  { id: "EVENT-2026-050", title: "TOUGH MUDDER TORONTO", startDate: "2026-09-12", endDate: "2026-09-12", location: "COURTLAND, ON" },
  { id: "EVENT-2026-051", title: "TOUGH MUDDER BIG BEAR", startDate: "2026-09-12", endDate: "2026-09-12", location: "BIG BEAR LAKE, CA" },
  { id: "EVENT-2026-052", title: "SPARTAN LONDON", startDate: "2026-09-13", endDate: "2026-09-13", location: "COURTLAND, ON" },
  { id: "EVENT-2026-053", title: "HYROX SALT LAKE CITY", startDate: "2026-09-18", endDate: "2026-09-20", location: "SALT LAKE CITY, UT" },
  { id: "EVENT-2026-054", title: "SPARTAN VERMONT", startDate: "2026-09-19", endDate: "2026-09-20", location: "KILLINGTON, VT" },
  { id: "EVENT-2026-055", title: "SPARTAN SEATTLE NORTH TRIFECTA", startDate: "2026-09-19", endDate: "2026-09-20", location: "MONROE, WA" },
  { id: "EVENT-2026-056", title: "GFNY PITTSBURGH", startDate: "2026-09-20", endDate: "2026-09-20", location: "PITTSBURGH, PA" },
  { id: "EVENT-2026-057", title: "NEW YORK DEKA FIT & ULTRA", startDate: "2026-09-26", endDate: "2026-09-27", location: "TBD, NY" },
  { id: "EVENT-2026-058", title: "SPARTAN MIDWEST TRIFECTA", startDate: "2026-09-26", endDate: "2026-09-27", location: "ATTICA, IN" },
  { id: "EVENT-2026-059", title: "SPARTAN TEMECULA", startDate: "2026-09-26", endDate: "2026-09-27", location: "LAKE ELSINORE, CA" },
  { id: "EVENT-2026-060", title: "TOUGH MUDDER COLORADO", startDate: "2026-09-26", endDate: "2026-09-26", location: "FORT CARSON, CO" },
  { id: "EVENT-2026-061", title: "SAN JOSE TRAIL CHALLENGE", startDate: "2026-09-27", endDate: "2026-09-27", location: "SARATOGA, CA" },
  
  // October 2026
  { id: "EVENT-2026-062", title: "HYROX TORONTO", startDate: "2026-10-01", endDate: "2026-10-04", location: "TORONTO, ON" },
  { id: "EVENT-2026-063", title: "SPARTAN LAS VEGAS", startDate: "2026-10-03", endDate: "2026-10-04", location: "HENDERSON, NV" },
  { id: "EVENT-2026-064", title: "SPARTAN NASHVILLE", startDate: "2026-10-03", endDate: "2026-10-04", location: "LEBANON, TN" },
  { id: "EVENT-2026-065", title: "TOUR OF THE WHITE MOUNTAINS", startDate: "2026-10-03", endDate: "2026-10-03", location: "PINETOP-LAKESIDE, AZ" },
  { id: "EVENT-2026-066", title: "GFNY MARYLAND CAMBRIDGE", startDate: "2026-10-04", endDate: "2026-10-04", location: "CAMBRIDGE, MD" },
  { id: "EVENT-2026-067", title: "HYROX BOSTON", startDate: "2026-10-08", endDate: "2026-10-11", location: "BOSTON, MA" },
  { id: "EVENT-2026-068", title: "SPARTAN ORLANDO", startDate: "2026-10-10", endDate: "2026-10-11", location: "ORLANDO, FL" },
  { id: "EVENT-2026-069", title: "SPARTAN DALLAS TRIFECTA", startDate: "2026-10-17", endDate: "2026-10-18", location: "GRANBURY, TX" },
  { id: "EVENT-2026-070", title: "TOUGH MUDDER NASHVILLE", startDate: "2026-10-17", endDate: "2026-10-17", location: "LEBANON, TN" },
  { id: "EVENT-2026-071", title: "SPARTAN BLUE MOUNTAIN", startDate: "2026-10-17", endDate: "2026-10-18", location: "BLUE MOUNTAINS, ON" },
  { id: "EVENT-2026-072", title: "GFNY BAHAMAS", startDate: "2026-10-18", endDate: "2026-10-18", location: "NASSAU, BAHAMAS" },
  { id: "EVENT-2026-073", title: "HYROX TAMPA", startDate: "2026-10-23", endDate: "2026-10-25", location: "TAMPA, FL" },
  { id: "EVENT-2026-074", title: "SPARTAN VIRGINIA", startDate: "2026-10-24", endDate: "2026-10-25", location: "MASSANUTTEN, VA" },
  { id: "EVENT-2026-075", title: "GFNY FLORIDA HARDEE", startDate: "2026-10-25", endDate: "2026-10-25", location: "HARDEE, FL" },
  { id: "EVENT-2026-076", title: "SPARTAN TRI-STATE NY (Fall)", startDate: "2026-10-31", endDate: "2026-11-01", location: "NEW HAMPTON, NY" },
  { id: "EVENT-2026-077", title: "TORONTO DEKA FIT & ULTRA", startDate: "2026-10-31", endDate: "2026-10-31", location: "MISSISSAUGA, ON" },
  
  // November 2026
  { id: "EVENT-2026-078", title: "SPARTAN CENTRAL CALIFORNIA TRIFECTA", startDate: "2026-11-07", endDate: "2026-11-08", location: "SANTA MARGARITA, CA" },
  { id: "EVENT-2026-079", title: "SPARTAN FENWAY STADIUM", startDate: "2026-11-07", endDate: "2026-11-08", location: "BOSTON, MA" },
  { id: "EVENT-2026-080", title: "HYROX DENVER", startDate: "2026-11-12", endDate: "2026-11-15", location: "DENVER, CO" },
  { id: "EVENT-2026-081", title: "HYROX DALLAS", startDate: "2026-11-18", endDate: "2026-11-22", location: "DALLAS, TX" },
  { id: "EVENT-2026-082", title: "SPARTAN PHOENIX TRIFECTA", startDate: "2026-11-21", endDate: "2026-11-22", location: "AVONDALE, AZ" },
  { id: "EVENT-2026-083", title: "SPARTAN SAN ANTONIO TRIFECTA", startDate: "2026-11-21", endDate: "2026-11-22", location: "DEVINE, TX" },
  { id: "EVENT-2026-084", title: "SPARTAN CAROLINAS TRIFECTA", startDate: "2026-11-21", endDate: "2026-11-22", location: "NEWBERRY, SC" },
  
  // December 2026
  { id: "EVENT-2026-085", title: "HYROX ANAHEIM", startDate: "2026-12-04", endDate: "2026-12-06", location: "ANAHEIM, CA" },
  { id: "EVENT-2026-086", title: "HYROX NASHVILLE", startDate: "2026-12-10", endDate: "2026-12-13", location: "NASHVILLE, TN" },
  { id: "EVENT-2026-087", title: "SPARTAN CENTRAL FLORIDA TRIFECTA", startDate: "2026-12-19", endDate: "2026-12-20", location: "SEBRING, FL" },
  { id: "EVENT-2026-088", title: "HYROX VANCOUVER", startDate: "2026-12-18", endDate: "2026-12-20", location: "VANCOUVER, BC" }
];

console.log(`Total events to migrate: ${events.length}`);
console.log('Events parsed successfully!');

// Export for use in API or database migration
module.exports = events;
