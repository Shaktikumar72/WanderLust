const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const path = require("path");
const   ExpressError = require("./utils/ExpressError.js");
// const listing=require("./models/listing.js");

const Mongo_url = "mongodb://127.0.0.1:27017/Wanderlust";

main()
  .then(() => {
    console.log("connection to db");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

async function main() {
 await mongoose.connect(Mongo_url);
}

app.get("/", (req, res) => {
  res.send("hi, I am root");
});

// index Route
app.get("/listings",wrapAsync (async (req, res) => {
  const allListings = await Listing.find({});
  console.log(allListings);
  
  res.render("listings/index", { allListings });
}));

//new Route
app.get("/listings/new",wrapAsync (async (req, res) => {
  res.render("listings/new");
}));

//show Route
app.get("/listings/:id",wrapAsync (async (req, res) => {
  let { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
const listing = await Listing.findById(id);

if(!listing){
  return res.send("Listing not found");
}

res.render("listings/show", { listing });
}));

//Create Route
app.post("/listings",wrapAsync (async (req, res, next) => {
  if(!req.body.Listing){
   throw new ExpressError(400,"send the valid data for listing");
  }
  const newListing = new Listing(req.body.listing);
await newListing.save();
  res.redirect("/listings");
})
);

//edit Route
app.get("/listings/:id/edit",wrapAsync ( async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit", { listing });
}));

//update Route
app.put("/listings/:id",wrapAsync ( async (req, res) => {
  let { id } = req.params;
  console.log({...req.body.listing});
   if(!req.body.Listing){
   throw new ExpressError(400,"send the valid data for listing")
  }
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect("/listings");
}));

//Delete Route
app.delete("/listings/:id",wrapAsync ( async (req, res) => {
  let { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  res.redirect("/listings");
}));

app.get("/testlisting",wrapAsync (async (req,res)=>{
      let Samplelisting=new Listing({
        title: "my new villa",
        description: "By the beach",
        price: 1200,
        location: "calangute Goa",
        country: "india",
      });
      await Samplelisting.save();
      console.log("sample was saved:");
      res.send("successful testing");
}));
// app.use((err,req,res,next)=>{
//     res.render("samthing went wrong")
// });

app.all("*",(res,req,next)=>{
  next(new ExpressError (404, "Page Not Found"));
})

app.use((err, req, res, next) => {
//  let{statusCode, message} =err;
let{statusCode=500, message="something went wrong!"} =err;
 res.render("listings/error",{message});
//  res.status(statusCode).send(message);
  
});

app.listen(8000, () => {
  console.log("server is listening part :8000");
});
