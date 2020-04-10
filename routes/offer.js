const express = require("express");
const cloudinary = require("cloudinary");
const router = express.Router();
const Offer = require("../models/Offer.js");
const isAuthenticated = require("../middlewares/isAuthenticated");
const formidableMiddleware = require("express-formidable");
router.use(formidableMiddleware());

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// CREATE
router.put("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    if (Object.keys(req.files).length > 0) {
      cloudinary.v2.uploader.upload(
        req.files.file.path,
        async (error, result) => {
          if (error) {
            return res.json({ error: error.message });
          } else {
            const obj = {
              title: req.fields.title,
              description: req.fields.description,
              price: req.fields.price,
              picture: result,
              creator: req.user
            };
            const offer = new Offer(obj);
            await offer.save();

            res.json({
              _id: offer._id,
              title: offer.title,
              description: offer.description,
              price: offer.price,
              picture: offer.picture,
              created: offer.created,
              creator: {
                account: offer.creator.account,
                _id: offer.creator._id
              }
            });
          }
        }
      );
    } else {
      const obj = {
        title: req.fields.title,
        description: req.fields.description,
        price: req.fields.price,
        creator: req.user
      };
      const offer = new Offer(obj);
      await offer.save();

      res.json({
        _id: offer._id,
        title: offer.title,
        description: offer.description,
        price: offer.price,
        picture: offer.picture,
        created: offer.created,
        creator: {
          account: offer.creator.account,
          _id: offer.creator._id
        }
      });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

// fonction qui va construire un objet de filtres, que l'on enverra ensuite dans le find()
const createFilters = req => {
  const filters = {};
  if (req.query.priceMin) {
    filters.price = {};
    filters.price.$gte = req.query.priceMin;
  }
  if (req.query.priceMax) {
    if (filters.price === undefined) {
      filters.price = {};
    }
    filters.price.$lte = req.query.priceMax;
  }

  if (req.query.title) {
    filters.title = new RegExp(req.query.title, "i");
  }
  return filters;
};

// READ
router.get("/offer/with-count", async (req, res) => {
  try {
    const filters = createFilters(req);
    const search = Offer.find(filters);
    const count = (await Offer.find()).length;

    if (req.query.sort === "price-asc") {
      // Ici, nous continuons de construire notre recherche
      search.sort({ price: 1 });
    } else if (req.query.sort === "price-desc") {
      // Ici, nous continuons de construire notre recherche
      search.sort({ price: -1 });
    }
    // limit : le nombre de résultats affichés
    // skip : Ignorer les X premiers

    const limit = Number(req.query.limit);
    const skip = Number(req.query.skip);
    search.limit(limit).skip(skip);

    const offers = await search
      .populate({
        path: "creator",
        select: "account"
      })
      .sort({ created: -1 });
    console.log(offers);
    res.json({ count: count, offers: offers });
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const offer = await Offer.findOne({ _id: id }).populate({
      path: "creator",
      select: "account"
    });
    res.json(offer);
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
