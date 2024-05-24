const express = require("express");

const router = express.Router();

const fileupload = require("express-fileupload");

const cloudinary = require("cloudinary").v2;

// fileupload() // c'est mon middleware

//import de mes modèles
const Offer = require("../models/Offer");

//import de ma fonction utils
const convertToBase64 = require("../utils/convertToBase64");

// import de mon middleware
const isAuthenticated = require("../middlewares/isAuthenticated");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileupload(),
  async (req, res) => {
    try {
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      // const pictureData = await cloudinary.uploader.upload(
      //   convertToBase64(req.files.picture)
      // );

      // console.log(pictureData);

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ÉTAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        // product_image: pictureData,
        owner: req.user,
      });

      console.log(newOffer);

      await newOffer.save();

      res.status(201).json(newOffer);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    // const offers = await Offer.find().select("product_price product_name -_id");

    const { title, priceMin, priceMax, sort, page } = req.query;

    const filter = {};

    // si j'ai title  alors je dois faire find({product_name : new RegExp(title,"i")})

    if (title) {
      filter.product_name = new RegExp(title, "i"); // filter devient :
      // {product_name : new RegExp(title,"i")}
    }

    // si j'ai pas de title => je veux faire un find classique : find() / find({})

    // GESTION DES BORNES SUPP ET INF
    // { product_price: { $gte: 100 }}

    // priceMin = ? priceMax =  100

    // si priceMin existe alors je crée la clé product_price =>
    if (priceMin) {
      filter.product_price = { $gte: priceMin };
    }

    // si priceMin existe et priceMax alors je voudrais =>{ $gte: priceMin, $lte: priceMax }

    // si priceMax existe =>
    if (priceMax) {
      // si priceMin existe et donc la clé product_price existe =>
      if (filter.product_price) {
        filter.product_price.$lte = priceMax;
      } else {
        // sinon je crée la clé product_price =>
        filter.product_price = { $lte: priceMax };
      }
    }

    // console.log(filter);

    const sortFilter = {};

    if (sort === "price-desc") {
      sortFilter.product_price = -1; // { product_price : -1}
    } else if (sort === "price-asc") {
      sortFilter.product_price = 1; // { product_price : 1}
    }

    const limit = 5;

    let pageNumber = 1;

    // si j'ai reçu une page alors => pageNumber prend sa valeur
    if (page) {
      pageNumber = page;
    }

    // si page 2 => skip 5 // si page 3 => 10 // page 4 skip => 15

    // number to skip => (page - 1) * limit

    const numberToSkip = (pageNumber - 1) * limit;

    const offers = await Offer.find(filter)
      .sort(sortFilter)
      .limit(limit)
      .skip(numberToSkip)
      .populate("owner", "account");
    // .select("product_price product_name -_id");

    res.json(offers);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
