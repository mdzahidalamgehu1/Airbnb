const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
app.set("view engine", "ejs");
const path = require("path");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connecction successful");
  })
.catch ((err) => {
  console.log(err);
})

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
  res.send("Hi, i am root");
});

const validatelisting = (req, res, next) =>{
  let {error} = listingSchema.validate(req.body);

  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(404, errMsg);
  } else {
    next();
  }
};

app.get("/listings", wrapAsync(async (req, res) =>{
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", {allListing});
}))

//New Route
app.get("/listings/new", (req, res) =>{
  res.render("listings/new.ejs");
})


//show route
app.get("/listings/:id", wrapAsync(async(req, res) =>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs",{listing})
}))

//create route
app.post("/listings", validatelisting, wrapAsync(async (req, res, next) =>{
  let result = listingSchema.validate(req.body);
  console.log(result);
  if(result.error){
    throw new ExpressError(404, result.error);
  }      
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

//edit
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", {listing});
}))

 //update 
app.put("/listings/:id", validatelisting, wrapAsync(async (req, res) =>{
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, req.body.listing);
  res.redirect(`/listings/${id}`);
}));

//Delete
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let {id} = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings")
}))
// app.get("/testListing", (req, res) =>{
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "by the beach",
//     price: 1200,
//     location : "calcutta",
//     country: "india",
//   })
//   sampleListing.save();
// })

app.use((req, res, next)=>{
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) =>{
  let {statusCode = 404, message = "Something went Wrong!"} = err;
  res.status(statusCode).render("error.ejs", { message});
})

app.listen(8080, () => {
  console.log("server is running to port 8080");
});