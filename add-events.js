const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://sportograf:sportograf@cluster0.luj7tfc.mongodb.net/crew-events?retryWrites=true&w=majority";

// Parse the event data
const eventData = [
  // May 2025
  { title: "RBC BROOKLYN HALF", startDate: "2025-05-16", endDate: "2025-05-16", location: "NEW YORK, NY" },
  { title: "SPARTAN CLEVELAND TRIFECTA", startDate: "2025-05-16", endDate: "2025-05-17", location: "WINDHAM, OH" },
  { title: "SPARTAN AUSTIN", startDate: "2025-05-16", endDate: "2025-05-17", location: "BURNET, TX" },
  { title: "SPARTAN BIG BEAR TRIFECTA", startDate: "2025-05-16", endDate: "2025-05-17", location: "BIG BEAR LAKE, CA" },
  { title: "HYROX OTTAWA", startDate: "2025-05-16", endDate: "2025-05-17", location: "OTTAWA, ON" },
  { title: "LIFETIME CHICAGO SPRING HALF", startDate: "2025-05-17", endDate: "2025-05-17", location: "CHICAGO, IL" },
  { title: "MARINE CORPS HISTORIC HALF MARATHON", startDate: "2025-05-17", endDate: "2025-05-17", location: "WASHINGTON, DC" },
  { title: "GFNY WORLD CHAMPS NYC", startDate: "2025-05-17", endDate: "2025-05-17", location: "NEW YORK, NY" },
  { title: "TOUGH MUDDER PHILLY", startDate: "2025-05-23", endDate: "2025-05-23", location: "COATESVILLE, PA" },
  { title: "SPARTAN TORONTO", startDate: "2025-05-23", endDate: "2025-05-24", location: "ORONO, ON" },
  { title: "M&T BANK VERMONT CITY MARATHON & RELAY", startDate: "2025-05-24", endDate: "2025-05-24", location: "BURLINGTON, VT" },
  { title: "LIFETIME UNBOUND GRAVEL", startDate: "2025-05-29", endDate: "2025-05-30", location: "EMPORIA, KANSAS" },
  { title: "SUNBURST RACES", startDate: "2025-05-30", endDate: "2025-05-30", location: "SOUTH BEND, IN" },
  { title: "SPARTAN COLORADO SPRING TRIFECTA", startDate: "2025-05-30", endDate: "2025-05-31", location: "FORT CARSON, CO" },
  { title: "SPARTAN MONTEREY", startDate: "2025-05-30", endDate: "2025-05-31", location: "SALINAS, CA" },
  { title: "DENVER DEKA FIT & ULTRA", startDate: "2025-05-30", endDate: "2025-05-30", location: "AURORA, CO" },
  { title: "HYROX NEW YORK", startDate: "2025-05-28", endDate: "2025-06-01", location: "NEW YORK, NY" },
  { title: "HYROX NEW YORK", startDate: "2025-06-03", endDate: "2025-06-07", location: "NEW YORK, NY" },
  
  // June 2025
  { title: "SPARTAN CINCINNATI TRIFECTA", startDate: "2025-06-06", endDate: "2025-06-07", location: "LAWRENCEBURG, IN" },
  { title: "SPARTAN TRI-STATE NY", startDate: "2025-06-06", endDate: "2025-06-07", location: "BETHEL, NY" },
  { title: "BANK OF AMERICA CHICAGO 13.1", startDate: "2025-06-07", endDate: "2025-06-07", location: "CHICAGO, IL" },
  { title: "TOUGH MUDDER MICHIGAN", startDate: "2025-06-13", endDate: "2025-06-13", location: "OXFORD, MI" },
  { title: "SPARTAN TREMBLANT TRIFECTA", startDate: "2025-06-13", endDate: "2025-06-14", location: "MONT TREMBLANT, QC" },
  { title: "GRANDMAS MARATHON", startDate: "2025-06-20", endDate: "2025-06-20", location: "DULUTH, MN" },
  { title: "WHITEWATER TRAIL CHALLENGE", startDate: "2025-06-20", endDate: "2025-06-20", location: "WHITEWATER, WI" },
  { title: "SPARTAN NEW ENGLAND", startDate: "2025-06-27", endDate: "2025-06-28", location: "BARRE, MA" },
  { title: "TOUGH MUDDER TWIN CITIES", startDate: "2025-06-27", endDate: "2025-06-27", location: "HUGO, MN" },
  { title: "MISSOULA MARATHON & HALF MARATHON", startDate: "2025-06-28", endDate: "2025-06-28", location: "MISSOULA, MT" },
  
  // July 2025
  { title: "CHICAGO DEKA FIT & ULTRA", startDate: "2025-07-10", endDate: "2025-07-12", location: "CHICAGO, IL" },
  { title: "SPARTAN POCONOS", startDate: "2025-07-11", endDate: "2025-07-12", location: "PALMERTON, PA" },
  { title: "SPARTAN UTAH TRIFECTA", startDate: "2025-07-11", endDate: "2025-07-12", location: "HUNTSVILLE, UT" },
  { title: "SPARTAN MICHIGAN", startDate: "2025-07-18", endDate: "2025-07-19", location: "BELMONT, MI" },
  { title: "BOSTON DEKA FIT & ULTRA", startDate: "2025-07-24", endDate: "2025-07-26", location: "BOSTON, MA" },
  
  // August 2025
  { title: "SPARTAN ASHEVILLE", startDate: "2025-08-01", endDate: "2025-08-02", location: "MILL SPRING, NC" },
  { title: "TOUGH MUDDER INDIANA", startDate: "2025-08-01", endDate: "2025-08-01", location: "COLUMBUS, IN" },
  { title: "PHILADELPHIA DEKA FIT & ULTRA", startDate: "2025-08-07", endDate: "2025-08-09", location: "PHILADELPHIA, PA" },
  { title: "LAKE PLACID TRAIL CHALLENGE", startDate: "2025-08-08", endDate: "2025-08-08", location: "LAKE PLACID, NY" },
  { title: "SPARTAN BOISE", startDate: "2025-08-08", endDate: "2025-08-09", location: "PAYETTE, ID" },
  { title: "SPARTAN RED DEER TRIFECTA", startDate: "2025-08-08", endDate: "2025-08-09", location: "RED DEER, AB" },
  { title: "SPARTAN HAWAII TRIFECTA", startDate: "2025-08-15", endDate: "2025-08-16", location: "WAIALUA, HI" },
  { title: "RALEIGH DEKA FIT & ULTRA", startDate: "2025-08-22", endDate: "2025-08-23", location: "RALEIGH, NC" },
  { title: "SPARTAN OTTAWA", startDate: "2025-08-22", endDate: "2025-08-23", location: "CALABOGIE, ON" },
  { title: "SPARTAN PHILADELPHIA STADION", startDate: "2025-08-29", endDate: "2025-08-29", location: "PHILADELPHIA, PA" },
  { title: "SPARTAN NORCAL", startDate: "2025-08-29", endDate: "2025-08-30", location: "ELK GROVE, CA" },
  { title: "SPARTAN WEST VIRGINIA TRIFECTA", startDate: "2025-08-29", endDate: "2025-08-30", location: "GLEN JEAN, WV" },
  { title: "TOUGH MUDDER CHICAGO", startDate: "2025-08-29", endDate: "2025-08-29", location: "ROCKFORD, IL" },
  
  // September 2025
  { title: "HYROX WASHINGTON D.C.", startDate: "2025-09-03", endDate: "2025-09-07", location: "WASHINGTON, DC" },
  { title: "FT LAUDERDALE DEKA FIT & ULTRA", startDate: "2025-09-12", endDate: "2025-09-13", location: "FT LAUDERDALE, FL" },
  { title: "SPARTAN ANGEL STADIUM STADION", startDate: "2025-09-12", endDate: "2025-09-12", location: "ANAHEIM, CA" },
  { title: "TOUGH MUDDER TORONTO", startDate: "2025-09-12", endDate: "2025-09-12", location: "COURTLAND, ON" },
  { title: "TOUGH MUDDER BIG BEAR", startDate: "2025-09-12", endDate: "2025-09-12", location: "BIG BEAR LAKE, CA" },
  { title: "SPARTAN LONDON", startDate: "2025-09-13", endDate: "2025-09-13", location: "COURTLAND, ON" },
  { title: "HYROX SALT LAKE CITY", startDate: "2025-09-18", endDate: "2025-09-20", location: "SALT LAKE CITY, UT" },
  { title: "SPARTAN VERMONT", startDate: "2025-09-19", endDate: "2025-09-20", location: "KILLINGTON, VT" },
  { title: "SPARTAN SEATTLE NORTH TRIFECTA", startDate: "2025-09-19", endDate: "2025-09-20", location: "MONROE, WA" },
  { title: "GFNY PITTSBURGH", startDate: "2025-09-20", endDate: "2025-09-20", location: "PITTSBURGH, PA" },
  { title: "NEW YORK DEKA FIT & ULTRA", startDate: "2025-09-26", endDate: "2025-09-27", location: "TBD, NY" },
  { title: "SPARTAN MIDWEST TRIFECTA", startDate: "2025-09-26", endDate: "2025-09-27", location: "ATTICA, IN" },
  { title: "SPARTAN TEMECULA", startDate: "2025-09-26", endDate: "2025-09-27", location: "LAKE ELSINORE, CA" },
  { title: "TOUGH MUDDER COLORADO", startDate: "2025-09-26", endDate: "2025-09-26", location: "FORT CARSON, CO" },
  { title: "SAN JOSE TRAIL CHALLENGE", startDate: "2025-09-27", endDate: "2025-09-27", location: "SARATOGA, CA" },
  
  // October 2025
  { title: "HYROX TORONTO", startDate: "2025-10-01", endDate: "2025-10-04", location: "TORONTO, ON" },
  { title: "SPARTAN LAS VEGAS", startDate: "2025-10-03", endDate: "2025-10-04", location: "HENDERSON, NV" },
  { title: "SPARTAN NASHVILLE", startDate: "2025-10-03", endDate: "2025-10-04", location: "LEBANON, TN" },
  { title: "TOUR OF THE WHITE MOUNTAINS", startDate: "2025-10-03", endDate: "2025-10-03", location: "PINETOP-LAKESIDE, AZ" },
  { title: "GFNY MARYLAND CAMBRIDGE", startDate: "2025-10-04", endDate: "2025-10-04", location: "CAMBRIDGE, MD" },
  { title: "HYROX BOSTON", startDate: "2025-10-08", endDate: "2025-10-11", location: "BOSTON, MA" },
  { title: "SPARTAN ORLANDO", startDate: "2025-10-10", endDate: "2025-10-11", location: "ORLANDO, FL" },
  { title: "SPARTAN DALLAS TRIFECTA", startDate: "2025-10-17", endDate: "2025-10-18", location: "GRANBURY, TX" },
  { title: "TOUGH MUDDER NASHVILLE", startDate: "2025-10-17", endDate: "2025-10-17", location: "LEBANON, TN" },
  { title: "SPARTAN BLUE MOUNTAIN", startDate: "2025-10-17", endDate: "2025-10-18", location: "BLUE MOUNTAINS, ON" },
  { title: "GFNY BAHAMAS", startDate: "2025-10-18", endDate: "2025-10-18", location: "NASSAU, BAHAMAS" },
  { title: "HYROX TAMPA", startDate: "2025-10-23", endDate: "2025-10-25", location: "TAMPA, FL" },
  { title: "SPARTAN VIRGINIA", startDate: "2025-10-24", endDate: "2025-10-25", location: "MASSANUTTEN, VA" },
  { title: "GFNY FLORIDA HARDEE", startDate: "2025-10-25", endDate: "2025-10-25", location: "HARDEE, FL" },
  { title: "SPARTAN TRI-STATE NY", startDate: "2025-10-31", endDate: "2025-11-01", location: "NEW HAMPTON, NY" },
  { title: "TORONTO DEKA FIT & ULTRA", startDate: "2025-10-31", endDate: "2025-10-31", location: "MISSISSAUGA, ON" },
  
  // November 2025
  { title: "SPARTAN CENTRAL CALIFORNIA TRIFECTA", startDate: "2025-11-07", endDate: "2025-11-08", location: "SANTA MARGARITA, CA" },
  { title: "SPARTAN FENWAY STADIUM", startDate: "2025-11-07", endDate: "2025-11-08", location: "BOSTON, MA" },
  { title: "HYROX DENVER", startDate: "2025-11-12", endDate: "2025-11-15", location: "DENVER, CO" },
  { title: "HYROX DALLAS", startDate: "2025-11-18", endDate: "2025-11-22", location: "DALLAS, TX" },
  { title: "SPARTAN PHOENIX TRIFECTA", startDate: "2025-11-21", endDate: "2025-11-22", location: "AVONDALE, AZ" },
  { title: "SPARTAN SAN ANTONIO TRIFECTA", startDate: "2025-11-21", endDate: "2025-11-22", location: "DEVINE, TX" },
  { title: "SPARTAN CAROLINAS TRIFECTA", startDate: "2025-11-21", endDate: "2025-11-22", location: "NEWBERRY, SC" },
  
  // December 2025
  { title: "HYROX ANAHEIM", startDate: "2025-12-04", endDate: "2025-12-06", location: "ANAHEIM, CA" },
  { title: "HYROX NASHVILLE", startDate: "2025-12-10", endDate: "2025-12-13", location: "NASHVILLE, TN" },
  { title: "SPARTAN CENTRAL FLORIDA TRIFECTA", startDate: "2025-12-19", endDate: "2025-12-20", location: "SEBRING, FL" },
  { title: "HYROX VANCOUVER", startDate: "2025-12-18", endDate: "2025-12-20", location: "VANCOUVER, BC" }
];

async function addEvents() {
  try {
    const client = new MongoClient(uri);
    console.log('Connecting to MongoDB...');
    
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db('crew-events');
    const eventsCollection = db.collection('events');
    
    let created = 0;
    let skipped = 0;
    let errors = [];
    
    for (const event of eventData) {
      try {
        // Check if event already exists by title and date
        const existingEvent = await eventsCollection.findOne({
          title: event.title,
          startDate: new Date(event.startDate)
        });
        
        if (existingEvent) {
          console.log(`⚠️  Skipped: ${event.title} (${event.startDate}) - already exists`);
          skipped++;
          continue;
        }
        
        // Create the event
        const newEvent = {
          title: event.title,
          description: null,
          location: event.location,
          startDate: new Date(event.startDate),
          endDate: event.endDate ? new Date(event.endDate) : null,
          maxCapacity: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await eventsCollection.insertOne(newEvent);
        console.log(`✅ Created: ${event.title} (${event.startDate})`);
        created++;
        
      } catch (error) {
        console.error(`❌ Error creating ${event.title}:`, error.message);
        errors.push(`${event.title}: ${error.message}`);
      }
    }
    
    await client.close();
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Created: ${created} events`);
    console.log(`⚠️  Skipped: ${skipped} events`);
    console.log(`❌ Errors: ${errors.length} events`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

addEvents();
